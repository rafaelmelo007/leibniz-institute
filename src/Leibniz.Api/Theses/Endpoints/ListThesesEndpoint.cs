namespace Leibniz.Api.Theses.Endpoints;
public class ListThesesEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/list-theses", Handle)
        .Produces<ResultSet<ListThesisRead>>()
        .WithSummary("List a set of theses from database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record ListThesesRequest(int Index, int Limit, string? Query);
    public record ListThesisRead(long ThesisId, string? Name, string? Content, string ImageFileName);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] ListThesesRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var query = database.Theses.AsNoTracking().AsQueryable();
        if (!string.IsNullOrEmpty(request.Query))
        {
            query = query.Where(x => x.Name.Contains(request.Query)
                || x.Content.Contains(request.Query));
        }

        var count = await query.CountAsync();
        var rows = await query.OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc)
            .Skip(request.Index).Take(request.Limit).ToListAsync();

        var ids = rows.Select(x => x.ThesisId).ToList();
        var images = database.Images
            .Where(x => x.EntityType == EntityType.Thesis && ids.Contains(x.EntityId))
            .ToDictionary(x => x.EntityId, x => x.ImageFileName);
        var theses = rows.Select(x => new ListThesisRead
        (
            ThesisId: x.ThesisId,
            Name: x.Name,
            Content: x.Content,
            ImageFileName: images.ContainsKey(x.ThesisId) ? images[x.ThesisId] : default
        )).ToList();

        return TypedResults.Ok(
            new ResultSet<ListThesisRead>
            {
                Data = theses,
                Index = request.Index,
                Count = rows.Count,
                Limit = request.Limit,
                Query = request.Query
            });
    }

    // Validations
    public class Validator : AbstractValidator<ListThesesRequest>
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


