﻿namespace Leibniz.Api.Images.Endpoints;
public class GetImageByRefEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-image-by-ref", Handle)
        .Produces<IResult>()
        .AllowAnonymous()
        .WithSummary("Retrieve a image");

    // Request / Response
    public record GetImageByRefRequest(EntityType Type, long Id, Guid QueryStringToken);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IImagesService imagesService,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromServices] IDateTimeService dateTimeService,
        [AsParameters] GetImageByRefRequest request,
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

        if (image is null || string.IsNullOrWhiteSpace(image.ImageFileName))
        {
            return TypedResults.NotFound();
        }

        var allowSinceTime = dateTimeService.NowUtc.AddHours(-4);
        if (!database.Users.Any(x => x.QueryStringToken == request.QueryStringToken && x.UpdateDateUtc >= allowSinceTime))
        {
            return TypedResults.Forbid();
        }

        var imageFilePath = await imagesService.GetImageFilePathAsync(image.ImageFileName, default, default, cancellationToken);
        if (imageFilePath is null)
        {
            return TypedResults.NotFound();
        }

        return Results.File(imageFilePath, "application/octet-stream", Path.GetFileName(imageFilePath));
    }

    // Validations
    public class Validator : AbstractValidator<GetImageByRefRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Id)
                .GreaterThanOrEqualTo(0);
        }
    }
}