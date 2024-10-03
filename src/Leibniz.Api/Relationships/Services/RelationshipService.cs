
namespace Leibniz.Api.Relationships.Services;
public class RelationshipService : IRelationshipService
{
    private readonly AcademyDbContext _database;
    public RelationshipService(AcademyDbContext database)
    {
        _database = database;
    }

    public void AddRelationshipByNames(EntityType sourceA, string nameA, EntityType sourceB, string nameB)
    {
        var idA = GetIdByName(sourceA, nameA);
        var idB = GetIdByName(sourceB, nameB);

        var refItem = _database.Relationships.SingleOrDefault(x =>
            x.EntityTypeA == sourceA && x.EntityIdA == idA && x.EntityTypeB == sourceB && x.EntityIdB == idB);
        if (refItem is not null) return;

        refItem = new Relationship
        {
            EntityTypeA = sourceA,
            EntityIdA = idA,
            EntityTypeB = sourceB,
            EntityIdB = idB,
        };
        _database.Relationships.Add(refItem);
        _database.SaveChanges();
    }

    public string? GetRelationshipName(EntityType source, long id)
    {
        if (source == EntityType.Link)
        {
            var name = _database.Links.Where(x => x.LinkId == id).Select(x => x.Name).FirstOrDefault();
            return name;
        }
        if (source == EntityType.Author)
        {
            var name = _database.Authors.Where(x => x.AuthorId == id).Select(x => x.Name).FirstOrDefault();
            return name;
        }
        if (source == EntityType.Area)
        {
            var name = _database.Areas.Where(x => x.AreaId == id).Select(x => x.Name).FirstOrDefault();
            return name;
        }
        if (source == EntityType.Period)
        {
            var name = _database.Periods.Where(x => x.PeriodId == id).Select(x => x.Name).FirstOrDefault();
            return name;
        }
        if (source == EntityType.Post)
        {
            var name = _database.Posts.Where(x => x.PostId == id).Select(x => x.Title + " [" + x.Author + "]").FirstOrDefault();
            return name;
        }
        if (source == EntityType.Thesis)
        {
            var name = _database.Theses.Where(x => x.ThesisId == id).Select(x => x.Name).FirstOrDefault();
            return name;
        }
        if (source == EntityType.Topic)
        {
            var name = _database.Topics.Where(x => x.TopicId == id).Select(x => x.Name).FirstOrDefault();
            return name;
        }
        if (source == EntityType.Book)
        {
            var name = _database.Books.Where(x => x.BookId == id).Select(x => x.Title + " [" + x.Author + "]").FirstOrDefault();
            return name;
        }
        throw new NotSupportedException();
    }

    public int SaveRelationships(EntityType type, long id, List<KeyValuePair<EntityType, long>> items)
    {
        var existing = _database.Relationships.Where(x => (x.EntityTypeA == type && x.EntityIdA == id) || (x.EntityTypeB == type && x.EntityIdB == id)).ToList();
        var selected = new List<Relationship>();
        foreach (var item in items)
        {
            var found = existing.FirstOrDefault(x => x.EntityTypeA == type && x.EntityIdA == id && x.EntityTypeB == item.Key && x.EntityIdB == item.Value);
            if (found is null)
            {
                found = existing.FirstOrDefault(x => x.EntityTypeA == item.Key && x.EntityIdA == item.Value && x.EntityTypeB == type && x.EntityIdB == id);
            }
            if (found is null)
            {
                found = new Relationship
                {
                    EntityTypeA = type,
                    EntityIdA = id,
                    EntityTypeB = item.Key,
                    EntityIdB = item.Value
                };
                _database.Relationships.Add(found);
            }
            selected.Add(found);
            existing.Remove(found);
        }
        foreach (var item in existing)
        {
            _database.Relationships.Remove(item);
        }
        var affected = _database.SaveChanges();
        return affected;
    }

    #region Helper Methods

    private long GetIdByName(EntityType source, string name)
    {
        if (source == EntityType.Link)
        {
            var id = _database.Links.Single(x => x.Name == name).LinkId;
            return id;
        }
        if (source == EntityType.Author)
        {
            var id = _database.Authors.Single(x => x.Name == name).AuthorId;
            return id;
        }
        if (source == EntityType.Area)
        {
            var id = _database.Areas.Single(x => x.Name == name).AreaId;
            return id;
        }
        if (source == EntityType.Period)
        {
            var id = _database.Periods.Single(x => x.Name == name).PeriodId;
            return id;
        }
        if (source == EntityType.Post)
        {
            var id = _database.Posts.Single(x => x.Title + " [" + x.Author + "]" == name).PostId;
            return id;
        }
        if (source == EntityType.Thesis)
        {
            var id = _database.Theses.Single(x => x.Name == name).ThesisId;
            return id;
        }
        if (source == EntityType.Topic)
        {
            var id = _database.Topics.Single(x => x.Name == name).TopicId;
            return id;
        }
        if (source == EntityType.Book)
        {
            var parts = name.TrimEnd(']').Split('[');
            var title = parts.ElementAtOrDefault(0).Trim();
            var author = parts.ElementAtOrDefault(1).Trim();
            var id = _database.Books.Single(x => x.Title == title && x.Author == author).BookId;
            return id;
        }
        throw new NotSupportedException();
    }

    #endregion
}
