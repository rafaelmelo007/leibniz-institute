namespace Leibniz.Api.Areas.Endpoints;
public class GetAreasEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-areas", Handle)
        .Produces<ResultSet<AreaRead>>()
        .Produces<BadRequestObjectResult>(StatusCodes.Status400BadRequest)
        .WithSummary("Retrieve a set of areas from database");

    // Request / Response
    public record GetAreasRequest(int Index, int Limit, string? Query);
    public record AreaRead(long AreaId, string? Name, string? Content, string ImageFileName);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] GetAreasRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var query = database.Areas.AsQueryable();
        if (!string.IsNullOrEmpty(request.Query))
        {
            query = query.Where(x => x.Name.Contains(request.Query) || x.Content.Contains(request.Query));
        }

        var count = await query.CountAsync();
        var rows = await query.OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc)
            .Skip(request.Index).Take(request.Limit).ToListAsync();

        var ids = rows.Select(x => x.AreaId).ToList();
        var images = database.Images
            .Where(x => x.EntityType == EntityType.Area && ids.Contains(x.EntityId))
            .ToDictionary(x => x.EntityId, x => x.ImageFileName);
        var areas = rows.Select(x => new AreaRead
        (
            AreaId: x.AreaId,
            Name: x.Name,
            Content: x.Content,
            ImageFileName: images.ContainsKey(x.AreaId) ? images[x.AreaId] : default
        )).ToList();
        return TypedResults.Ok(
            new ResultSet<AreaRead>
            {
                Data = areas,
                Index = request.Index,
                Count = rows.Count,
                Limit = request.Limit,
                Query = request.Query,
            });
    }

    // Validations
    public class Validator : AbstractValidator<GetAreasRequest>
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


