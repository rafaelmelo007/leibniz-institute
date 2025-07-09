namespace Leibniz.Api.Users.Domain;
public class ForgotPasswordConfiguration : IEntityTypeConfiguration<ForgotPassword>
{
    public void Configure(EntityTypeBuilder<ForgotPassword> builder)
    {
        builder.HasKey(f => f.ForgotPasswordId);

        builder.Property(f => f.ForgotPasswordId)
            .ValueGeneratedOnAdd();
    }
}