using AtomicHabits.Api.Common.Auth;
using Microsoft.AspNetCore.Identity;

namespace AtomicHabits.Api.Features.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/auth")
            .WithTags("Auth")
            .AllowAnonymous();

        group.MapPost("/register", Register)
            .WithName("Register");

        group.MapPost("/login", Login)
            .WithName("Login");

        group.MapPost("/refresh", Refresh)
            .WithName("RefreshToken");

        group.MapPost("/logout", Logout)
            .WithName("Logout");

        return app;
    }

    private static async Task<IResult> Register(
        RegisterRequest request,
        UserManager<ApplicationUser> userManager,
        ITokenService tokenService,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.DisplayName))
        {
            return Results.BadRequest(new { error = "Email, password and displayName are required." });
        }

        var email = request.Email.Trim().ToLowerInvariant();
        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            DisplayName = request.DisplayName.Trim(),
            PreferredLanguage = NormalizeCulture(request.PreferredLanguage),
            TimeZone = string.IsNullOrWhiteSpace(request.TimeZone)
                ? "Europe/Istanbul"
                : request.TimeZone.Trim(),
            PrivacyLevel = "private"
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return Results.ValidationProblem(ToValidationErrors(result));
        }

        var response = await tokenService.IssueTokenPairAsync(
            user,
            request.DeviceName,
            cancellationToken);

        return Results.Created("/api/v1/me", response);
    }

    private static async Task<IResult> Login(
        LoginRequest request,
        UserManager<ApplicationUser> userManager,
        ITokenService tokenService,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.BadRequest(new { error = "Email and password are required." });
        }

        var user = await userManager.FindByEmailAsync(request.Email.Trim().ToLowerInvariant());
        if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
        {
            return Results.Unauthorized();
        }

        var response = await tokenService.IssueTokenPairAsync(
            user,
            request.DeviceName,
            cancellationToken);

        return Results.Ok(response);
    }

    private static async Task<IResult> Refresh(
        RefreshTokenRequest request,
        ITokenService tokenService,
        CancellationToken cancellationToken)
    {
        var response = await tokenService.RefreshTokenPairAsync(
            request.RefreshToken,
            cancellationToken);

        return response is null ? Results.Unauthorized() : Results.Ok(response);
    }

    private static async Task<IResult> Logout(
        LogoutRequest request,
        ITokenService tokenService,
        CancellationToken cancellationToken)
    {
        await tokenService.RevokeRefreshTokenAsync(
            request.RefreshToken,
            cancellationToken);

        return Results.NoContent();
    }

    private static Dictionary<string, string[]> ToValidationErrors(IdentityResult result)
    {
        return result.Errors
            .GroupBy(error => error.Code)
            .ToDictionary(
                group => group.Key,
                group => group.Select(error => error.Description).ToArray());
    }

    private static string NormalizeCulture(string? culture)
    {
        return string.IsNullOrWhiteSpace(culture)
            ? "tr-TR"
            : culture.Trim();
    }
}
