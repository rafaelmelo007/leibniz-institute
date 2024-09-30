namespace Leibniz.Api.Books.Domain;
public class BookConfiguration : IEntityTypeConfiguration<Book>
{
    public void Configure(EntityTypeBuilder<Book> builder)
    {
        builder.HasKey(f => f.BookId);

        builder.Property(f => f.BookId)
            .ValueGeneratedOnAdd();

        builder.HasIndex(f => new { f.Title, f.Author });

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}