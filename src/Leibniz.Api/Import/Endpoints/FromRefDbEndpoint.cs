namespace Leibniz.Api.Import.Endpoints;
public class FromRefDbEndpoint : IEndpoint
{
    // End-point Map
    public static void Map(IEndpointRouteBuilder app) => app.MapGet($"/from-ref-db", Handle)
        .Produces<FromRefDbResponse>()
        .AllowAnonymous()
        .WithSummary("Import all links, posts and tags from ref database")
        .WithRequestTimeout(AppSettings.RequestTimeout);

    // Request / Response
    public record FromRefDbResponse(int LinksLoaded, int PostsLoaded, int BooksLoaded, int AuthorsLoaded, int ThesesLoaded, int TopicsLoaded, int RefsLoaded);

    private const string DriveRootPath = @"C:\data\others\repos\academy";

    // Handler
    public static async Task<Ok<FromRefDbResponse>> Handle(
        IRelationshipService relationshipService,
        IImagesService imagesService, AcademyDbContext database,
        IDapperConnectionFactory factory,
        CancellationToken cancellationToken)
    {
        using var conn = factory.Create(default, "Academy_Dev");
        var booksLoaded = ImportBooks(conn, database, imagesService);
        var authorsLoaded = ImportAuthors(conn, database, imagesService);
        var linksLoaded = ImportLinks(conn, database);
        var thesesLoaded = ImportTheses(conn, database, imagesService);
        var topicsLoaded = ImportTopics(conn, database, imagesService);
        var periodsLoaded = ImportPeriods(conn, database, imagesService);
        var areasLoaded = ImportAreas(conn, database, imagesService);
        var postsLoaded = ImportPosts(conn, database, imagesService);
        var refsImported = ImportRefs(conn, relationshipService);
        return TypedResults.Ok(new FromRefDbResponse(linksLoaded, postsLoaded, booksLoaded, authorsLoaded, thesesLoaded, topicsLoaded, refsImported));
    }

    private static object ImportAreas(IDapperConnectionService conn, AcademyDbContext database, IImagesService imagesService)
    {
        var affected = 0;
        var rows = conn.QueryRawSql<dynamic>("select a1.*, a2.Path, a2.FileName As FileNameFinal from dbo.Tags a1 left join Drive_Dev.dbo.Files a2 on a1.FileName = cast(a2.FileId as varchar(max)) where a1.Type = 0");
        foreach (var tag in rows)
        {
            var name = (string)tag.Name;
            var content = (string)tag.Content;
            var area = new Area
            {
                Name = name,
                Content = content
            };

            if (!database.Areas.Any(x => x.Name == name))
            {
                database.Areas.Add(area);
            }
            affected += database.SaveChanges();

            var path = (string?)tag.Path;
            var fileName = (string?)tag.FileNameFinal;
            if (string.IsNullOrWhiteSpace(fileName)) continue;

            var filePath = Path.Combine(DriveRootPath, path.TrimStart('/'), fileName);
            imagesService.SaveImage(filePath, EntityType.Area, area.AreaId);
        }
        return affected;
    }

    private static object ImportPeriods(IDapperConnectionService conn, AcademyDbContext database, IImagesService imagesService)
    {
        var affected = 0;
        var rows = conn.QueryRawSql<dynamic>("select a1.*, a2.Path, a2.FileName As FileNameFinal from dbo.Tags a1 left join Drive_Dev.dbo.Files a2 on a1.FileName = cast(a2.FileId as varchar(max)) where a1.Type = 1");
        foreach (var tag in rows)
        {
            var name = (string)tag.Name;
            var content = (string)tag.Content;
            var period = new Period
            {
                Name = name,
                Content = content
            };

            if (!database.Periods.Any(x => x.Name == name))
            {
                database.Periods.Add(period);
            }
            affected += database.SaveChanges();

            var path = (string?)tag.Path;
            var fileName = (string?)tag.FileNameFinal;
            if (string.IsNullOrWhiteSpace(fileName)) continue;

            var filePath = Path.Combine(DriveRootPath, path.TrimStart('/'), fileName);
            imagesService.SaveImage(filePath, EntityType.Period, period.PeriodId);
        }
        return affected;
    }

    private static int ImportTopics(IDapperConnectionService conn, AcademyDbContext database, IImagesService imagesService)
    {
        var affected = 0;
        var rows = conn.QueryRawSql<dynamic>("select a1.*, a2.Path, a2.FileName As FileNameFinal from dbo.Tags a1 left join Drive_Dev.dbo.Files a2 on a1.FileName = cast(a2.FileId as varchar(max)) where a1.Type = 7");
        foreach (var tag in rows)
        {
            var name = (string)tag.Name;
            var content = (string)tag.Content;
            var topic = new Topic
            {
                Name = name,
                Content = content
            };

            if (!database.Topics.Any(x => x.Name == name))
            {
                database.Topics.Add(topic);
            }
            affected += database.SaveChanges();

            var path = (string?)tag.Path;
            var fileName = (string?)tag.FileNameFinal;
            if (string.IsNullOrWhiteSpace(fileName)) continue;

            var filePath = Path.Combine(DriveRootPath, path.TrimStart('/'), fileName);
            imagesService.SaveImage(filePath, EntityType.Topic, topic.TopicId);
        }
        return affected;
    }

