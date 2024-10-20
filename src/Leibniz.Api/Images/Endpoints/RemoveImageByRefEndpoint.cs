using Leibniz.Api.Authentication;
using Microsoft.Extensions.Options;

namespace Leibniz.Api.Images.Endpoints;
public class RemoveImageByRefEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapDelete($"/remove-image-by-ref", Handle)
        .Produces<IResult>()
        .AllowAnonymous()
        .WithSummary("Remove image from the server by ref");

    // Request / Response
    public record RemoveImageByRefRequest(EntityType Type, long Id, Guid QueryStringToken);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IImagesService imagesService,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromServices] IDateTimeService dateTimeService,
        [FromServices] IOptions<AuthenticationConfiguration> configs,
        [AsParameters] RemoveImageByRefRequest request,
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

        if (image is null)
        {
            return TypedResults.Ok(new { success = true });
        }
        else
        {
            database.Images.Remove(image);
        }

        var allowSinceTime = dateTimeService.NowUtc.AddMinutes(-configs.Value.ExpirationInMinutes);
        if (!database.Users.Any(x => x.QueryStringToken == request.QueryStringToken && x.UpdateDateUtc >= allowSinceTime))
        {
            return TypedResults.Forbid();
        }

        var success = await imagesService.RemoveImageAsync(image.ImageFileName, cancellationToken);
        if (success)
        {
            await database.SaveChangesAsync(cancellationToken);
        }

        return TypedResults.Ok(new { success });
    }

    // Validations
    public class Validator : AbstractValidator<RemoveImageByRefRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Id)
                .GreaterThanOrEqualTo(0);
        }
    }
}
