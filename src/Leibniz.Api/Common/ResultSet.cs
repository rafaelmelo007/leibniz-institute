namespace Leibniz.Api.Common;
public record ResultSet<T>
{
    public long Index { get; init; }
    public long Limit { get; init; }
    public long Count { get; init; }
    public List<T> Data { get; init; }
    public string? Query { get; init; }
    public EntityType? Type { get; init; }
    public long? Id { get; init; }
    public EntityType? FilterType { get; init; }
    public long? FilterId { get; init; }
    public bool? IsPrimary { get; init; }
}
