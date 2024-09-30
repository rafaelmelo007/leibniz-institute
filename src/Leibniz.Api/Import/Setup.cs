using Leibniz.Api.Import.Endpoints;

namespace Leibniz.Api.Import;
public static class Setup
{
    public static void MapImportEndpoints(this WebApplication app)
    {
        var root = app.MapGroup("");

        root.MapGroup("/import")
            .WithTags("Import")
            .RequireAuthorization()
            .MapEndpoint<FromRefDbEndpoint>();
    }

}
