namespace Leibniz.Api.Images.Endpoints;
public class ImageExistsByRefEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/image-exists-by-ref", Handle)
        .Produces<ImageExistsByRefResponse>()
        .AllowAnonymous()
        .WithSummary("Check if an image exists or not");

    // Request / Response
    public record ImageExistsByRefRequest(EntityType Type, long Id, Guid QueryStringToken);
    public record ImageExistsByRefResponse(bool Exists);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IImagesService imagesService,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromServices] IDateTimeService dateTimeService,
        [AsParameters] ImageExistsByRefRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var image = database.Images.FirstOrDefault(x =>
            (x.EntityType == request.Type && x.EntityId == request.Id));

        var allowSinceTime = dateTimeService.NowUtc.AddHours(-4);
        if (!database.Users.Any(x => x.QueryStringToken == request.QueryStringToken && x.UpdateDateUtc >= allowSinceTime))
        {
            return TypedResults.Forbid();
        }

        if (image is null || string.IsNullOrWhiteSpace(image.ImageFileName))
        {
            return TypedResults.Ok(new ImageExistsByRefResponse(false));
        }
        else
        {
            return TypedResults.Ok(new ImageExistsByRefResponse(true));
        }

    }

    // Validations
    public class Validator : AbstractValidator<ImageExistsByRefRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Id)
                .GreaterThanOrEqualTo(0);
        }
    }
}
