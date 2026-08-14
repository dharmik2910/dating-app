namespace DatingApp.Api.Models;

public enum Gender { Male, Female, Other }

public class Profile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }

    public string DisplayName { get; set; } = string.Empty;
    public int Age { get; set; }
    public Gender Gender { get; set; }
    public string Bio { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public List<string> Interests { get; set; } = new();

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
