namespace Leibniz.Api.Common.Services;
public interface ILogger
{
    void Debug(string messageTemplate, params object[] parameters);
    void Info(string messageTemplate, params object[] parameters);
    void Warn(string messageTemplate, params object[] parameters);
    void Error(Exception ex, string messageTemplate, params object[] parameters);
}
