namespace Leibniz.Api.Posts.Endpoints;
public class GetPostEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-post", Handle)
        .Produces<GetPostResponse>()
        .WithSummary("Retrieve a post from database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record GetPostRequest(long PostId);
    public record GetPostResponse(Post Post);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] GetPostRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var post = await database.Posts.FindAsync(request.PostId);
        return TypedResults.Ok(new GetPostResponse(post));
    }

    // Validations
    public class Validator : AbstractValidator<GetPostRequest>
    {
        public Validator()
        {
            RuleFor(x => x.PostId)
                .GreaterThanOrEqualTo(0);
        }
    }
}


