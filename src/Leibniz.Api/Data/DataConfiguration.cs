namespace Leibniz.Api.Data;
public record DataConfiguration
{
    public string? ConnectionString { get; init; }
    public bool RunMigrations { get; init; }
}
