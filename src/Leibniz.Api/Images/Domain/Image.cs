namespace Leibniz.Api.Images.Domain;
public record Image : AuditableEntity
{
    [Key]
    public long ImageId { get; set; }
    public string? ImageFileName { get; set; }
    public EntityType EntityType { get; set; }
    public long EntityId { get; set; }
}
