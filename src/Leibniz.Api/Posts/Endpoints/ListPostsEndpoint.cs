using Leibniz.Api.Relationships.Dtos;

namespace Leibniz.Api.Posts.Endpoints;
public class ListPostsEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/list-posts", Handle)
        .Produces<ResultSet<ListPostRead>>()
        .Produces<BadRequestObjectResult>(StatusCodes.Status400BadRequest)
        .WithSummary("List a set of posts from database");

    // Request / Response
    public record ListPostsRequest(int Index, int Limit, string Query);
    public record ListPostRead(long PostId, string? Title, string? Content, string? Author,
        long? BookId, string? BookName, int? Page, string ImageFileName,
        IEnumerable<RelatedEntity> Refs);

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] IRelationshipService relationshipService,
        [AsParameters] ListPostsRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var query = database.Posts.AsQueryable();
        if (!string.IsNullOrEmpty(request.Query))
        {
            query = query.Where(x => x.Title.Contains(request.Query)
                || x.Content.Contains(request.Query)
                || x.Author.Contains(request.Query));
        }
        var count = await query.CountAsync();
        var query2 = query.OrderByDescending(x => x.UpdateDateUtc ?? x.CreateDateUtc)
            .Skip(request.Index).Take(request.Limit);

        // DEBUG query
        //var sql = query2.ToQueryString();

        var rows = await query2.ToListAsync();
        var ids = rows.Select(x => x.PostId).ToList();
        var refs = await relationshipService.GetRelatedEntitiesAsync(EntityType.Post, ids, false, default, default, cancellationToken);
        var images = database.Images
            .Where(x => x.EntityType == EntityType.Post && ids.Contains(x.EntityId))
            .ToDictionary(x => x.EntityId, x => x.ImageFileName);

        var posts = rows.Select(x => new ListPostRead
        (
            PostId: x.PostId,
            Title: x.Title,
            Content: x.Content,
            Author: x.Author,
            BookId: x.BookId,
            BookName: x.BookId != null && x.BookId.Value > 0 ? relationshipService.GetRelationshipName(EntityType.Book, x.BookId.Value) : default,
            Page: x.Page,
            ImageFileName: images.ContainsKey(x.PostId) ? images[x.PostId] : default,
            Refs: refs.Where(x2 => x2.AssignedIds.Contains(x.PostId))
                    .Select(x2 => new RelatedEntity
                    {
                        Type = x2.Type,
                        Id = x2.Id,
                        Name = x2.Name
                    }).ToList()
        )).ToList();

        return TypedResults.Ok(
            new ResultSet<ListPostRead>
            {
                Data = posts,
                Index = request.Index,
                Count = rows.Count,
                Limit = request.Limit,
            });
    }

    // Validations
    public class Validator : AbstractValidator<ListPostsRequest>
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


