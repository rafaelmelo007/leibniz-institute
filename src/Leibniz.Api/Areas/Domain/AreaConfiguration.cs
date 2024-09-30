namespace Leibniz.Api.Areas.Domain;
public class AreaConfiguration : IEntityTypeConfiguration<Area>
{
    public void Configure(EntityTypeBuilder<Area> builder)
    {
        builder.HasKey(f => f.AreaId);

        builder.Property(f => f.AreaId)
            .ValueGeneratedOnAdd();

        builder.HasIndex(f => new { f.Name });

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}