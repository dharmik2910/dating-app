namespace DatingApp.Api.DTOs;

public record ProfileResponse(
    Guid Id,
    Guid UserId,
    string DisplayName,
    int Age,
    string Gender,
    string Bio,
    string City,
    string? PhotoUrl,
    List<string> Interests
);

public record UpdateProfileRequest(
    string DisplayName,
    int Age,
    string Bio,
    string City,
    string? PhotoUrl,
    List<string> Interests
);

public record MatchResponse(
    Guid MatchId,
    Guid OtherUserId,
    string OtherDisplayName,
    string? OtherPhotoUrl,
    DateTime MatchedAt
);

public record SendMessageRequest(string Content);

public record MessageResponse(
    Guid Id,
    Guid SenderId,
    string Content,
    DateTime SentAt,
    bool IsRead
);
