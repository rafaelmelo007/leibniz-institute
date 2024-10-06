
namespace Leibniz.Api.Relationships.Dtos;
public record RelatedEntity
{
    public EntityType Type { get; set; }
    public long Id { get; set; }
    public string? Name { get; set; }
    public long? AssignedId { get; set; }
    public List<long?> AssignedIds { get; internal set; }
}
