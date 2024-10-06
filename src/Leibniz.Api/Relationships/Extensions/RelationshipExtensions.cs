using Leibniz.Api.Relationships.Dtos;

namespace Leibniz.Api.Relationships.Extensions;
public static class RelationshipExtensions
{
    public static RelatedEntity ToRelatedEntity(this Relationship relationship, EntityType type, List<long> ids)
    {
        if (relationship.EntityTypeA == type && ids.Contains(relationship.EntityIdA))
        {
            return new RelatedEntity
            {
                Type = relationship.EntityTypeB.Value,
                Id = relationship.EntityIdB,
                AssignedId = relationship.EntityIdA,
            };
        }
        else if (relationship.EntityTypeB == type && ids.Contains(relationship.EntityIdB))
        {
            return new RelatedEntity
            {
                Type = relationship.EntityTypeA.Value,
                Id = relationship.EntityIdA,
                AssignedId = relationship.EntityIdB,
            };
        }
        throw new ArgumentOutOfRangeException();
    }
}
