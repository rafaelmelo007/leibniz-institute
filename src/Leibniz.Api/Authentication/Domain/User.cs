namespace Leibniz.Api.Authentication.Domain;
public record User : AuditableEntity
{
    public long UserId { get; set; }
    public string FullName { get; set; }
    public string? Cpf { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string Email { get; set; }
    public byte[] PasswordHash { get; set; }
    public byte[] Salt { get; set; }
    public string Role { get; set; }
    public bool? AcceptedTermsAndConditions { get; set; }
    public Guid? QueryStringToken { get; set; }
}
