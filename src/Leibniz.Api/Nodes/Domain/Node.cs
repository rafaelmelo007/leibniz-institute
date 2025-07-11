namespace Leibniz.Api.Nodes.Domain;
public record Node : AuditableEntity
{
    [Key]
    public long NodeId { get; set; }
    [MaxLength(2000)]
    public string? Name { get; set; }
    public string? ChartData { get; set; }
    public long? ParentNodeId { get; set; }
}
