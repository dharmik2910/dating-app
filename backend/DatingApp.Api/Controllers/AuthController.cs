using DatingApp.Api.Data;
using DatingApp.Api.DTOs;
using DatingApp.Api.Models;
using DatingApp.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IPasswordService _passwordService;
    private readonly ITokenService _tokenService;
    private readonly IRedisService _redis;

    public AuthController(
        AppDbContext db,
        IPasswordService passwordService,
        ITokenService tokenService,
        IRedisService redis)
    {
        _db = db;
        _passwordService = passwordService;
        _tokenService = tokenService;
        _redis = redis;
    }

    [HttpPost("signup")]
    public async Task<ActionResult<AuthResponse>> Signup(SignupRequest request)
    {
        var emailNormalized = request.Email.Trim().ToLowerInvariant();

        if (await _db.Users.AnyAsync(u => u.Email == emailNormalized))
            return Conflict(new { message = "An account with this email already exists." });

        if (!Enum.TryParse<Gender>(request.Gender, true, out var gender))
            return BadRequest(new { message = "Invalid gender value." });

        var user = new User
        {
            Email = emailNormalized,
            PasswordHash = _passwordService.Hash(request.Password),
            Role = UserRole.User
        };

        user.Profile = new Profile
        {
            UserId = user.Id,
            DisplayName = request.DisplayName,
            Age = request.Age,
            Gender = gender
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var (token, expiresAt) = _tokenService.CreateToken(user);

        return Ok(new AuthResponse(
            token,
            expiresAt,
            new UserSummary(user.Id, user.Email, user.Role.ToString(), user.Profile.DisplayName, user.Profile.PhotoUrl)
        ));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var emailNormalized = request.Email.Trim().ToLowerInvariant();

        // Basic brute-force throttle: max 10 attempts / 15 min per email, backed by Redis
        var rateKey = $"login-attempts:{emailNormalized}";
        var attempts = await _redis.IncrementAsync(rateKey, TimeSpan.FromMinutes(15));
        if (attempts > 10)
            return StatusCode(429, new { message = "Too many login attempts. Try again later." });

        var user = await _db.Users.Include(u => u.Profile)
            .FirstOrDefaultAsync(u => u.Email == emailNormalized);

        if (user == null || !_passwordService.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password." });

        if (user.IsBanned)
            return Forbid();

        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await _redis.KeyDeleteAsync(rateKey);

        var (token, expiresAt) = _tokenService.CreateToken(user);

        return Ok(new AuthResponse(
            token,
            expiresAt,
            new UserSummary(user.Id, user.Email, user.Role.ToString(), user.Profile?.DisplayName, user.Profile?.PhotoUrl)
        ));
    }
}
