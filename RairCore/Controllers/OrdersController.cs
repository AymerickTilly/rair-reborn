using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RairCore.Data;
using RairCore.Models;

namespace RairCore.Controllers;

[ApiController]
[Authorize]
public class OrdersController(AppDbContext db) : ControllerBase
{
    // GET /orders
    [HttpGet("orders")]
    public async Task<IActionResult> GetAll()
    {
        var orders = await db.Orders.Include(o => o.Products).ToListAsync();
        return Ok(orders);
    }

    // GET /order?orderId=abc
    [HttpGet("order")]
    public async Task<IActionResult> GetById([FromQuery] string orderId)
    {
        var order = await db.Orders.Include(o => o.Products)
            .FirstOrDefaultAsync(o => o.OrderId == orderId);
        if (order is null) return NotFound();
        return Ok(order);
    }

    // POST /order
    [HttpPost("order")]
    public async Task<IActionResult> Create([FromBody] Order order)
    {
        order.OrderId = Guid.NewGuid().ToString();
        order.Date = DateTime.UtcNow.ToString("o");
        order.Status = "Processing";
        db.Orders.Add(order);
        await db.SaveChangesAsync();
        return Ok(order);
    }

    // PUT /order — used by admin to update status, or user to cancel
    [HttpPut("order")]
    public async Task<IActionResult> Update([FromBody] Order order)
    {
        var existing = await db.Orders.FindAsync(order.OrderId);
        if (existing is null) return NotFound();

        existing.Status = order.Status;
        existing.ShippingAddress = order.ShippingAddress;

        await db.SaveChangesAsync();
        return Ok(existing);
    }

    // DELETE /order?orderId=abc
    [HttpDelete("order")]
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
