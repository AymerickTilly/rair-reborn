using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RairCore.Auth;
using RairCore.Data;
using RairCore.Models;

namespace RairCore.Controllers;

[ApiController]
[Authorize]
public class UsersController(AppDbContext db) : ControllerBase
{
    // GET /users
    [HttpGet("users")]
    [Authorize(Policy = CurrentUser.AdminPolicy)]
    public async Task<IActionResult> GetAll()
    {
        var users = await db.Users.ToListAsync();
        return Ok(users);
    }

    // GET /user?userId=abc — your own profile (admins can read any)
    [HttpGet("user")]
    public async Task<IActionResult> GetById([FromQuery] string userId)
    {
        if (userId != User.Id() && !User.IsAdmin()) return Forbid();

        var user = await db.Users.FindAsync(userId);
        if (user is null) return NotFound();
        return Ok(user);
    }

    // POST /user — called after sign-up to store profile in our DB
    [HttpPost("user")]
    public async Task<IActionResult> Create([FromBody] User user)
    {
        // A profile can only be created for the signed-in account itself
        if (user.UserId != User.Id()) return Forbid();

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
        if (user.UserId != User.Id() && !User.IsAdmin()) return Forbid();

        var existing = await db.Users.FindAsync(user.UserId);
        if (existing is null) return NotFound();

        existing.Username = user.Username;
        existing.Address = user.Address;

        await db.SaveChangesAsync();
        return Ok(existing);
    }
}
