namespace Leibniz.Api.Books.Domain;
public record Book : AuditableEntity
{
    [Key]
    public long BookId { get; set; }
    [MaxLength(300)]
    public string? Title { get; set; }
    [MaxLength(150)]
    public string? Author { get; set; }
    [MaxLength(100)]
    public string? Publisher { get; set; }
    public short? Edition { get; set; }
    public string? Content { get; set; }
    public short? Year { get; set; }
    public short? TotalOfPages { get; set; }
    [MaxLength(100)]
    public string? Translator { get; set; }
    [MaxLength(50)]
    public string? Isbn { get; set; }
    public decimal? Price { get; set; }
    public DateOnly? PurchasedDate { get; set; }
    public decimal? SizeX { get; set; }
    public decimal? SizeY { get; set; }
    public decimal? SizeZ { get; set; }
    [MaxLength(100)]
    public string? Local { get; set; }
}

