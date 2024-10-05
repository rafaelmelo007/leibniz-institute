using Leibniz.Api.Images.Endpoints;

namespace Leibniz.Api.Images;
public static class Setup
{
    public static void MapImageEndpoints(this WebApplication app)
    {
        var root = app.MapGroup("");

        root.MapGroup("/images")
            .WithTags("Images")
            .RequireAuthorization()
            .MapEndpoint<GetImageEndpoint>()
            .MapEndpoint<GetImageByRefEndpoint>()
            .MapEndpoint<UploadImageByRefEndpoint>()
            .MapEndpoint<RemoveImageByRefEndpoint>()
            .MapEndpoint<ImageExistsByRefEndpoint>();
    }
}

