using StackExchange.Redis;

namespace DatingApp.Api.Services;

// Thin wrapper around StackExchange.Redis used for:
//  - caching "discover" feeds per user (short TTL)
//  - tracking online/last-seen presence
//  - simple rate limiting on auth endpoints
public interface IRedisService
{
    Task SetStringAsync(string key, string value, TimeSpan? ttl = null);
    Task<string?> GetStringAsync(string key);
    Task<bool> KeyDeleteAsync(string key);
    Task<long> IncrementAsync(string key, TimeSpan? ttl = null);
}

public class RedisService : IRedisService
{
    private readonly IConnectionMultiplexer _redis;

    public RedisService(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    private IDatabase Db => _redis.GetDatabase();

    public async Task SetStringAsync(string key, string value, TimeSpan? ttl = null) =>
        await Db.StringSetAsync(key, value, ttl);

    public async Task<string?> GetStringAsync(string key) =>
        await Db.StringGetAsync(key);

    public async Task<bool> KeyDeleteAsync(string key) =>
        await Db.KeyDeleteAsync(key);

    public async Task<long> IncrementAsync(string key, TimeSpan? ttl = null)
    {
        var count = await Db.StringIncrementAsync(key);
        if (count == 1 && ttl.HasValue)
        {
            await Db.KeyExpireAsync(key, ttl.Value);
        }
        return count;
    }
}
