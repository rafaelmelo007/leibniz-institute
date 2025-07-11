namespace Leibniz.Api.Relationships.Domain;

[JsonConverter(typeof(JsonEnumToDescriptionConverter<EntityType>))]
public enum EntityType : short
{
    [Description("post")]
    Post = 1,

    [Description("link")]
    Link = 2,

    [Description("area")]
    Area = 3,

    [Description("author")]
    Author = 4,

    [Description("book")]
    Book = 5,

    [Description("period")]
    Period = 6,

    [Description("thesis")]
    Thesis = 7,

    [Description("topic")]
    Topic = 8,

    [Description("chart")]
    Chart = 9,

    [Description("node")]
    Node = 10,

    [Description("unknown")]
    Unknown = 99
}
