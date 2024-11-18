namespace Leibniz.Api.Authors.Endpoints;
public class ListAuthorsEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/list-authors", Handle)
        .Produces<ListAuthorsResponse>()
        .WithSummary("List a set of authors from database");

    // Request / Response
    public record ListAuthorsRequest(int Index, int Limit, string Query);
    public record ListAuthorsResponse(IEnumerable<ListAuthorRead> Data, int Index, int Limit, int Count);
    public record ListAuthorRead(long AuthorId, string? Name, string? Content, string ImageFileName);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [AsParameters] ListAuthorsRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var query = database.Authors.AsQueryable();
        if (!string.IsNullOrEmpty(request.Query))
        {
            query = query.Where(x => x.Name.Contains(request.Query) || x.Content.Contains(request.Query));
        }

        var count = await query.CountAsync();
        var rows = await query.OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc).Skip(request.Index).Take(request.Limit).ToListAsync();
        var ids = rows.Select(x => x.AuthorId).ToList();
        var images = database.Images.Where(x => x.EntityType == EntityType.Author && ids.Contains(x.EntityId)).ToDictionary(x => x.EntityId, x => x.ImageFileName);
        var authors = rows.Select(x => new ListAuthorRead
        (
            AuthorId: x.AuthorId,
            Name: x.Name,
            Content: x.Content,
            ImageFileName: images.ContainsKey(x.AuthorId) ? images[x.AuthorId] : default
        ));
        return TypedResults.Ok(new ListAuthorsResponse(authors, request.Index, request.Limit, count));
    }

    // Validations
    public class Validator : AbstractValidator<ListAuthorsRequest>
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


