namespace Leibniz.Api.Authors.Endpoints;
public class GetAuthorsEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-authors", Handle)
        .Produces<GetAuthorsResponse>()
        .WithSummary("Retrieve a set of authors from database");

    // Request / Response
    public record GetAuthorsRequest(int Index, int Limit);
    public record GetAuthorsResponse(List<Author> Data, int Index, int Limit, int Count);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] GetAuthorsRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var count = await database.Authors.CountAsync();
        var rows = await database.Authors.OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc).Skip(request.Index).Take(request.Limit).ToListAsync();
        return TypedResults.Ok(new GetAuthorsResponse(rows, request.Index, request.Limit, count));
    }

    // Validations
    public class Validator : AbstractValidator<GetAuthorsRequest>
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


