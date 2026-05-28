using System.Text.Json.Serialization;
using System.Text;
using AtomicHabits.Api.Common.Auth;
using AtomicHabits.Api.Common.Database;
using AtomicHabits.Api.Common.Time;
using AtomicHabits.Api.Features.Auth;
using AtomicHabits.Api.Features.Challenges;
using AtomicHabits.Api.Features.Client;
using AtomicHabits.Api.Features.Devices;
using AtomicHabits.Api.Features.Gamification;
using AtomicHabits.Api.Features.Habits;
using AtomicHabits.Api.Features.Health;
using AtomicHabits.Api.Features.Me;
using AtomicHabits.Api.Features.Privacy;
using AtomicHabits.Api.Features.Progress;
using AtomicHabits.Api.Features.Reminders;
using AtomicHabits.Api.Features.Reviews;
using AtomicHabits.Api.Features.ShareCards;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddSingleton<IClock, SystemClock>();
builder.Services.AddScoped<ICurrentUser, HttpCurrentUser>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IBadgeAwarder, BadgeAwarder>();
builder.Services.AddAtomicHabitsDatabase(builder.Configuration, builder.Environment);
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));

var allowedCorsOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("MobileDev", policy =>
    {
        if (allowedCorsOrigins.Length > 0)
        {
            policy
                .WithOrigins(allowedCorsOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});

builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        options.User.RequireUniqueEmail = true;
        options.Password.RequiredLength = 10;
        options.Password.RequireNonAlphanumeric = false;
    })
    .AddEntityFrameworkStores<AtomicHabitsDbContext>();

var jwtOptions = builder.Configuration
    .GetSection(JwtOptions.SectionName)
    .Get<JwtOptions>() ?? new JwtOptions();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("OpenApi:Enabled"))
{
    app.MapOpenApi();
}

await app.ApplyDatabaseMigrationsAsync();

app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Configuration.GetValue<bool>("Cors:Enabled"))
{
    app.UseCors("MobileDev");
}

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthEndpoints();
app.MapClientConfigEndpoints();
app.MapAuthEndpoints();
app.MapMeEndpoints();
app.MapPrivacyEndpoints();
app.MapDeviceEndpoints();
app.MapHabitEndpoints();
app.MapReminderEndpoints();
app.MapProgressEndpoints();
app.MapWeeklyReviewEndpoints();
app.MapChallengeEndpoints();
app.MapShareCardEndpoints();
app.MapGamificationEndpoints();

app.Run();

public partial class Program;
