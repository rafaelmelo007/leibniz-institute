namespace Leibniz.Api.Periods.Domain;
public record Period : AuditableEntity
{
    [Key]
    public long PeriodId { get; set; }

    [MaxLength(450)]
    public string? Name { get; set; }
    public string? Content { get; set; }
}

