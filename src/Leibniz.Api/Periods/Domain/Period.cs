namespace Leibniz.Api.Periods.Domain;
public record Period : AuditableEntity
{
    [Key]
    public long PeriodId { get; set; }

    [MaxLength(450)]
    public string? Name { get; set; }
    public string? Content { get; set; }
    public short? BeginYear { get; set; }
    public short? BeginMonth { get; set; }
    public short? BeginDay { get; set; }
    public short? EndYear { get; set; }
    public short? EndMonth { get; set; }
    public short? EndDay { get; set; }
}

