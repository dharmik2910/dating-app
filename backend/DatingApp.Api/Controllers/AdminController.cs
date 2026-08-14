using DatingApp.Api.Data;
using DatingApp.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<AdminStats>> GetStats()
    {
        var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);

        var stats = new AdminStats(
            TotalUsers: await _db.Users.CountAsync(),
            TotalMatches: await _db.Matches.CountAsync(),
            TotalMessages: await _db.Messages.CountAsync(),
            NewUsersLast7Days: await _db.Users.CountAsync(u => u.CreatedAt >= sevenDaysAgo),
            BannedUsers: await _db.Users.CountAsync(u => u.IsBanned)
        );

        return Ok(stats);
    }

    [HttpGet("users")]
    public async Task<ActionResult<List<AdminUserRow>>> GetUsers([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = _db.Users.Include(u => u.Profile).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLowerInvariant();
            query = query.Where(u => u.Email.ToLower().Contains(s)
                || (u.Profile != null && u.Profile.DisplayName.ToLower().Contains(s)));
        }

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new AdminUserRow(
                u.Id, u.Email, u.Role.ToString(), u.IsBanned, u.IsActive,
                u.CreatedAt, u.LastLoginAt, u.Profile != null ? u.Profile.DisplayName : null
            ))
            .ToListAsync();

        return Ok(users);
    }

    [HttpPost("users/{userId:guid}/ban")]
    public async Task<IActionResult> BanUser(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();
        user.IsBanned = true;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("users/{userId:guid}/unban")]
    public async Task<IActionResult> UnbanUser(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();
        user.IsBanned = false;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("users/{userId:guid}")]
    public async Task<IActionResult> DeleteUser(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();
        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
