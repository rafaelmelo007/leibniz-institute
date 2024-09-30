

namespace Leibniz.Api.Relationships.Services;
public interface IRelationshipService
{
    void AddRelationshipByNames(EntityType sourceA, string nameA, EntityType sourceB, string nameB);
    string? GetRelationshipName(EntityType source, long id);
    int SaveRelationships(EntityType type, long id, Dictionary<EntityType, long> items);
}
