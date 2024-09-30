namespace Leibniz.Api.Links.Domain;
public class LinkConfiguration : IEntityTypeConfiguration<Link>
{
    public void Configure(EntityTypeBuilder<Link> builder)
    {
        builder.HasKey(f => f.LinkId);

        builder.Property(f => f.LinkId)
            .ValueGeneratedOnAdd();

        builder.Property(f => f.Url)
            .HasMaxLength(500);

        builder.HasIndex(f => f.Name);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}