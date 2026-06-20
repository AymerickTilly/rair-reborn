using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RairCore.Data;

var builder = WebApplication.CreateBuilder(args);

// --- Services ---
// "Services" in .NET = things you register once and inject anywhere.
// This is like setting up middleware in Express, but more structured.

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Register the database — reads connection string from appsettings.json
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication — validates the Bearer token on every [Authorize] route.
// Supabase issues standard JWTs so this works out of the box.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Your Supabase project URL goes here (set in appsettings or env vars)
        options.Authority = builder.Configuration["Supabase:Url"] + "/auth/v1";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Supabase:Url"] + "/auth/v1",
            ValidateAudience = false,   // Supabase doesn't set an audience claim
            ValidateLifetime = true,
        };
    });

builder.Services.AddAuthorization();

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

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();   // 1. Parse and validate the JWT
app.UseAuthorization();    // 2. Check if the route requires auth
app.MapControllers();      // 3. Route to the right controller action

app.Run();
