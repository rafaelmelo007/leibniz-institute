namespace Leibniz.Api.Relationships.Domain;
public class RelationshipConfiguration : IEntityTypeConfiguration<Relationship>
{
    public void Configure(EntityTypeBuilder<Relationship> builder)
    {
        builder.HasKey(f => f.RelationshipId);

        builder.Property(f => f.RelationshipId)
            .ValueGeneratedOnAdd();

        builder.HasIndex(f => new { f.EntityTypeA, f.EntityIdA });
        builder.HasIndex(f => new { f.EntityTypeB, f.EntityIdB });
        builder.HasIndex(x => x.IsPrimary);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}