namespace Leibniz.Api.Images.Endpoints;
public class GetImageEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-image", Handle)
        .Produces<IResult>()
        .AllowAnonymous()
        .WithSummary("Retrieve a image");

    // Request / Response
    public record GetImageRequest(string ImageFileName);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IImagesService imagesService,
        [FromServices] Validator validator,
        [FromServices] AcademyDbContext database,
        [FromServices] IDateTimeService dateTimeService,
        [AsParameters] GetImageRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return validationResult.Errors.ToProblems();
        }

        var parts = request.ImageFileName.Split('~');
        var fileName = parts.ElementAt(0);
        Guid.TryParse(parts.ElementAt(1), out var guid);

        var allowSinceTime = dateTimeService.NowUtc.AddHours(-4);

        if (!database.Users.Any(x => x.QueryStringToken == guid && x.UpdateDateUtc >= allowSinceTime))
        {
            return TypedResults.Forbid();
        }

        var image = await database.Images.FirstOrDefaultAsync(x => x.ImageFileName == fileName);
        if (image is null) return TypedResults.NotFound();

        var imageFilePath = imagesService.GetFilePath(image.ImageFileName);
        return Results.File(imageFilePath, "application/octet-stream", image.ImageFileName);
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


