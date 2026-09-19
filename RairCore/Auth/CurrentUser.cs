using System.Security.Claims;
using System.Text.Json;

namespace RairCore.Auth;

public static class CurrentUser
{
    public const string AdminPolicy = "Admin";

    // The Supabase user id (JWT "sub" claim), the same value stored as UserId in our tables.
    public static string? Id(this ClaimsPrincipal user) => user.FindFirstValue("sub");

    // Supabase puts the role in the "app_metadata" claim, a JSON object only writable server-side.
    // "user_metadata" is editable by the user, so it must never be used for authorization.
    public static bool IsAdmin(this ClaimsPrincipal user)
    {
        var raw = user.FindFirstValue("app_metadata");
        if (string.IsNullOrEmpty(raw)) return false;

        try
        {
            using var doc = JsonDocument.Parse(raw);
            return doc.RootElement.TryGetProperty("role", out var role)
                && string.Equals(role.GetString(), "Admin", StringComparison.OrdinalIgnoreCase);
        }
        catch (JsonException)
        {
            return false;
        }
    }
}
