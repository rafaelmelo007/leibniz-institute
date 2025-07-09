namespace Leibniz.Api.Charts.Domain;
public record Chart : AuditableEntity
{
    [Key]
    public long ChartId { get; set; }
    [MaxLength(255)]
    public string? Name { get; set; }
    public string? Content { get; set; }
}
