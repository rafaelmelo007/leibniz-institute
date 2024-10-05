namespace Leibniz.Api.Images.Endpoints;
public class UploadImageByRefEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPost($"/upload-image-by-ref", Handle)
        .Produces<IResult>()
        .AllowAnonymous()
        .WithSummary("Upload image to the server by ref");

    // Request / Response
    public record UploadImageByRefRequest(EntityType Type, long Id, Guid QueryStringToken);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IImagesService imagesService,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromServices] IDateTimeService dateTimeService,
        [AsParameters] UploadImageByRefRequest request,
        HttpContext context,
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

        var file = context.Request.Form.Files.FirstOrDefault();
        if (file is null)
        {
            return TypedResults.NotFound();
        }

        if (image is null)
        {
            image = new Image();
            image.EntityType = request.Type;
            image.EntityId = request.Id;
            image.ImageFileName = file.FileName;
            await database.Images.AddAsync(image, cancellationToken);
        }
        else
        {
            image.ImageFileName = file.FileName;
        }

        var allowSinceTime = dateTimeService.NowUtc.AddHours(-4);
        if (!database.Users.Any(x => x.QueryStringToken == request.QueryStringToken && x.UpdateDateUtc >= allowSinceTime))
        {
            return TypedResults.Forbid();
        }

        var success = await imagesService.SaveImageAsync(file.FileName, file.OpenReadStream(), cancellationToken);
        if (success)
        {
            await database.SaveChangesAsync(cancellationToken);
        }

        return TypedResults.Ok(new { success });
    }

    // Validations
    public class Validator : AbstractValidator<UploadImageByRefRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Id)
                .GreaterThanOrEqualTo(0);
        }
    }
}
