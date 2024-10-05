namespace Leibniz.Api.Common;
public record EmailConfiguration
{
    public string? EmailFrom { get; set; }
    public string? Password { get; set; }
    public string? Host { get; set; }
    public int Port { get; set; }
    public bool RequireSsl { get; set; }
}
