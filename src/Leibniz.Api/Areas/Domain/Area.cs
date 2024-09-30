namespace Leibniz.Api.Areas.Domain;
public record Area : AuditableEntity
{
    [Key]
    public long AreaId { get; set; }

    [MaxLength(450)]
    public string? Name { get; set; }
    public string? Content { get; set; }
}

