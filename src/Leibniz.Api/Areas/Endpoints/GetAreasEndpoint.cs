namespace Leibniz.Api.Areas.Endpoints;
public class GetAreasEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-areas", Handle)
        .Produces<GetAreasResponse>()
        .Produces<BadRequestObjectResult>(StatusCodes.Status400BadRequest)
        .WithSummary("Retrieve a set of areas from database");

    // Request / Response
    public record GetAreasRequest(int Index, int Limit);
    public record GetAreasResponse(IEnumerable<AreaRead> Data, int Index, int Limit, int Count);
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

        var count = await database.Areas.CountAsync();
        var rows = await database.Areas.OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc).Skip(request.Index).ToListAsync();
        var ids = rows.Select(x => x.AreaId).ToList();
        var images = database.Images.Where(x => x.EntityType == EntityType.Area && ids.Contains(x.EntityId)).ToDictionary(x => x.EntityId, x => x.ImageFileName);
        var areas = rows.Select(x => new AreaRead
        (
            AreaId: x.AreaId,
            Name: x.Name,
            Content: x.Content,
            ImageFileName: images.ContainsKey(x.AreaId) ? images[x.AreaId] : default
        ));
        return TypedResults.Ok(new GetAreasResponse(areas, request.Index, request.Limit, count));
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


