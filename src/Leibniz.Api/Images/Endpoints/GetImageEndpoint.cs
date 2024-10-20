using Leibniz.Api.Authentication;
using Microsoft.Extensions.Options;

namespace Leibniz.Api.Images.Endpoints;
public class GetImageEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-image", Handle)
        .Produces<IResult>()
        .AllowAnonymous()
        .WithSummary("Retrieve a image");

    // Request / Response
    public record GetImageRequest(string ImageFileName, int? Width = default, int Height = default);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IImagesService imagesService,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromServices] IDateTimeService dateTimeService,
        [FromServices] IOptions<AuthenticationConfiguration> configs,
        [AsParameters] GetImageRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var parts = request.ImageFileName.Split('~');
        var fileName = parts.ElementAt(0);
        Guid.TryParse(parts.ElementAt(1), out var guid);

        var allowSinceTime = dateTimeService.NowUtc.AddMinutes(-configs.Value.ExpirationInMinutes);

        if (!database.Users.Any(x => x.QueryStringToken == guid && x.UpdateDateUtc >= allowSinceTime))
        {
            return TypedResults.Forbid();
        }

        var imageFilePath = await imagesService.GetImageFilePathAsync(fileName, request.Width, request.Height, cancellationToken);
        if (imageFilePath is null)
        {
            return TypedResults.NotFound();
        }

        return Results.File(imageFilePath, "application/octet-stream", Path.GetFileName(imageFilePath));
    }

    // Validations
    public class Validator : AbstractValidator<GetImageRequest>
    {
        public Validator()
        {
            RuleFor(x => x.ImageFileName)
                .NotEmpty();
        }
    }
}


