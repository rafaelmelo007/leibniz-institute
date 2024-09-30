namespace Leibniz.Api.Links.Endpoints;
public class GetLinksEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-links", Handle)
        .Produces<GetLinksResponse>()
        .WithSummary("Retrieve a set of links from database");

    // Request / Response
    public record GetLinksRequest(int Index, int Limit);
    public record GetLinksResponse(List<Link> Data, int Index, int Limit, int Count);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] GetLinksRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var count = await database.Links.CountAsync();
        var rows = await database.Links.OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc).Skip(request.Index).Take(request.Limit).ToListAsync();
        return TypedResults.Ok(new GetLinksResponse(rows, request.Index, request.Limit, count));
    }

    // Validations
    public class Validator : AbstractValidator<GetLinksRequest>
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

