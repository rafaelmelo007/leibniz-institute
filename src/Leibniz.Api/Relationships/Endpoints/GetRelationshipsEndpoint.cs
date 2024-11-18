using static Leibniz.Api.Relationships.Endpoints.GetRelationshipsContentEndpoint;

namespace Leibniz.Api.Relationships.Endpoints;
public class GetRelationshipsEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-relationships", Handle)
        .Produces<GetRelationshipsResponse>()
        .WithSummary("Retrieve a set of relationships from database");

    // Request / Response
    public record GetRelationshipsRequest(EntityType Type, long Id,
        EntityType? FilterType, bool OnlyPrimary = false);
    public record GetRelationshipsResponse(List<RelationshipRead> Data, int Index, int Limit, int Count);
    public record RelationshipRead(EntityType TypeId, long Id, string? Label, bool IsPrimary);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] IRelationshipService relationshipService,
        [AsParameters] GetRelationshipsRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var relationships = await database.Relationships.Where(x =>
            ((x.EntityTypeA == request.Type && x.EntityIdA == request.Id) ||
            (x.EntityTypeB == request.Type && x.EntityIdB == request.Id)) &&
            (!request.OnlyPrimary || x.IsPrimary.Value)).ToListAsync();

        var rows = relationships.Select(x =>
        {
            var entityType = x.EntityTypeA == request.Type && x.EntityIdA == request.Id ? x.EntityTypeB : x.EntityTypeA;
            var entityId = x.EntityTypeA == request.Type && x.EntityIdA == request.Id ? x.EntityIdB : x.EntityIdA;

            if (request.FilterType is null)
            {
                var label = relationshipService.GetRelationshipName(entityType!.Value, entityId);
                return new RelationshipRead(entityType!.Value, entityId, label, x.IsPrimary ?? false);
            }

            if (request.FilterType == entityType)
            {
                var label = relationshipService.GetRelationshipName(entityType!.Value, entityId);
                return new RelationshipRead(entityType!.Value, entityId, label, x.IsPrimary ?? false);
            }

            return null;
        }).Where(x => x != null).ToList();

        return TypedResults.Ok(new GetRelationshipsResponse(rows, 0, rows.Count, rows.Count));
    }

    // Validations
    public class Validator : AbstractValidator<GetRelationshipsRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Id)
                .GreaterThanOrEqualTo(0);
        }
    }
}


