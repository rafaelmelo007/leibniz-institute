namespace Leibniz.Api.Common.Services;
public interface IDateTimeService
{
    DateTime NowUtc { get; }
    DateTimeOffset NowUtcOffset { get; }
    short Year { get; }
    short Century { get; }
}