using Log = Serilog.Log;
using System.Reflection;

namespace Leibniz.Api.Common.Services;
public class SerilogLogger : ILogger
{
    private static readonly Serilog.ILogger _logger = Log.Logger.ForContext(MethodBase.GetCurrentMethod()!.DeclaringType);

    public SerilogLogger() { }

    public void Debug(string messageTemplate, params object[] parameters)
    {
        _logger.Debug(messageTemplate, parameters);
    }

    public void Error(Exception ex, string messageTemplate, params object[] parameters)
    {
        _logger.Error(ex, messageTemplate, parameters);
    }

    public void Info(string messageTemplate, params object[] parameters)
    {
        _logger.Information(messageTemplate, parameters);
    }

    public void Warn(string messageTemplate, params object[] parameters)
    {
        _logger.Warning(messageTemplate, parameters);
    }
}