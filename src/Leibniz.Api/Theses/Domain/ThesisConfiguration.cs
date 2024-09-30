namespace Leibniz.Api.Theses.Domain;
public class ThesisConfiguration : IEntityTypeConfiguration<Thesis>
{
    public void Configure(EntityTypeBuilder<Thesis> builder)
    {
        builder.HasKey(f => f.ThesisId);

        builder.Property(f => f.ThesisId)
            .ValueGeneratedOnAdd();

        builder.HasIndex(f => new { f.Name });

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}