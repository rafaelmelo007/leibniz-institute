using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;

namespace Leibniz.Api.Data.Services;
public class DapperConnectionFactory : IDapperConnectionFactory
{
    private readonly DataConfiguration _dataConfiguration;
    public DapperConnectionFactory(
        IOptions<DataConfiguration> dataConfiguration)
    {
        _dataConfiguration = dataConfiguration?.Value
            ?? throw new ArgumentNullException(nameof(dataConfiguration));
    }

    public IDapperConnectionService Create(
        string serverName, string databaseName,
        string? connectionString = default)
    {
        var builder = new SqlConnectionStringBuilder(
            connectionString ?? _dataConfiguration.ConnectionString);
        builder.DataSource = serverName ?? builder.DataSource;
        builder.InitialCatalog = databaseName ?? builder.InitialCatalog;
        return CreateFromConnectionString(builder.ConnectionString);
    }

    public IDapperConnectionService CreateFromConnectionString(string connectionString)
    {
        return new DapperConnectionService(connectionString);
    }
}
