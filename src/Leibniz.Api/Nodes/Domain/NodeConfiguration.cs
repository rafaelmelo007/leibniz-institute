namespace Leibniz.Api.Nodes.Domain;
public class NodeConfiguration : IEntityTypeConfiguration<Node>
{
    public void Configure(EntityTypeBuilder<Node> builder)
    {
        builder.HasKey(f => f.NodeId);

        builder.Property(f => f.NodeId)
            .ValueGeneratedOnAdd();

        builder.HasIndex(f => new { f.Name });

        builder.HasIndex(f => new { f.UpdateDateUtc, f.CreateDateUtc });

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}