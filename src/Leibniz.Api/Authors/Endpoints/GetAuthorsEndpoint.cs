using System.Linq.Expressions;

namespace Leibniz.Api.Authors.Endpoints;
public class GetAuthorsEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/get-authors", Handle)
        .Produces<GetAuthorsResponse>()
        .WithSummary("Retrieve a set of authors from database");

    // Request / Response
    public record GetAuthorsRequest(int Index, int Limit, string Query);
    public record GetAuthorsResponse(IEnumerable<AuthorRead> Data, int Index, int Limit, int Count);
    public record AuthorRead(long AuthorId, string? Name, string? Content, string ImageFileName);

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

        Expression<Func<Author, bool>> where = x => string.IsNullOrEmpty(request.Query) || x.Name.Contains(request.Query) || x.Content.Contains(request.Query);
        var count = await database.Authors.Where(where).CountAsync();
        var rows = await database.Authors.Where(where).OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc).Skip(request.Index).Take(request.Limit).ToListAsync();
        var ids = rows.Select(x => x.AuthorId).ToList();
        var images = database.Images.Where(x => x.EntityType == EntityType.Author && ids.Contains(x.EntityId)).ToDictionary(x => x.EntityId, x => x.ImageFileName);
        var authors = rows.Select(x => new AuthorRead
        (
            AuthorId: x.AuthorId,
            Name: x.Name,
            Content: x.Content,
            ImageFileName: images.ContainsKey(x.AuthorId) ? images[x.AuthorId] : default
        ));
        return TypedResults.Ok(new GetAuthorsResponse(authors, request.Index, request.Limit, count));
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


