namespace Leibniz.Api.Relationships.Endpoints;
public class GetRelationshipsContentEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-relationships-content", Handle)
        .Produces<GetRelationshipsContentResponse>()
        .WithSummary("Retrieve a set of relationships with content from database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record GetRelationshipsContentRequest(EntityType Type, long Id,
        EntityType? FilterType, bool OnlyPrimary = false);
    public record GetRelationshipsContentResponse(List<RelationshipContentRead> Data, int Index, int Limit, int Count);
    public record RelationshipContentRead(EntityType TypeId, long Id, string? Label, string Content, string Author, bool IsPrimary);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] IRelationshipService relationshipService,
        [AsParameters] GetRelationshipsContentRequest request,
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
                return new RelationshipContentRead(entityType!.Value, entityId, label, default, default, x.IsPrimary ?? false);
            }

            if (request.FilterType == entityType && request.FilterType == EntityType.Post)
            {
                var post = database.Posts.FirstOrDefault(x => x.PostId == entityId);
                return new RelationshipContentRead(entityType!.Value, entityId, post.Title, post.Content, post.Author, x.IsPrimary ?? false);
            }

            if (request.FilterType == entityType)
            {
                var label = relationshipService.GetRelationshipName(entityType!.Value, entityId);
                return new RelationshipContentRead(entityType!.Value, entityId, label, default, default, x.IsPrimary ?? false);
            }

            return null;
        }).Where(x => x != null).ToList();

        return TypedResults.Ok(new GetRelationshipsContentResponse(rows, 0, rows.Count, rows.Count));
    }

    // Validations
    public class Validator : AbstractValidator<GetRelationshipsContentRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Id)
                .GreaterThanOrEqualTo(0);
        }
    }
}


