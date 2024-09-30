namespace Leibniz.Api.Common.Services;
public class DateTimeService : IDateTimeService
{
    public DateTime NowUtc => DateTime.UtcNow;
    public DateTimeOffset NowUtcOffset => DateTimeOffset.UtcNow;
    public short Year => (short)DateTime.Now.Year;
    public short Century => (short)(((short)DateTime.Now.Year - 1) / 100 + 1);
}
