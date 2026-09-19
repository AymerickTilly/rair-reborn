using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RairCore.Auth;
using RairCore.Data;
using RairCore.Models;

namespace RairCore.Controllers;

[ApiController]
[Authorize]
public class OrdersController(AppDbContext db) : ControllerBase
{
    private static readonly string[] Statuses = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

    // GET /orders — admins see every order, customers only their own
    [HttpGet("orders")]
    public async Task<IActionResult> GetAll()
    {
        IQueryable<Order> query = db.Orders.AsNoTracking().Include(o => o.Products);
        if (!User.IsAdmin())
        {
            var userId = User.Id();
            query = query.Where(o => o.UserId == userId);
        }

        return Ok(await query.ToListAsync());
    }

    // GET /order?orderId=abc
    [HttpGet("order")]
    public async Task<IActionResult> GetById([FromQuery] string orderId)
    {
        var order = await db.Orders.AsNoTracking().Include(o => o.Products)
            .FirstOrDefaultAsync(o => o.OrderId == orderId);

        // NotFound (not Forbid) for someone else's order so its existence isn't revealed
        if (order is null || (!User.IsAdmin() && order.UserId != User.Id())) return NotFound();
        return Ok(order);
    }

    // POST /order
    // The client only says what it wants (product, size, quantity). Names, prices and totals come from
    // the catalogue, stock is checked and decremented, and the ordered cart items are removed, all in
    // one transaction so a failed order leaves stock and cart untouched.
    [HttpPost("order")]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ShippingAddress))
            return BadRequest(new { error = "A shipping address is required." });
        if (request.Products is null || request.Products.Count == 0)
            return BadRequest(new { error = "The order has no items." });
        if (request.Products.Any(l => l.Quantity is < 1 or > 99
                || string.IsNullOrWhiteSpace(l.ProductId) || string.IsNullOrWhiteSpace(l.Size)))
            return BadRequest(new { error = "One of the order items is invalid." });

        var userId = User.Id()!;

        var productIds = request.Products.Select(l => l.ProductId).Distinct().ToList();
        var products = await db.Products.AsNoTracking()
            .Include(p => p.Stock)
            .Where(p => productIds.Contains(p.ProductId))
            .ToDictionaryAsync(p => p.ProductId);

        var lines = new List<OrderProduct>();
        foreach (var item in request.Products)
        {
            if (!products.TryGetValue(item.ProductId, out var product))
                return Conflict(new { error = "A product in your order is no longer available." });
            if (!product.Stock.Any(s => s.Size == item.Size))
                return Conflict(new { error = $"{product.Name} is no longer available in size {item.Size}." });

            lines.Add(new OrderProduct
            {
                CartId = item.CartId ?? string.Empty,
                ProductId = product.ProductId,
                Name = product.Name,
                Image = product.ImageUrl,
                Size = item.Size,
                Quantity = item.Quantity,
                UnitPrice = product.Price,
                TotalPrice = product.Price * item.Quantity,
            });
        }

        await using var tx = await db.Database.BeginTransactionAsync();

        // One decrement per (product, size) even if the cart holds several lines for it. Each is a single
        // atomic UPDATE that only succeeds while enough stock is left, so two buyers can't both take the
        // last item. Returning from here without committing rolls back the earlier decrements.
        foreach (var group in lines.GroupBy(l => (l.ProductId, l.Size)))
        {
            var (productId, size) = group.Key;
            var quantity = group.Sum(l => l.Quantity);

            var updated = await db.StockItems
                .Where(s => s.ProductId == productId && s.Size == size && s.StockAmount >= quantity)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.StockAmount, x => x.StockAmount - quantity));

            if (updated == 0)
            {
                var left = await db.StockItems
                    .Where(s => s.ProductId == productId && s.Size == size)
                    .SumAsync(s => s.StockAmount);
                var name = products[productId].Name;
                return Conflict(new
                {
                    error = left == 0
                        ? $"{name} in size {size} is out of stock."
                        : $"Only {left} left of {name} in size {size}."
                });
            }
        }

        var order = new Order
        {
            OrderId = Guid.NewGuid().ToString(),
            UserId = userId,
            Username = User.FindFirstValue("email") ?? string.Empty,
            Date = DateTime.UtcNow.ToString("o"),
            PaymentMethod = request.PaymentMethod ?? string.Empty,
            ShippingAddress = request.ShippingAddress,
            Status = "PROCESSING",
            TotalAmount = lines.Sum(l => l.TotalPrice),
            Products = lines,
        };
        db.Orders.Add(order);
        await db.SaveChangesAsync();

        var cartIds = lines.Select(l => l.CartId).Where(id => id != string.Empty).ToList();
        await db.Carts
            .Where(c => c.UserId == userId && cartIds.Contains(c.CartId))
            .ExecuteDeleteAsync();

        await tx.CommitAsync();
        return Ok(order);
    }

    // PUT /order — admins set any status, customers can only cancel their own processing order.
    // Cancelling puts the ordered quantities back in stock, exactly once.
    [HttpPut("order")]
    public async Task<IActionResult> Update([FromBody] Order order)
    {
        var existing = await db.Orders.Include(o => o.Products)
            .FirstOrDefaultAsync(o => o.OrderId == order.OrderId);
        if (existing is null) return NotFound();

        var status = order.Status?.ToUpperInvariant() ?? string.Empty;

        if (User.IsAdmin())
        {
            if (!Statuses.Contains(status)) return BadRequest(new { error = "Invalid status" });

            // Stock was already returned when it was cancelled, so it can't be reopened
            var wasCancelled = string.Equals(existing.Status, "CANCELLED", StringComparison.OrdinalIgnoreCase);
            if (wasCancelled && status != "CANCELLED")
                return Conflict(new { error = "A cancelled order can't be reopened." });

            // Status updates from the UI send only orderId + status, so don't blank the address
            if (!string.IsNullOrWhiteSpace(order.ShippingAddress))
                existing.ShippingAddress = order.ShippingAddress;
        }
        else
        {
            if (existing.UserId != User.Id()) return NotFound();

            var isProcessing = string.Equals(existing.Status, "PROCESSING", StringComparison.OrdinalIgnoreCase);
            if (status != "CANCELLED" || !isProcessing) return Forbid();
        }

        await using var tx = await db.Database.BeginTransactionAsync();

        if (status == "CANCELLED")
        {
            // Flip the status atomically: only the request that actually changes it restocks, so a
            // double click or two admins can't return the same items twice.
            var flipped = await db.Orders
                .Where(o => o.OrderId == existing.OrderId && o.Status != "CANCELLED")
                .ExecuteUpdateAsync(s => s.SetProperty(o => o.Status, "CANCELLED"));
            if (flipped == 1) await RestockAsync(existing);
        }

        existing.Status = status;
        await db.SaveChangesAsync();
        await tx.CommitAsync();
        return Ok(existing);
    }

    // DELETE /order?orderId=abc
    [HttpDelete("order")]
    [Authorize(Policy = CurrentUser.AdminPolicy)]
    public async Task<IActionResult> Delete([FromQuery] string orderId)
    {
        var order = await db.Orders.Include(o => o.Products)
            .FirstOrDefaultAsync(o => o.OrderId == orderId);
        if (order is null) return NotFound();

        db.Orders.Remove(order);
        await db.SaveChangesAsync();
        return Ok(new { message = "Order deleted" });
    }

    // Adds the ordered quantities back. A size the admin has since removed from the product is skipped.
    private async Task RestockAsync(Order order)
    {
        foreach (var group in order.Products.GroupBy(p => (p.ProductId, p.Size)))
        {
            var (productId, size) = group.Key;
            var quantity = group.Sum(p => p.Quantity);

            await db.StockItems
                .Where(s => s.ProductId == productId && s.Size == size)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.StockAmount, x => x.StockAmount + quantity));
        }
    }
}

public record CreateOrderRequest(string ShippingAddress, string? PaymentMethod, List<OrderItemRequest> Products);

public record OrderItemRequest(string? CartId, string ProductId, string Size, int Quantity);
