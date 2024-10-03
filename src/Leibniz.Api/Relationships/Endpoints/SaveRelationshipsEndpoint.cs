namespace Leibniz.Api.Relationships.Endpoints;
public class SaveRelationshipsEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPost($"/save-relationships", Handle)
        .Produces<SaveRelationshipsResponse>()
        .WithSummary("Save a set of relationships from database");

    // Request / Response
    public record SaveRelationshipsRequest(EntityType Type, long Id, [FromBody] RelationshipSave[] Items);
    public record SaveRelationshipsResponse(int Affected);
    public record RelationshipSave(EntityType TypeId, long Id, string? Label);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] IRelationshipService relationshipService,
        [AsParameters] SaveRelationshipsRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var relatedItems = request.Items.Select(x => new KeyValuePair<EntityType, long>(x.TypeId, x.Id)).ToList();
        var affected = relationshipService.SaveRelationships(request.Type, request.Id, relatedItems);

        return TypedResults.Ok(new SaveRelationshipsResponse(affected));
    }

    // Validations
    public class Validator : AbstractValidator<SaveRelationshipsRequest>
    {
        public Validator()
        {
        }
    }
}


