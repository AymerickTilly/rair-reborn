namespace RairCore.Models;

// In C#, a "class" is just like an object shape in TypeScript (like an interface/type).
// Each property here maps to a column in the PostgreSQL users table.
public class User
{
    public string UserId { get; set; } = string.Empty;   // Primary key — comes from Supabase Auth
    public string Username { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}
