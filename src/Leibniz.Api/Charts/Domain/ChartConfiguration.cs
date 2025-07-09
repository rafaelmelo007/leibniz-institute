namespace Leibniz.Api.Charts.Domain;
public class ChartConfiguration : IEntityTypeConfiguration<Chart>
{
    public void Configure(EntityTypeBuilder<Chart> builder)
    {
        builder.HasKey(f => f.ChartId);

        builder.Property(f => f.ChartId)
            .ValueGeneratedOnAdd();

        builder.HasIndex(f => new { f.Name });

        builder.HasIndex(f => new { f.UpdateDateUtc, f.CreateDateUtc });

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}