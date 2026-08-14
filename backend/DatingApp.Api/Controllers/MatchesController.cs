using System.Security.Claims;
using DatingApp.Api.Data;
using DatingApp.Api.DTOs;
using DatingApp.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MatchesController : ControllerBase
{
    private readonly AppDbContext _db;

    public MatchesController(AppDbContext db)
    {
        _db = db;
    }

    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")!);

    // POST /api/matches/like/{targetUserId} -> records a like, and creates a Match if mutual
    [HttpPost("like/{targetUserId:guid}")]
    public async Task<IActionResult> Like(Guid targetUserId)
    {
        if (targetUserId == CurrentUserId) return BadRequest(new { message = "You cannot like yourself." });

        var alreadyLiked = await _db.Likes.AnyAsync(l => l.FromUserId == CurrentUserId && l.ToUserId == targetUserId);
        if (!alreadyLiked)
        {
            _db.Likes.Add(new Like { FromUserId = CurrentUserId, ToUserId = targetUserId });
            await _db.SaveChangesAsync();
        }

        var mutual = await _db.Likes.AnyAsync(l => l.FromUserId == targetUserId && l.ToUserId == CurrentUserId);
        if (!mutual) return Ok(new { matched = false });

        var (a, b) = CurrentUserId.CompareTo(targetUserId) < 0
            ? (CurrentUserId, targetUserId)
            : (targetUserId, CurrentUserId);

        var existingMatch = await _db.Matches.FirstOrDefaultAsync(m => m.UserAId == a && m.UserBId == b);
        if (existingMatch == null)
        {
            _db.Matches.Add(new Match { UserAId = a, UserBId = b });
            await _db.SaveChangesAsync();
        }

        return Ok(new { matched = true });
    }

    [HttpPost("pass/{targetUserId:guid}")]
    public async Task<IActionResult> Pass(Guid targetUserId)
    {
        var alreadyActed = await _db.Likes.AnyAsync(l => l.FromUserId == CurrentUserId && l.ToUserId == targetUserId);
        if (!alreadyActed)
        {
            // Record a "pass" as a non-super Like row so it's excluded from future discover results too.
            // In a larger app this would be a separate Pass table.
            _db.Likes.Add(new Like { FromUserId = CurrentUserId, ToUserId = targetUserId });
            await _db.SaveChangesAsync();
        }
        return NoContent();
    }

    [HttpGet]
    public async Task<ActionResult<List<MatchResponse>>> GetMyMatches()
    {
        var matches = await _db.Matches
            .Where(m => m.UserAId == CurrentUserId || m.UserBId == CurrentUserId)
            .ToListAsync();

        var result = new List<MatchResponse>();
        foreach (var m in matches)
        {
            var otherUserId = m.UserAId == CurrentUserId ? m.UserBId : m.UserAId;
            var otherProfile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == otherUserId);
            result.Add(new MatchResponse(
                m.Id, otherUserId, otherProfile?.DisplayName ?? "Unknown", otherProfile?.PhotoUrl, m.MatchedAt
            ));
        }

        return Ok(result.OrderByDescending(r => r.MatchedAt));
    }
}
