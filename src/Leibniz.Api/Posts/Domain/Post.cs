namespace Leibniz.Api.Posts.Domain;
public record Post : AuditableEntity
{
    [Key]
    public long PostId { get; set; }
    [MaxLength(255)]
    public string? Title { get; set; }
    public string? Content { get; set; }
    [MaxLength(255)]
    public string? Author { get; set; }
    public long? BookId { get; set; }
    public int? Page { get; set; }
    [MaxLength(500)]
    public string? Reference { get; set; }
}

