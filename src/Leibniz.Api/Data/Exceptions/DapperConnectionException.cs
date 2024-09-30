namespace Leibniz.Api.Data.Exceptions;
public class DapperConnectionException : Exception
{
    public DapperConnectionException(string message, Exception inner)
        : base(message, inner)
    { }
}
