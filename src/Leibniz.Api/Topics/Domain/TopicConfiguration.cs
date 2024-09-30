namespace Leibniz.Api.Topics.Domain;
public class TopicConfiguration : IEntityTypeConfiguration<Topic>
{
    public void Configure(EntityTypeBuilder<Topic> builder)
    {
        builder.HasKey(f => f.TopicId);

        builder.Property(f => f.TopicId)
            .ValueGeneratedOnAdd();

        builder.HasIndex(f => new { f.Name });

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}