    private static int ImportTheses(IDapperConnectionService conn, AcademyDbContext database, IImagesService imagesService)
    {
        var affected = 0;
        var rows = conn.QueryRawSql<dynamic>("select a1.*, a2.Path, a2.FileName As FileNameFinal from dbo.Tags a1 left join Drive_Dev.dbo.Files a2 on a1.FileName = cast(a2.FileId as varchar(max)) where a1.Type = 11");
        foreach (var tag in rows)
        {
            var name = (string)tag.Name;
            var content = (string)tag.Content;
            var thesis = new Thesis
            {
                Name = name,
                Content = content
            };

            if (!database.Theses.Any(x => x.Name == name))
            {
                database.Theses.Add(thesis);
            }
            affected += database.SaveChanges();

            var path = (string?)tag.Path;
            var fileName = (string?)tag.FileNameFinal;
            if (string.IsNullOrWhiteSpace(fileName)) continue;

            var filePath = Path.Combine(DriveRootPath, path.TrimStart('/'), fileName);
            imagesService.SaveImage(filePath, EntityType.Thesis, thesis.ThesisId);
        }
        return affected;
    }

    private static int ImportAuthors(IDapperConnectionService conn, AcademyDbContext database, IImagesService imagesService)
    {
        var affected = 0;
        var rows = conn.QueryRawSql<dynamic>("select a1.*, a2.Path, a2.FileName As FileNameFinal from dbo.Tags a1 left join Drive_Dev.dbo.Files a2 on a1.FileName = cast(a2.FileId as varchar(max)) where a1.Type = 2");
        foreach (var tag in rows)
        {
            var name = (string)tag.Name;
            var content = (string)tag.Content;
            var author = database.Authors.FirstOrDefault(x => x.Name == name);
            if (author is null)
            {
                author = new Author
                {
                    Name = name,
                    Content = content
                };

                database.Authors.Add(author);
                affected += database.SaveChanges();
            }

            var path = (string?)tag.Path;
            var fileName = (string?)tag.FileNameFinal;
            if (string.IsNullOrWhiteSpace(fileName)) continue;

            var filePath = Path.Combine(DriveRootPath, path.TrimStart('/'), fileName);
            imagesService.SaveImage(filePath, EntityType.Author, author.AuthorId);
        }
        return affected;
    }

    private static int ImportBooks(IDapperConnectionService conn, AcademyDbContext database, IImagesService imagesService)
    {
        var affected = 0;
        var rows = conn.QueryRawSql<dynamic>("select a1.*, a2.Path, a2.FileName As FileNameFinal from dbo.Tags a1 left join Drive_Dev.dbo.Files a2 on a1.FileName = cast(a2.FileId as varchar(max)) where a1.Type = 5");
        foreach (var tag in rows)
        {
            var title = (string)tag.Title;
            var author = (string)tag.Author;
            if (string.IsNullOrEmpty(title) && string.IsNullOrEmpty(author))
            {
                var name = (string)tag.Name;
                var parts = name.TrimEnd(']').Split('[');
                title = parts.ElementAtOrDefault(0)?.Trim();
                author = parts.ElementAtOrDefault(1)?.Trim();
            }
            var content = (string)tag.Content;
            var publisher = (string)tag.Publisher;
            var edition = (short?)tag.Edition;
            var year = (short?)tag.Year;
            var totalOfPages = (short?)tag.TotalOfPages;
            var translator = (string?)tag.Translator;
            var isbn = (string?)tag.Isbn;
            var price = (decimal?)tag.Price;
            var purchasedDate = (DateTime?)tag.PurchasedDate;
            var sizeX = (decimal?)tag.SizeX;
            var sizeY = (decimal?)tag.SizeY;
            var sizeZ = (decimal?)tag.SizeZ;
            var local = (string?)tag.Local;

            var book = database.Books.FirstOrDefault(x => x.Title == title && x.Author == author && x.Publisher == publisher && x.Edition == edition);
            if (book is null)
            {
                book = new Book
                {
                    Title = title,
                    Author = author,
                    Publisher = publisher,
                    Edition = edition,
                    Content = content,
                    Year = year,
                    TotalOfPages = totalOfPages,
                    Translator = translator,
                    Isbn = isbn,
                    Price = price,
                    PurchasedDate = purchasedDate.HasValue ?
                            new DateOnly(purchasedDate.Value.Year, purchasedDate.Value.Month, purchasedDate.Value.Day) : default,
                    SizeX = sizeX,
                    SizeY = sizeY,
                    SizeZ = sizeZ,
                    Local = local,
                };
                database.Books.Add(book);
                affected += database.SaveChanges();
            }

            var path = (string?)tag.Path;
            var fileName = (string?)tag.FileNameFinal;
            if (string.IsNullOrWhiteSpace(fileName)) continue;

            var filePath = Path.Combine(DriveRootPath, path.TrimStart('/'), fileName);
            imagesService.SaveImage(filePath, EntityType.Book, book.BookId);

        }
        return affected;
    }

