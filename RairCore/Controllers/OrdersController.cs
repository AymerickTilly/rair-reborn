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
        IQueryable<Order> query = db.Orders.Include(o => o.Products);
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
        var order = await db.Orders.Include(o => o.Products)
            .FirstOrDefaultAsync(o => o.OrderId == orderId);

        // NotFound (not Forbid) for someone else's order so its existence isn't revealed
        if (order is null || (!User.IsAdmin() && order.UserId != User.Id())) return NotFound();
        return Ok(order);
    }

    // POST /order
    [HttpPost("order")]
    public async Task<IActionResult> Create([FromBody] Order order)
    {
        order.OrderId = Guid.NewGuid().ToString();
        order.UserId = User.Id()!;   // always the caller, never a client-supplied id
        order.Date = DateTime.UtcNow.ToString("o");
        order.Status = "PROCESSING";
        db.Orders.Add(order);
        await db.SaveChangesAsync();
        return Ok(order);
    }

    // PUT /order — admins set any status, customers can only cancel their own processing order
    [HttpPut("order")]
    public async Task<IActionResult> Update([FromBody] Order order)
    {
        var existing = await db.Orders.FindAsync(order.OrderId);
        if (existing is null) return NotFound();

        var status = order.Status?.ToUpperInvariant() ?? string.Empty;

        if (User.IsAdmin())
        {
            if (!Statuses.Contains(status)) return BadRequest(new { error = "Invalid status" });
            existing.Status = status;

            // Status updates from the UI send only orderId + status, so don't blank the address
            if (!string.IsNullOrWhiteSpace(order.ShippingAddress))
                existing.ShippingAddress = order.ShippingAddress;
        }
        else
        {
            if (existing.UserId != User.Id()) return NotFound();

            var isProcessing = string.Equals(existing.Status, "PROCESSING", StringComparison.OrdinalIgnoreCase);
            if (status != "CANCELLED" || !isProcessing) return Forbid();
            existing.Status = "CANCELLED";
        }

        await db.SaveChangesAsync();
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
}
