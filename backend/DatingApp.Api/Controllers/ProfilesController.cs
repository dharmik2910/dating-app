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
public class ProfilesController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProfilesController(AppDbContext db)
    {
        _db = db;
    }

    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")!);

    [HttpGet("me")]
    public async Task<ActionResult<ProfileResponse>> GetMyProfile()
    {
        var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == CurrentUserId);
        if (profile == null) return NotFound();
        return Ok(ToResponse(profile));
    }

    [HttpPut("me")]
    public async Task<ActionResult<ProfileResponse>> UpdateMyProfile(UpdateProfileRequest request)
    {
        var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == CurrentUserId);
        if (profile == null) return NotFound();

        profile.DisplayName = request.DisplayName;
        profile.Age = request.Age;
        profile.Bio = request.Bio;
        profile.City = request.City;
        profile.PhotoUrl = request.PhotoUrl;
        profile.Interests = request.Interests ?? new List<string>();
        profile.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(ToResponse(profile));
    }

    // Discover feed: other active, non-banned users not yet liked/passed by the current user
    [HttpGet("discover")]
    public async Task<ActionResult<List<ProfileResponse>>> Discover([FromQuery] int take = 20)
    {
        var alreadyActedOn = await _db.Likes
            .Where(l => l.FromUserId == CurrentUserId)
            .Select(l => l.ToUserId)
            .ToListAsync();

        var profiles = await _db.Profiles
            .Include(p => p.User)
            .Where(p => p.UserId != CurrentUserId
                && p.User!.IsActive
                && !p.User.IsBanned
                && !alreadyActedOn.Contains(p.UserId))
            .OrderBy(p => Guid.NewGuid()) // simple randomized order for demo purposes
            .Take(take)
            .ToListAsync();

        return Ok(profiles.Select(ToResponse));
    }

    private static ProfileResponse ToResponse(Profile p) => new(
        p.Id, p.UserId, p.DisplayName, p.Age, p.Gender.ToString(),
        p.Bio, p.City, p.PhotoUrl, p.Interests
    );
}
