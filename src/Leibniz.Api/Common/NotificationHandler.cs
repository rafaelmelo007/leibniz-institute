

namespace Leibniz.Api.Common;
public class NotificationHandler
{
    private readonly List<Notification> _notifications = new();

    public void AddNotification(string message, string code = "")
    {
        _notifications.Add(new Notification(message, code));
    }

    public void AddNotification(Notification notification)
    {
        _notifications.Add(notification);
    }

    public bool HasNotifications() => _notifications.Any();

    public List<Notification> GetNotifications() => _notifications;

    public void AddValidationErrors(List<ValidationFailure> errors)
    {
        foreach (var error in errors)
        {
            AddNotification(new Notification(error.ErrorMessage, error.ErrorCode));
        }
    }

    public IResult ToBadRequest()
    {
        return TypedResults.BadRequest(_notifications);
    }
}
