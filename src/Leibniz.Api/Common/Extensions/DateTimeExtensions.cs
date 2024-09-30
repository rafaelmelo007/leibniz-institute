namespace Leibniz.Api.Common.Extensions;
public static class DateTimeExtensions
{
    public static DateOnly ToDateOnly(this DateTime dt)
    {
        var date = new DateOnly(dt.Year, dt.Month, dt.Day);
        return date;
    }
}
