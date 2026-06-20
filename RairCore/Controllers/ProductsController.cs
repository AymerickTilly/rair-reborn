using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RairCore.Data;
using RairCore.Models;

namespace RairCore.Controllers;

// [ApiController] adds automatic request validation and JSON handling
// [Route] sets the base URL path — this covers /products and /product
// [Authorize] means every endpoint here requires a valid JWT token
[ApiController]
[Authorize]
public class ProductsController(AppDbContext db) : ControllerBase
{
    // GET /products
    [HttpGet("products")]
    public async Task<IActionResult> GetAll()
    {
        // Include() is like a SQL JOIN — loads the Stock list with each product
        var products = await db.Products.Include(p => p.Stock).ToListAsync();
        return Ok(products);
    }

    // GET /product?productId=abc
    [HttpGet("product")]
    public async Task<IActionResult> GetById([FromQuery] string productId)
    {
        var product = await db.Products.Include(p => p.Stock)
            .FirstOrDefaultAsync(p => p.ProductId == productId);

        // NotFound() returns HTTP 404 — same behaviour your Lambda had
        if (product is null) return NotFound();
        return Ok(product);
    }

    // POST /product
    [HttpPost("product")]
    public async Task<IActionResult> Create([FromBody] Product product)
    {
        product.ProductId = Guid.NewGuid().ToString();
        db.Products.Add(product);
        await db.SaveChangesAsync();
        return Ok(product);
    }

    // PUT /product
    [HttpPut("product")]
    public async Task<IActionResult> Update([FromBody] Product product)
    {
        var existing = await db.Products.Include(p => p.Stock)
            .FirstOrDefaultAsync(p => p.ProductId == product.ProductId);
        if (existing is null) return NotFound();

        existing.Name = product.Name;
        existing.Description = product.Description;
        existing.Category = product.Category;
        existing.ImageUrl = product.ImageUrl;
        existing.Price = product.Price;

        // Replace stock entries
        db.StockItems.RemoveRange(existing.Stock);
        existing.Stock = product.Stock;

        await db.SaveChangesAsync();
        return Ok(existing);
    }

    // DELETE /product?productId=abc
    [HttpDelete("product")]
    public async Task<IActionResult> Delete([FromQuery] string productId)
    {
        var product = await db.Products.Include(p => p.Stock)
            .FirstOrDefaultAsync(p => p.ProductId == productId);
        if (product is null) return NotFound();

        db.Products.Remove(product);
        await db.SaveChangesAsync();
        return Ok(new { message = "Product deleted" });
    }
}
