namespace Leibniz.Api.Topics.Domain;
public record Topic : AuditableEntity
{
    [Key]
    public long TopicId { get; set; }

    [MaxLength(450)]
    public string? Name { get; set; }
    public string? Content { get; set; }
}

