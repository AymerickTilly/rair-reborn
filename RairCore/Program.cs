using CloudinaryDotNet;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RairCore.Data;

var builder = WebApplication.CreateBuilder(args);

// Railway injects PORT as an env var — we tell ASP.NET to listen on it.
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

// JWT Authentication — Supabase signs tokens with HS256 (a shared secret),
// not RS256 (public/private key). So we validate using the raw JWT secret,
// not an Authority URL. This is the correct approach for Supabase.
// Supabase newer projects use ES256 (asymmetric). We validate via the JWKS endpoint
// so the middleware fetches the public key automatically — no shared secret needed.
var supabaseUrl = builder.Configuration["Supabase:Url"]
    ?? throw new InvalidOperationException("Supabase:Url is not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = supabaseUrl + "/auth/v1";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = supabaseUrl + "/auth/v1",
            ValidateAudience = true,
            ValidAudience = "authenticated",
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
        };
    });

builder.Services.AddAuthorization();

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

app.Run();
