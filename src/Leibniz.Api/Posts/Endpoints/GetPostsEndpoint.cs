using System.Linq.Expressions;

namespace Leibniz.Api.Posts.Endpoints;
public class GetPostsEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-posts", Handle)
        .Produces<GetPostsResponse>()
        .Produces<BadRequestObjectResult>(StatusCodes.Status400BadRequest)
        .WithSummary("Retrieve a set of posts from database");

    // Request / Response
    public record GetPostsRequest(int Index, int Limit, string Query);
    public record GetPostsResponse(IEnumerable<PostRead> Data, int Index, int Limit, int Count);
    public record PostRead(long PostId, string? Title, string? Content, string? Author, string ImageFileName);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] GetPostsRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        Expression<Func<Post, bool>> where = x => string.IsNullOrEmpty(request.Query) || x.Title.Contains(request.Query) || x.Content.Contains(request.Query) || x.Author.Contains(request.Query);
        var count = await database.Posts.Where(where).CountAsync();
        var rows = await database.Posts.Where(where).OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc).Skip(request.Index).Take(request.Limit).ToListAsync();
        var ids = rows.Select(x => x.PostId).ToList();
        var images = database.Images.Where(x => x.EntityType == EntityType.Post && ids.Contains(x.EntityId)).ToDictionary(x => x.EntityId, x => x.ImageFileName);
        var posts = rows.Select(x => new PostRead
        (
            PostId: x.PostId,
            Title: x.Title,
            Content: x.Content,
            Author: x.Author,
            ImageFileName: images.ContainsKey(x.PostId) ? images[x.PostId] : default
        ));
        return TypedResults.Ok(new GetPostsResponse(posts, request.Index, request.Limit, count));
    }

    // Validations
    public class Validator : AbstractValidator<GetPostsRequest>
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


