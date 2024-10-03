﻿
namespace Leibniz.Api.Relationships.Endpoints;
public class LookupEntitiesEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/lookup-entities", Handle)
        .Produces<LookupEntitiesResponse>()
        .WithSummary("Search for entities based on an expression from database");

    // Request / Response
    public record LookupEntitiesRequest(EntityType Type, string Query);
    public record LookupEntitiesResponse(List<LookupEntitiesRead> Data, int Index, int Limit, int Count);
    public record LookupEntitiesRead(EntityType TypeId, long Id, string? Label);
    public const int MAX_RECORDS = 50;

    // Handler
    public static async Task<IResult> Handle(
        [FromServices] AcademyDbContext database,
        [FromServices] Validator validator,
        [FromServices] NotificationHandler notifications,
        [FromServices] IRelationshipService relationshipService,
        [AsParameters] LookupEntitiesRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            notifications.AddValidationErrors(validationResult.Errors);
            return notifications.ToBadRequest();
        }

        var results = new List<LookupEntitiesRead>();
        if (request.Type == EntityType.Author)
        {
            results = QueryAuthors(database, request.Query);
        }
        if (request.Type == EntityType.Post)
        {
            results = QueryPosts(database, request.Query);
        }
        if (request.Type == EntityType.Thesis)
        {
            results = QueryThesis(database, request.Query);
        }
        if (request.Type == EntityType.Book)
        {
            results = QueryBooks(database, request.Query);
        }
        if (request.Type == EntityType.Period)
        {
            results = QueryPeriods(database, request.Query);
        }
        if (request.Type == EntityType.Topic)
        {
            results = QueryTopics(database, request.Query);
        }
        if (request.Type == EntityType.Link)
        {
            results = QueryLinks(database, request.Query);
        }

        return TypedResults.Ok(new LookupEntitiesResponse(results, 0, results.Count, results.Count));
    }

    private static List<LookupEntitiesRead> QueryLinks(AcademyDbContext database, string query)
    {
        var rows = database.Links.Where(x => x.Name.Contains(query)).Take(MAX_RECORDS)
            .Select(x => new LookupEntitiesRead(EntityType.Link, x.LinkId, x.Name))
            .ToList();
        return rows;
    }

    private static List<LookupEntitiesRead> QueryTopics(AcademyDbContext database, string query)
    {
        var rows = database.Topics.Where(x => x.Name.Contains(query)).Take(MAX_RECORDS)
            .Select(x => new LookupEntitiesRead(EntityType.Topic, x.TopicId, x.Name))
            .ToList();
        return rows;
    }

    private static List<LookupEntitiesRead> QueryPeriods(AcademyDbContext database, string query)
    {
        var rows = database.Periods.Where(x => x.Name.Contains(query)).Take(MAX_RECORDS)
            .Select(x => new LookupEntitiesRead(EntityType.Period, x.PeriodId, x.Name))
            .ToList();
        return rows;
    }

    private static List<LookupEntitiesRead> QueryBooks(AcademyDbContext database, string query)
    {
        var rows = database.Books.Where(x => x.Title.Contains(query) || x.Author.Contains(query)).Take(MAX_RECORDS)
            .Select(x => new LookupEntitiesRead(EntityType.Book, x.BookId, x.Title + " [" + x.Author + "]"))
            .ToList();
        return rows;
    }

    private static List<LookupEntitiesRead> QueryThesis(AcademyDbContext database, string query)
    {
        var rows = database.Theses.Where(x => x.Name.Contains(query)).Take(MAX_RECORDS)
            .Select(x => new LookupEntitiesRead(EntityType.Thesis, x.ThesisId, x.Name))
            .ToList();
        return rows;
    }

    private static List<LookupEntitiesRead> QueryPosts(AcademyDbContext database, string query)
    {
        var rows = database.Posts.Where(x => x.Title.Contains(query) || x.Author.Contains(query)).Take(MAX_RECORDS)
            .Select(x => new LookupEntitiesRead(EntityType.Post, x.PostId, x.Title + " [" + x.Author + "]"))
            .ToList();
        return rows;
    }

    private static List<LookupEntitiesRead> QueryAuthors(AcademyDbContext database, string query)
    {
        var rows = database.Authors.Where(x => x.Name.Contains(query)).Take(MAX_RECORDS)
            .Select(x => new LookupEntitiesRead(EntityType.Author, x.AuthorId, x.Name))
            .ToList();
        return rows;
    }

    // Validations
    public class Validator : AbstractValidator<LookupEntitiesRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Query)
                .MinimumLength(3);
        }
    }
}

