using System.Security.Claims;
using DatingApp.Api.Data;
using DatingApp.Api.DTOs;
using DatingApp.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.Api.Controllers;

[ApiController]
[Route("api/matches/{matchId:guid}/messages")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly AppDbContext _db;

    public MessagesController(AppDbContext db)
    {
        _db = db;
    }

    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")!);

    private async Task<bool> UserIsInMatch(Guid matchId)
    {
        return await _db.Matches.AnyAsync(m => m.Id == matchId
            && (m.UserAId == CurrentUserId || m.UserBId == CurrentUserId));
    }

    [HttpGet]
    public async Task<ActionResult<List<MessageResponse>>> GetMessages(Guid matchId)
    {
        if (!await UserIsInMatch(matchId)) return Forbid();

        var messages = await _db.Messages
            .Where(m => m.MatchId == matchId)
            .OrderBy(m => m.SentAt)
            .Select(m => new MessageResponse(m.Id, m.SenderId, m.Content, m.SentAt, m.IsRead))
            .ToListAsync();

        return Ok(messages);
    }

    [HttpPost]
    public async Task<ActionResult<MessageResponse>> SendMessage(Guid matchId, SendMessageRequest request)
    {
        if (!await UserIsInMatch(matchId)) return Forbid();
        if (string.IsNullOrWhiteSpace(request.Content)) return BadRequest(new { message = "Message cannot be empty." });

        var message = new Message
        {
            MatchId = matchId,
            SenderId = CurrentUserId,
            Content = request.Content.Trim()
        };

        _db.Messages.Add(message);
        await _db.SaveChangesAsync();

        return Ok(new MessageResponse(message.Id, message.SenderId, message.Content, message.SentAt, message.IsRead));
    }
}
