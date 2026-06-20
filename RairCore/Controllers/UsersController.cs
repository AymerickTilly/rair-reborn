using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RairCore.Data;
using RairCore.Models;

namespace RairCore.Controllers;

[ApiController]
[Authorize]
public class UsersController(AppDbContext db) : ControllerBase
{
    // GET /users
    [HttpGet("users")]
    public async Task<IActionResult> GetAll()
    {
        var users = await db.Users.ToListAsync();
        return Ok(users);
    }

    // GET /user?userId=abc
    [HttpGet("user")]
    public async Task<IActionResult> GetById([FromQuery] string userId)
    {
        var user = await db.Users.FindAsync(userId);
        if (user is null) return NotFound();
        return Ok(user);
    }

    // POST /user — called after sign-up to store profile in our DB
    [HttpPost("user")]
    public async Task<IActionResult> Create([FromBody] User user)
    {
        var exists = await db.Users.FindAsync(user.UserId);
        if (exists is not null) return Conflict(new { message = "User already exists" });

        db.Users.Add(user);
        await db.SaveChangesAsync();
        return Ok(user);
    }

    // PUT /user
    [HttpPut("user")]
    public async Task<IActionResult> Update([FromBody] User user)
    {
        var existing = await db.Users.FindAsync(user.UserId);
        if (existing is null) return NotFound();

        existing.Username = user.Username;
        existing.Address = user.Address;

        await db.SaveChangesAsync();
        return Ok(existing);
    }
}
