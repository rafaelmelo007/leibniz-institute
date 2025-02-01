namespace Leibniz.Api.Relationships.Endpoints;
public class GetRelationshipsEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-relationships", Handle)
        .Produces<ResultSet<RelationshipRead>>()
        .WithSummary("Retrieve a set of relationships from database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record GetRelationshipsRequest(
        EntityType Type, long Id, EntityType? FilterType,
        bool OnlyPrimary = false, EntityType? AddType = null,
        long? AddId = null);
    public record RelationshipRead(EntityType Type, 
        long Id, string? Label, bool IsPrimary);

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

        if (request.AddType != null && request.AddId != null)
        {
            var addName = relationshipService.GetRelationshipName(request.AddType!.Value, request.AddId!.Value);
            rows.Add(new RelationshipRead(request.AddType!.Value, request.AddId!.Value, addName, false));
        }

        return TypedResults.Ok(
            new ResultSet<RelationshipRead>
            {
                Data = rows,
                Index = 0,
                Count = rows.Count,
                Type = request.Type,
                Id = request.Id,
                FilterType = request.FilterType,
                Limit = rows.Count,
            });
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


