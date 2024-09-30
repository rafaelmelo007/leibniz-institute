namespace Leibniz.Api.Authentication.Domain;
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(f => f.UserId);

        builder.Property(f => f.UserId)
            .ValueGeneratedOnAdd();

        builder.Property(f => f.Email)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(f => f.Phone)
            .HasMaxLength(20);

        builder.Property(f => f.PasswordHash)
            .IsRequired()
            .HasMaxLength(555);

        builder.Property(f => f.Salt)
            .IsRequired()
            .HasMaxLength(555);

        builder.Property(f => f.City)
            .HasMaxLength(100);

        builder.Property(f => f.State)
            .HasMaxLength(30);

        builder.Property(f => f.Cpf)
            .HasMaxLength(30);

        builder.Property(f => f.Role)
            .HasMaxLength(30);

        builder.Property(f => f.Website)
            .HasMaxLength(200);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}