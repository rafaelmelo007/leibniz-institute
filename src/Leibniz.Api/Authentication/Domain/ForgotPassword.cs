namespace Leibniz.Api.Authentication.Domain;
public record ForgotPassword : AuditableEntity
{
    public long ForgotPasswordId { get; set; }
    public long UserId { get; set; }
    public Guid ChangePasswordToken { get; set; }
    public DateTime ValidUntil { get; set; }
    public DateTime? PasswordChangeDate { get; set; }
}
