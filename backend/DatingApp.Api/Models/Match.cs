namespace DatingApp.Api.Models;

public class Match
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserAId { get; set; }
    public Guid UserBId { get; set; }
    public DateTime MatchedAt { get; set; } = DateTime.UtcNow;

    public List<Message> Messages { get; set; } = new();
}
