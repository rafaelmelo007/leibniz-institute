namespace Leibniz.Api.Data.Services;
public interface IDapperConnectionService : IDisposable
{
    IEnumerable<T> QueryRawSql<T>(string? sql,
        object? parms = null);
    int ExecuteRawSql(string sql, object? parms = null);
    T ExecuteScalarSql<T>(string sql, object parms = null, int? commandTimeout = null);
    List<IEnumerable<T>> QueryRawMultipleSql<T>(
        string sql, object parms = null);
    IEnumerable<T> QueryProcedureSql<T>(string? sql,
        object? parms = null);
}

