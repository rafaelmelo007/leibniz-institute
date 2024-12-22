using System.Text;
using System.Text.RegularExpressions;

namespace Leibniz.Api.Posts.Endpoints;
public class AddBatchPostsEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapPost($"/create-batch-posts", Handle)
        .Produces<AddBatchPostsResponse>()
        .WithSummary("Add a batch of posts into the database");

    // Request / Response
    public record AddBatchPostsRequest(EntityType Type, long Id, string Content);
    public record AddBatchPostsResponse(long[] PostIds);

    public record PostEntityDto
    {
        public string? Title { get; set; }
        public StringBuilder? Content { get; set; } = new StringBuilder();
        public string? Author { get; set; }
        public short? Page { get; set; }
        public string? References { get; set; }
        public bool QuotesOpeneded { get; set; } = false;
        public Guid? PostId { get; set; } = null;

        internal bool TryAppendLine(string item)
        {
            if (string.IsNullOrWhiteSpace(Title))
            {
                Title = item;
                return true;
            }
            else if (!QuotesOpeneded && item.StartsWith("\""))
            {
                QuotesOpeneded = !item.EndsWith("\"");
                Content.AppendLine(item.Substring(1).TrimEnd('"'));
                return true;
            }
            else if (QuotesOpeneded && !item.EndsWith("\""))
            {
                Content.AppendLine(item.TrimEnd('"'));
                return true;
            }
            else if (QuotesOpeneded && item.EndsWith("\""))
            {
                QuotesOpeneded = false;
                Content.AppendLine(item.TrimEnd('"'));
                return true;
            }
            else if (!QuotesOpeneded && Content.Length > 0 && string.IsNullOrEmpty(Author))
            {
                var endAuthorIndex = item.IndexOf(" - ");
                if (endAuthorIndex == -1)
                {
                    Author = item;
                }
                else
                {
                    Author = item.Substring(0, endAuthorIndex);
                }
                var left = item.Substring(endAuthorIndex + 3).Trim();
                if (left.StartsWith("p."))
                {
                    var endPageIndex = left.IndexOf(" - ");
                    if (endPageIndex == -1)
                    {
                        Page = short.Parse(left.Substring(2).Trim());
                    }
                    else
                    {
                        Page = short.Parse(left.Substring(2, endPageIndex - 2).Trim());
                        References = left.Substring(endPageIndex + 3);
                    }
                }
                return true;
            }
            else if (string.IsNullOrEmpty(item.Trim()))
            {
                return false;
            }
            return false;
        }

        public override string ToString()
        {
            return $"\"{Content}\" [{Author}] - p. {Page} -- {References}";
        }
    }

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] IValidator<AddBatchPostsRequest> validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] AcademyDbContext database,
        [FromBody] AddBatchPostsRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var posts = ParsePosts(request.Content);

        var postIds = posts.Select(post =>
        {
            var row = new Post
            {
                Title = post.Title,
                Content = post.Content.ToString(),
                Author = post.Author,
                BookId = request.Type == EntityType.Book ? request.Id : null,
                Page = post.Page,
                Reference = post.References,
            };
            database.Posts.Add(row);
            database.SaveChanges();

            if (row.PostId > 0)
            {
                database.Relationships.Add(
                    new Relationship
                    {
                        EntityTypeA = request.Type,
                        EntityIdA = request.Id,
                        EntityTypeB = EntityType.Post,
                        EntityIdB = row.PostId
                    });
                database.SaveChanges();
            }
            return row.PostId;
        }).ToArray();

        return TypedResults.Ok(new AddBatchPostsResponse(postIds));
    }

    private static List<PostEntityDto> ParsePosts(string content)
    {
        var lines = content.Split(new[] { '\n' });
        var current = new PostEntityDto();
        var results = new List<PostEntityDto>();
        foreach (var line in lines)
        {
            var item = line.Trim();
            if (!current.TryAppendLine(item))
            {
                results.Add(current);
                current = new PostEntityDto();
            }
        }
        if (!string.IsNullOrEmpty(current.Title) &&
            !string.IsNullOrEmpty(current.Author) &&
            current.Content.Length > 0)
        {
            results.Add(current);
        }
        return results;
    }

    // Validations
    public class Validator : AbstractValidator<AddBatchPostsRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Content)
                .MinimumLength(10);

            RuleFor(x => x.Id)
                .GreaterThan(0);
        }
    }
}




