
namespace Leibniz.Api.Relationships.Domain;
public record Relationship : AuditableEntity
{
    [Key]
    public long RelationshipId { get; set; }
    public EntityType? EntityTypeA { get; set; }
    public long EntityIdA { get; set; }
    public EntityType? EntityTypeB { get; set; }
    public long EntityIdB { get; set; }
    public bool? IsPrimary { get; set; }
}

