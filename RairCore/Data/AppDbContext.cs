using Microsoft.EntityFrameworkCore;
using RairCore.Models;

namespace RairCore.Data;

// DbContext is EF Core's way of representing your database.
// Think of it as the ORM layer — it maps C# classes to PostgreSQL tables.
// Each DbSet<T> below becomes a table. EF Core handles the SQL for you.
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<StockItem> StockItems => Set<StockItem>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderProduct> OrderProducts => Set<OrderProduct>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Tell EF Core: User.UserId is the primary key (it's a string, not auto-int)
        modelBuilder.Entity<User>().HasKey(u => u.UserId);
        modelBuilder.Entity<Product>().HasKey(p => p.ProductId);
        modelBuilder.Entity<Cart>().HasKey(c => c.CartId);
        modelBuilder.Entity<Order>().HasKey(o => o.OrderId);

        // Define the 1-to-many relationships so EF Core generates the right foreign keys
        modelBuilder.Entity<Product>()
            .HasMany(p => p.Stock)
            .WithOne()
            .HasForeignKey(s => s.ProductId);

        modelBuilder.Entity<Order>()
            .HasMany(o => o.Products)
            .WithOne()
            .HasForeignKey(op => op.OrderId);
    }
}
