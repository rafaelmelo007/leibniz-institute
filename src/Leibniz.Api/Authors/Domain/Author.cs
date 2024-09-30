namespace Leibniz.Api.Authors.Domain;
public record Author : AuditableEntity
{
    [Key]
    public long AuthorId { get; set; }

    [MaxLength(450)]
    public string? Name { get; set; }
    public string? Content { get; set; }
}

