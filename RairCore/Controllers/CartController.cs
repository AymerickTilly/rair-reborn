using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RairCore.Data;
using RairCore.Models;

namespace RairCore.Controllers;

[ApiController]
[Authorize]
public class CartController(AppDbContext db) : ControllerBase
{
    // GET /cart?userId=abc
    [HttpGet("cart")]
    public async Task<IActionResult> GetByUserId([FromQuery] string userId)
    {
        var items = await db.Carts.Where(c => c.UserId == userId).ToListAsync();
        return Ok(items);
    }

    // POST /cart
    [HttpPost("cart")]
    public async Task<IActionResult> Add([FromBody] Cart cart)
    {
        cart.CartId = Guid.NewGuid().ToString();
        db.Carts.Add(cart);
        await db.SaveChangesAsync();
        return Ok(new { message = "Added to cart", item = cart });
    }

    // PUT /cart
    [HttpPut("cart")]
    public async Task<IActionResult> Update([FromBody] Cart cart)
    {
        var existing = await db.Carts.FindAsync(cart.CartId);
        if (existing is null) return NotFound();

        existing.Quantity = cart.Quantity;
        existing.Size = cart.Size;

        await db.SaveChangesAsync();
        return Ok(existing);
    }

    // DELETE /cart?userId=abc&cartId=xyz
    [HttpDelete("cart")]
    public async Task<IActionResult> Delete([FromQuery] string userId, [FromQuery] string cartId)
    {
        var item = await db.Carts
            .FirstOrDefaultAsync(c => c.UserId == userId && c.CartId == cartId);
        if (item is null) return NotFound();

        db.Carts.Remove(item);
        await db.SaveChangesAsync();
        return Ok(new { message = "Cart item deleted" });
    }
}
