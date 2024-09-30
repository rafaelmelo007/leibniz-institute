using Dapper;
using Leibniz.Api.Data.Exceptions;
using Microsoft.Data.SqlClient;

namespace Leibniz.Api.Data.Services;
public class DapperConnectionService : IDapperConnectionService
{
    private readonly SqlConnection _sqlConnection;

    public DapperConnectionService(string connectionString)
    {
        _sqlConnection = new SqlConnection(connectionString);
    }

    public List<IEnumerable<T>> QueryRawMultipleSql<T>(
        string sql, object parms = null)
    {
        try
        {
            var results = new List<IEnumerable<T>>();
            var reader = _sqlConnection.QueryMultiple(sql, parms);
            while (!reader.IsConsumed)
            {
                results.Add((reader.Read<T>()).ToList());
            }
            return results;
        }
        catch (SqlException ex)
        {
            throw new DapperConnectionException("Unable to query the data from database", ex);
        }
    }

    public int ExecuteRawSql(string sql, object parms = null)
    {
        try
        {
            return _sqlConnection.Execute(sql, parms);
        }
        catch (SqlException ex)
        {
            throw new DapperConnectionException("Unable to execute the statement in database", ex);
        }
    }

    public T ExecuteScalarSql<T>(string sql, object parms = null, int? commandTimeout = null)
    {
        try
        {
            return _sqlConnection.ExecuteScalar<T>(sql, parms, commandTimeout: commandTimeout);
        }
        catch (SqlException ex)
        {
            throw new DapperConnectionException("Unable to execute the statement in database", ex);
        }
    }

    public IEnumerable<T> QueryRawSql<T>(string sql, object parms = null)
    {
        try
        {
            return _sqlConnection.Query<T>(sql, parms);
        }
        catch (SqlException ex)
        {
            throw new DapperConnectionException("Unable to query the data from database", ex);
        }
    }

    public IEnumerable<T> QueryProcedureSql<T>(string? sql, object? parms = null)
    {
        try
        {
            if (parms is IDictionary<string, string>)
            {
                parms = ConvertToDynamicParameters(parms as IDictionary<string, string>);
            }
            return _sqlConnection.Query<T>(sql, parms,
                commandType: System.Data.CommandType.StoredProcedure);
        }
        catch (SqlException ex)
        {
            throw new DapperConnectionException("Unable to query the data from database", ex);
        }
    }

    private DynamicParameters ConvertToDynamicParameters(IDictionary<string, string>? args)
    {
        var obj = new DynamicParameters();
        foreach (var key in args.Keys)
        {
            obj.Add(key, args[key]);
        }
        return obj;
    }

    public void Dispose()
    {
        try
        {
            if (_sqlConnection is not null &&
                _sqlConnection.State == System.Data.ConnectionState.Open)
            {
                _sqlConnection.Close();
            }
            _sqlConnection.Dispose();
        }
        catch { }
    }
}
