namespace DatingApp.Api.DTOs;

public record AdminUserRow(
    Guid Id,
    string Email,
    string Role,
    bool IsBanned,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? LastLoginAt,
    string? DisplayName
);

public record AdminStats(
    int TotalUsers,
    int TotalMatches,
    int TotalMessages,
    int NewUsersLast7Days,
    int BannedUsers
);
