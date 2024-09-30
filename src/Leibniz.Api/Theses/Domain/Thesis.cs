namespace Leibniz.Api.Theses.Domain;
public record Thesis : AuditableEntity
{
    [Key]
    public long ThesisId { get; set; }

    [MaxLength(450)]
    public string? Name { get; set; }
    public string? Content { get; set; }
}

