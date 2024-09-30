namespace Leibniz.Api.Areas.Endpoints;
public class GetAreaEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-area", Handle)
        .Produces<GetAreaResponse>()
        .Produces<BadRequestObjectResult>(StatusCodes.Status400BadRequest)
        .WithSummary("Retrieve an area from database");

    // Request / Response
    public record GetAreaRequest(long AreaId);
    public record GetAreaResponse(Area Area);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] GetAreaRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var area = await database.Areas.FindAsync(request.AreaId);
        return TypedResults.Ok(new GetAreaResponse(area));
    }

    // Validations
    public class Validator : AbstractValidator<GetAreaRequest>
    {
        public Validator()
        {
            RuleFor(x => x.AreaId)
                .GreaterThanOrEqualTo(0);
        }
    }
}


