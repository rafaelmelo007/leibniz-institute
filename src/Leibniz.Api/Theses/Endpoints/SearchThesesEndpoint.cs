namespace Leibniz.Api.Theses.Endpoints;
public class SearchThesesEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/search-theses", Handle)
        .Produces<SearchThesesResponse>()
        .WithSummary("Search a set of theses from database");

    // Request / Response
    public record SearchThesesRequest(int Index, int Limit, EntityType Type, long Id, bool Primary = false);
    public record SearchThesesResponse(IEnumerable<SearchThesesRead> Data, int Index, int Limit, int Count);
    public record SearchThesesRead(long ThesisId, string? Name, string? Content, string ImageFileName);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] IRelationshipService relationshipService,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] SearchThesesRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var thesisIds = (await relationshipService.GetRelatedEntitiesAsync(request.Type,
            new List<long> { request.Id }, request.Primary, default, default, cancellationToken))
            .Where(x => x.Type == EntityType.Thesis).Select(x => x.Id).ToList();

        var query = database.Theses.AsQueryable();
        var rows = await query.Where(x => thesisIds.Contains(x.ThesisId)).OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc).Skip(request.Index).Take(request.Limit).ToListAsync();

        var count = await query.CountAsync();

        var ids = rows.Select(x => x.ThesisId).ToList();
        var images = database.Images.Where(x => x.EntityType == EntityType.Thesis && ids.Contains(x.EntityId)).ToDictionary(x => x.EntityId, x => x.ImageFileName);
        var theses = rows.Select(x => new SearchThesesRead
        (
            ThesisId: x.ThesisId,
            Name: x.Name,
            Content: x.Content,
            ImageFileName: images.ContainsKey(x.ThesisId) ? images[x.ThesisId] : default
        ));
        return TypedResults.Ok(new SearchThesesResponse(theses, request.Index, request.Limit, count));
    }

    // Validations
    public class Validator : AbstractValidator<SearchThesesRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Index)
                .GreaterThanOrEqualTo(0);
            RuleFor(x => x.Limit)
                .GreaterThan(0)
                .LessThan(500);
        }
    }
}


