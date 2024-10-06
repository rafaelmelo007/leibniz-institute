namespace Leibniz.Api.Relationships.Services;
public interface IRelationshipService
{
    void AddRelationshipByNames(EntityType sourceA, string nameA, EntityType sourceB, string nameB);
    string? GetRelationshipName(EntityType source, long id);
    Task<long> MoveToAsync(EntityType fromType, long id, EntityType toType, CancellationToken cancellationToken);
    int SaveRelationships(EntityType type, long id, List<KeyValuePair<EntityType, long>> items);
}
