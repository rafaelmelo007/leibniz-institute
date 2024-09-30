namespace Leibniz.Api.Links.Domain;
public record Link : AuditableEntity
{
    [Key]
    public long LinkId { get; set; }
    [MaxLength(255)]
    public string? Name { get; set; }
    public string? Content { get; set; }
    [MaxLength(255)]
    public string? Url { get; set; }
}

