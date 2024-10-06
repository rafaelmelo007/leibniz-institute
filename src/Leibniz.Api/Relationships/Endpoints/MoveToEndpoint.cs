namespace Leibniz.Api.Relationships.Endpoints;
public class MoveToEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPut($"/move-to", Handle)
        .Produces<MoveToResponse>()
        .WithSummary("Save a set of relationships from database");

    // Request / Response
    public record MoveToRequest(EntityType FromType, long Id, EntityType ToType);
    public record MoveToResponse(EntityType Type, long Id);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] IRelationshipService relationshipService,
        [FromBody] MoveToRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }


        var newId = await relationshipService.MoveToAsync(request.FromType, request.Id, request.ToType, cancellationToken);

        return TypedResults.Ok(new MoveToResponse(Type: request.ToType, Id: newId));
    }

    // Validations
    public class Validator : AbstractValidator<MoveToRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Id)
                .GreaterThanOrEqualTo(0);
        }
    }
}


