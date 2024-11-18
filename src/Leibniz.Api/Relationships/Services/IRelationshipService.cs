using Leibniz.Api.Relationships.Dtos;

namespace Leibniz.Api.Relationships.Services;
public interface IRelationshipService
{
    void AddRelationshipByNames(EntityType sourceA, string nameA, EntityType sourceB, string nameB);
    Task<IEnumerable<RelatedEntity>> GetRelatedEntitiesAsync(EntityType type, List<long> ids, 
        bool onlyPrimary, EntityType? filterType, long? filterId, CancellationToken cancellationToken);
    string? GetRelationshipName(EntityType source, long id);
    Task<long> MoveToAsync(EntityType fromType, long id, EntityType toType, CancellationToken cancellationToken);
    int SaveRelationships(EntityType type, long id, List<KeyValuePair<EntityType, long>> items, long[] primaryIds);
}
