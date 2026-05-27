using System.Security.Claims;

namespace AtomicHabits.Api.Common.Auth;

public interface ICurrentUser
{
    Guid UserId { get; }
}

public sealed class HttpCurrentUser(IHttpContextAccessor httpContextAccessor) : ICurrentUser
{
    public Guid UserId
    {
        get
        {
            var httpContext = httpContextAccessor.HttpContext;
            var claimValue = httpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? httpContext?.User.FindFirstValue("sub");

            if (Guid.TryParse(claimValue, out var authenticatedUserId))
            {
                return authenticatedUserId;
            }

            throw new InvalidOperationException("Authenticated user id is missing.");
        }
    }
}
