namespace Leibniz.Api.Common;
public class JsonEnumToDescriptionConverter<T> : JsonConverter<T> where T : Enum
{
    public override T Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var stringValue = reader.GetString();
        return (T)Enum.Parse(typeof(T), stringValue!, true);
    }

    public override void Write(Utf8JsonWriter writer, T value, JsonSerializerOptions options)
    {
        var type = typeof(T);

        var memberInfo = type.GetMember(value.ToString())[0];

        var descriptionAttribute = memberInfo
            .GetCustomAttributes(typeof(DescriptionAttribute), false)
            .FirstOrDefault() as DescriptionAttribute;

        var stringValue = descriptionAttribute?.Description ?? value.ToString();
        writer.WriteStringValue(stringValue);
    }
}