namespace DatingApp.Api.Models;

public class Like
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FromUserId { get; set; }
    public Guid ToUserId { get; set; }
    public bool IsSuperLike { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
