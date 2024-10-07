namespace Leibniz.Api.Periods.Domain;
public class PeriodConfiguration : IEntityTypeConfiguration<Period>
{
    public void Configure(EntityTypeBuilder<Period> builder)
    {
        builder.HasKey(f => f.PeriodId);

        builder.Property(f => f.PeriodId)
            .ValueGeneratedOnAdd();

        builder.HasIndex(f => new { f.Name });

        builder.HasIndex(f => new { f.BeginYear, f.EndYear });

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}