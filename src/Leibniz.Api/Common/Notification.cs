namespace Leibniz.Api.Common;
public record Notification
{
    public string Message { get; }
    public string Code { get; }

    public Notification(string message, string code = "")
    {
        Message = message;
        Code = code;
    }
}
