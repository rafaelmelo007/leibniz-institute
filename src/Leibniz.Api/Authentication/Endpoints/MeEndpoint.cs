namespace Leibniz.Api.Authentication.Endpoints;
public class MeEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/me", Handle)
        .Produces<MeResponse>()
        .WithSummary("Retrieve information of the logged user based on his bearer jwt token")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record MeResponse(bool IsLogged, long? UserId, string? Email, Guid? QueryStringToken);

    // Handler
    public static async Task<Ok<MeResponse>> Handle(
        AcademyDbContext database, ClaimsPrincipal user,
        CancellationToken cancellationToken)
    {
        var isLogged = user.Identity.IsAuthenticated;
        var userId = user.GetUserId();
        var email = user.GetEmail();
        var queryStringToken = database.Users.Where(x => x.UserId == userId).Select(x => x.QueryStringToken).FirstOrDefault();
        var response = new MeResponse(isLogged, userId, email, queryStringToken);
        return TypedResults.Ok(response);
    }
}
