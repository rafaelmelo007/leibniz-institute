namespace Leibniz.Api.Areas.Endpoints;
public class RemoveAreaEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapDelete($"/remove-area", Handle)
        .Produces<RemoveAreaResponse>()
        .Produces<BadRequestObjectResult>(StatusCodes.Status400BadRequest)
        .WithSummary("Delete an existing area in the database");

    // Request / Response
    public record RemoveAreaRequest
    {
        public long AreaId { get; init; }
    }
    public record RemoveAreaResponse(bool Success);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] RemoveAreaRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var found = await database.Areas.SingleOrDefaultAsync(x => x.AreaId == request.AreaId, cancellationToken);
        if (found is null)
        {
            notifications.AddNotification($"Area '{request.AreaId}' not found");
            return notifications.ToBadRequest();
        }

        database.Areas.Remove(found);
        var success = await database.SaveChangesAsync(cancellationToken) > 0;

        return TypedResults.Ok(new RemoveAreaResponse(success));
    }

    // Validations
    public class Validator : AbstractValidator<RemoveAreaRequest>
    {
        public Validator()
        {
            RuleFor(x => x.AreaId)
                .GreaterThan(0);
        }
    }
}




