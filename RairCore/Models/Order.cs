namespace RairCore.Models;

public class Order
{
    public string OrderId { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Date { get; set; } = DateTime.UtcNow.ToString("o");
    public string PaymentMethod { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string Status { get; set; } = "Processing";
    public decimal TotalAmount { get; set; }

    // One order has many order lines (the products inside it)
    public List<OrderProduct> Products { get; set; } = [];
}

public class OrderProduct
{
    public int Id { get; set; }
    public string OrderId { get; set; } = string.Empty;   // Foreign key back to Order
    public string CartId { get; set; } = string.Empty;
    public string ProductId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Size { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}
