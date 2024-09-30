namespace Leibniz.Api.Theses.Endpoints;
public class GetThesisEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-thesis", Handle)
        .Produces<GetThesisResponse>()
        .WithSummary("Retrieve a thesis from database");

    // Request / Response
    public record GetThesisRequest(long ThesisId);
    public record GetThesisResponse(Thesis Thesis);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] GetThesisRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var thesis = await database.Theses.FindAsync(request.ThesisId);
        return TypedResults.Ok(new GetThesisResponse(thesis));
    }

    // Validations
    public class Validator : AbstractValidator<GetThesisRequest>
    {
        public Validator()
        {
            RuleFor(x => x.ThesisId)
                .GreaterThanOrEqualTo(0);
        }
    }
}


