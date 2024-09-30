namespace Leibniz.Api.Links.Endpoints;
public class GetLinkEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-link", Handle)
        .Produces<GetLinkResponse>()
        .WithSummary("Retrieve a set of links from database");

    // Request / Response
    public record GetLinkRequest(long LinkId);
    public record GetLinkResponse(Link Link);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] NotificationHandler notifications,
        [FromServices] Validator validator,
        [AsParameters] GetLinkRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var link = await database.Links.FindAsync(request.LinkId);
        return TypedResults.Ok(new GetLinkResponse(link));
    }

    // Validations
    public class Validator : AbstractValidator<GetLinkRequest>
    {
        public Validator()
        {
            RuleFor(x => x.LinkId)
                .GreaterThanOrEqualTo(0);
        }
    }
}

