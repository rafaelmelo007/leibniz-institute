namespace Leibniz.Api.Images.Domain;

public class ImageConfiguration : IEntityTypeConfiguration<Image>
{
    public void Configure(EntityTypeBuilder<Image> builder)
    {
        builder.HasKey(f => f.ImageId);

        builder.Property(f => f.ImageId)
            .ValueGeneratedOnAdd();

        builder.Property(x => x.ImageFileName)
            .HasMaxLength(500);

        builder.HasIndex(f => new { f.ImageFileName });

        builder.HasIndex(f => new { f.EntityType, f.EntityId });

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}