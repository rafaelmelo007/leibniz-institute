namespace Leibniz.Api.Periods.Endpoints;
public class GetPeriodsEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-periods", Handle)
        .Produces<GetPeriodsResponse>()
        .WithSummary("Retrieve a set of periods from database");

    // Request / Response
    public record GetPeriodsRequest(int Index, int Limit);
    public record GetPeriodsResponse(List<Period> Data, int Index, int Limit, int Count);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] GetPeriodsRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var count = await database.Periods.CountAsync();
        var rows = await database.Periods.OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc).Skip(request.Index).Take(request.Limit).ToListAsync();
        return TypedResults.Ok(new GetPeriodsResponse(rows, request.Index, request.Limit, count));
    }

    // Validations
    public class Validator : AbstractValidator<GetPeriodsRequest>
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


