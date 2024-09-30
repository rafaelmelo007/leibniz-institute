namespace Leibniz.Api.Common;
public record AuditableEntity
{
    public DateTime CreateDateUtc { get; set; }
    public long CreatedBy { get; set; }
    public DateTime? UpdateDateUtc { get; set; }
    public long? UpdatedBy { get; set; }
    public DateTime? DeleteDateUtc { get; set; }
    public long? DeletedBy { get; set; }
    public bool IsDeleted { get; set; } = false;
}
