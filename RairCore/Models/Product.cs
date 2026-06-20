namespace RairCore.Models;

public class Product
{
    public string ProductId { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public decimal Price { get; set; }

    // In DynamoDB this was an array of objects — in PostgreSQL we use a separate table.
    // EF Core handles the relationship: one Product has many StockItems.
    public List<StockItem> Stock { get; set; } = [];
}

// Represents one size variant: e.g. { size: "M", stockAmount: 10 }
public class StockItem
{
    public int Id { get; set; }             // Auto-generated PK for the DB row
    public string ProductId { get; set; } = string.Empty;  // Foreign key back to Product
    public string Size { get; set; } = string.Empty;
    public int StockAmount { get; set; }
}
