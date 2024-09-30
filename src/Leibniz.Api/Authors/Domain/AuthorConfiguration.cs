namespace Leibniz.Api.Authors.Domain;
public class AuthorConfiguration : IEntityTypeConfiguration<Author>
{
    public void Configure(EntityTypeBuilder<Author> builder)
    {
        builder.HasKey(f => f.AuthorId);

        builder.Property(f => f.AuthorId)
            .ValueGeneratedOnAdd();

        builder.HasIndex(f => new { f.Name });

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}