    private static int ImportRefs(IDapperConnectionService conn, IRelationshipService relationshipService)
    {
        var loaded = 0;
        var rows = conn.QueryRawSql<dynamic>("select a2.TagId, a2.Name AS TagName, a3.Name AS LinkName, a2.Type from TagLinks a1 join Tags a2 on a1.TagId = a2.TagId join Links a3 on a1.LinkId = a3.LinkId");
        foreach (var row in rows)
        {
            var tagName = (string)row.TagName;
            var tagType = (short)row.Type;
            var linkName = (string)row.LinkName;
            var source = GetSourceTypeByLegacyTagType(tagType);
            if (source == EntityType.Unknown) continue;

            relationshipService.AddRelationshipByNames(GetSourceTypeByLegacyTagType(tagType), tagName, EntityType.Link, linkName);
        }

        rows = conn.QueryRawSql<dynamic>("select a2.TagId, a2.Name As TagNameA, a2.Type As TagTypeA, a3.Name As TagNameB, a3.Type AS TagTypeB from TagChildren a1 join Tags a2 on a1.TagId = a2.TagId join Tags a3 on a1.ChildId = a3.TagId");
        foreach (var row in rows)
        {
            var tagNameA = (string)row.TagNameA;
            var tagTypeA = (short)row.TagTypeA;
            var sourceA = GetSourceTypeByLegacyTagType(tagTypeA);
            var tagNameB = (string)row.TagNameB;
            var tagTypeB = (short)row.TagTypeB;
            var sourceB = GetSourceTypeByLegacyTagType(tagTypeB);
            if (sourceA == EntityType.Unknown || sourceB == EntityType.Unknown) continue;

            relationshipService.AddRelationshipByNames(sourceA, tagNameA, sourceB, tagNameB);
        }

        rows = conn.QueryRawSql<dynamic>("select a2.TagId, a2.Name AS TagName, a2.Type As TagType, a3.Title + ' [' + a3.Author + ']' As PostName from TagPosts a1 join Tags a2 on a1.TagId = a2.TagId join Posts a3 on a1.PostId = a3.PostId");
        foreach (var row in rows)
        {
            var tagName = (string)row.TagName;
            var tagType = (short)row.TagType;
            var postName = (string)row.PostName;
            var source = GetSourceTypeByLegacyTagType(tagType);
            if (source == EntityType.Unknown) continue;

            relationshipService.AddRelationshipByNames(source, tagName, EntityType.Post, postName);
        }

        return loaded;
    }

    private static EntityType GetSourceTypeByLegacyTagType(short type)
    {
        if (type == 0)
        {
            return EntityType.Area;
        }
        if (type == 1)
        {
            return EntityType.Period;
        }
        if (type == 2)
        {
            return EntityType.Author;
        }
        if (type == 5)
        {
            return EntityType.Book;
        }
        if (type == 7)
        {
            return EntityType.Topic;
        }
        if (type == 11)
        {
            return EntityType.Thesis;
        }
        if (type == 11)
        {
            return EntityType.Thesis;
        }

        return EntityType.Unknown;
    }

    private static int ImportPosts(IDapperConnectionService conn, AcademyDbContext database, IImagesService imagesService)
    {
        var loaded = 0;
        var posts = conn.QueryRawSql<dynamic>("SELECT p.*, t.Title AS BookTitle, t.Author AS BookAuthor, t.Publisher AS BookPublisher, t.Edition AS BookEdition FROM Posts p LEFT JOIN Tags t on p.BookId = t.TagId");
        foreach (var post in posts)
        {
            var title = (string)post.Title;
            var body = (string)post.Content;
            var author = (string)post.Author;
            var page = (short?)post.Page;
            var reference = (string)post.Reference;

            var bookTitle = (string)post.BookTitle;
            var bookAuthor = (string)post.BookAuthor;
            var bookPublisher = (string)post.BookPublisher;
            var bookEdition = (short?)post.BookEdition;

            var found = database.Posts.SingleOrDefault(x => x.Title == title && x.Author == author);
            if (found is not null) continue;

            var bookId = database.Books.SingleOrDefault(x => x.Title == bookTitle && x.Author == bookAuthor && x.Publisher == bookPublisher && x.Edition == bookEdition)?.BookId;

            database.Posts.Add(new Post
            {
                Title = title,
                Content = body,
                Author = author,
                Reference = reference,
                Page = page,
                BookId = bookId
            });
            loaded += database.SaveChanges();
        }

        return loaded;
    }

    private static int ImportLinks(IDapperConnectionService conn, AcademyDbContext database)
    {
        var loaded = 0;
        var links = conn.QueryRawSql<dynamic>("SELECT * FROM Links");
        foreach (var link in links)
        {
            var name = (string)link.Name;
            var url = (string)link.Url;
            var content = (string)link.Content;

            var found = database.Links.SingleOrDefault(x => x.Name == name);
            if (found is not null) continue;

            database.Links.Add(new Link
            {
                Name = name,
                Url = url,
                Content = content
            });
            loaded += database.SaveChanges();
        }

        return loaded;
    }
}
