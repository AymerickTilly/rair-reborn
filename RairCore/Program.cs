using CloudinaryDotNet;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RairCore.Auth;
using RairCore.Data;

var builder = WebApplication.CreateBuilder(args);

// Render injects PORT as an env var — we tell ASP.NET to listen on it.
// Locally it falls back to the port in launchSettings.json.
var port = Environment.GetEnvironmentVariable("PORT")
    ?? Environment.GetEnvironmentVariable("HTTP_PORTS")
    ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// --- Services ---
// "Services" in .NET = things you register once and inject anywhere.
// This is like setting up middleware in Express, but more structured.

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Register the database — reads connection string from appsettings.json
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Supabase newer projects use ES256 (asymmetric EC key).
// We load the public key directly from the JWKS values — no network call needed at startup.
var supabaseUrl = builder.Configuration["Supabase:Url"]
    ?? throw new InvalidOperationException("Supabase:Url is not configured.");

var jwk = new JsonWebKey
{
    Alg = "ES256",
    Crv = "P-256",
    Kty = "EC",
    Use = "sig",
    Kid = "95e1fb27-a881-4aee-ba8a-c14760bf67b9",
    X   = "3yTr3Cuwa59E8diwZj0zTP5gg02rHQNPdekVwHRcPtM",
    Y   = "JcRGiinvHIpwbZl_Dtic9H3U66jxBlZEx4iUqcwJTxY",
};

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Keep claim names as they appear in the token ("sub", "app_metadata") instead of remapping them.
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = supabaseUrl + "/auth/v1",
            ValidateAudience = true,
            ValidAudience = "authenticated",
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = jwk,
        };
    });

// Store-management endpoints require the "Admin" role from the token's app_metadata.
builder.Services.AddAuthorizationBuilder()
    .AddPolicy(CurrentUser.AdminPolicy, policy => policy.RequireAssertion(ctx => ctx.User.IsAdmin()));

// Register Cloudinary as a singleton — one instance shared across all requests.
// In C#, a singleton means it's created once and reused (like a module-level object in JS).
var cloudinaryConfig = builder.Configuration.GetSection("Cloudinary");
var cloudinary = new Cloudinary(new Account(
    cloudinaryConfig["CloudName"],
    cloudinaryConfig["ApiKey"],
    cloudinaryConfig["ApiSecret"]
));
cloudinary.Api.Secure = true;
builder.Services.AddSingleton(cloudinary);

// CORS — allows your Vercel frontend to call this API
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(
            builder.Configuration["AllowedOrigins"] ?? "http://localhost:5173"
        )
        .AllowAnyHeader()
        .AllowAnyMethod());
});

// --- Middleware pipeline ---
// Order matters here: each request flows through these in sequence.
var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseCors("Frontend");
app.UseAuthentication();   // 1. Parse and validate the JWT
app.UseAuthorization();    // 2. Check if the route requires auth
app.MapControllers();      // 3. Route to the right controller action

// Unauthenticated and does no work: lets the frontend (or an uptime pinger) wake a sleeping
// free-tier instance before the first real request.
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
