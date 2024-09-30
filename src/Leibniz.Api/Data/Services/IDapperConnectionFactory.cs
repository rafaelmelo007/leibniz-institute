namespace Leibniz.Api.Data.Services;
public interface IDapperConnectionFactory
{
    IDapperConnectionService Create(string serverName, string databaseName,
        string? connectionString = default);
    IDapperConnectionService CreateFromConnectionString(string? connectionString);
}
