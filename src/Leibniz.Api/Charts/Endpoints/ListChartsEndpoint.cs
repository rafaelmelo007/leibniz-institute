namespace Leibniz.Api.Charts.Endpoints;
public record ListChartsEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/list-charts", Handle)
        .Produces<ResultSet<ListChartRead>>()
        .Produces<BadRequestObjectResult>(StatusCodes.Status400BadRequest)
        .WithSummary("List a set of charts from database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record ListChartsRequest(int Index, int Limit, string Query);
    public record ListChartRead(long ChartId, string? Name, string? Content,
        IEnumerable<RelatedEntity> Refs);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] IRelationshipService relationshipService,
        [AsParameters] ListChartsRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var query = database.Charts.AsNoTracking().AsQueryable();
        if (!string.IsNullOrEmpty(request.Query))
        {
            query = query.Where(x => x.Name.Contains(request.Query)
                || x.Content.Contains(request.Query));
        }
        var count = await query.CountAsync();
        var query2 = query.OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc)
            .Skip(request.Index).Take(request.Limit);

        // DEBUG query
        //var sql = query2.ToQueryString();

        var rows = await query2.ToListAsync();
        var ids = rows.Select(x => x.ChartId).ToList();
        var refs = await relationshipService.GetRelatedEntitiesAsync(EntityType.Chart, ids, false, default, default, cancellationToken);
        var images = database.Images
            .Where(x => x.EntityType == EntityType.Post && ids.Contains(x.EntityId))
            .ToDictionary(x => x.EntityId, x => x.ImageFileName);

        var posts = rows.Select(x => new ListChartRead
        (
            ChartId: x.ChartId,
            Name: x.Name,
            Content: x.Content,
            Refs: refs.Where(x2 => x2.AssignedIds.Contains(x.ChartId))
                    .Select(x2 => new RelatedEntity
                    {
                        Type = x2.Type,
                        Id = x2.Id,
                        Name = x2.Name
                    }).ToList()
        )).ToList();

        return TypedResults.Ok(
            new ResultSet<ListChartRead>
            {
                Data = posts,
                Index = request.Index,
                Count = rows.Count,
                Limit = request.Limit,
            });
    }

    // Validations
    public class Validator : AbstractValidator<ListChartsRequest>
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


