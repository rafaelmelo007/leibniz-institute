namespace Leibniz.Api.Topics.Endpoints;
public class GetTopicsEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-topics", Handle)
        .Produces<GetTopicsResponse>()
        .WithSummary("Retrieve a set of topics from database");

    // Request / Response
    public record GetTopicsRequest(int Index, int Limit);
    public record GetTopicsResponse(List<Topic> Data, int Index, int Limit, int Count);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] GetTopicsRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var count = await database.Topics.CountAsync();
        var rows = await database.Topics.OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc).Skip(request.Index).Take(request.Limit).ToListAsync();
        return TypedResults.Ok(new GetTopicsResponse(rows, request.Index, request.Limit, count));
    }

    // Validations
    public class Validator : AbstractValidator<GetTopicsRequest>
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


