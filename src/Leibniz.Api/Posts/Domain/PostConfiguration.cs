namespace Leibniz.Api.Posts.Domain;
public class PostConfiguration : IEntityTypeConfiguration<Post>
{
    public void Configure(EntityTypeBuilder<Post> builder)
    {
        builder.HasKey(f => f.PostId);

        builder.Property(f => f.PostId)
            .ValueGeneratedOnAdd();

        builder.HasIndex(f => new { f.Title, f.Author });

        builder.HasIndex(f => new { f.UpdateDateUtc, f.CreateDateUtc });

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}