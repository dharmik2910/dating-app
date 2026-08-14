using System.ComponentModel.DataAnnotations;

namespace DatingApp.Api.DTOs;

public record SignupRequest(
    [property: Required, EmailAddress] string Email,
    [property: Required, MinLength(8)] string Password,
    [property: Required] string DisplayName,
    [property: Range(18, 120)] int Age,
    [property: Required] string Gender
);

public record LoginRequest(
    [property: Required, EmailAddress] string Email,
    [property: Required] string Password
);

public record AuthResponse(
    string Token,
    DateTime ExpiresAt,
    UserSummary User
);

public record UserSummary(
    Guid Id,
    string Email,
    string Role,
    string? DisplayName,
    string? PhotoUrl
);
