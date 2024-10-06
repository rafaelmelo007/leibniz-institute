using Leibniz.Api.Relationships.Dtos;
using Leibniz.Api.Relationships.Extensions;

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

    public async Task<long> MoveToAsync(EntityType fromType, long id, EntityType toType, CancellationToken cancellationToken)
    {
        if (fromType == toType) return 0;

        var entity = await RemoveEntityAsync(fromType, id, cancellationToken);
        var newId = await SaveMovedEntityAsync(entity, toType, cancellationToken);

        await ChangeRelationshipsAsync(fromType, id, toType, newId, cancellationToken);
        await ChangeImagesAsync(fromType, id, toType, newId, cancellationToken);

        await _database.SaveChangesAsync(cancellationToken);

        return newId;
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

    public async Task<IEnumerable<RelatedEntity>> GetRelatedEntitiesAsync(EntityType type, List<long> ids, CancellationToken cancellationToken)
    {
        var refs = await _database.Relationships.Where(x =>
            (x.EntityTypeA == type && ids.Contains(x.EntityIdA)) ||
            (x.EntityTypeB == type && ids.Contains(x.EntityIdB)))
            .ToListAsync(cancellationToken);
        var items = refs.Select(x => x.ToRelatedEntity(type, ids)).ToList();
        var result = items.GroupBy(x => new { x.Type, x.Id, x.Name }).Select(item =>
        {
            var name = GetRelationshipName(item.Key.Type, item.Key.Id);
            var assignedIds = item.Select(x => x.AssignedId).ToList();
            return new RelatedEntity
            {
                Type = item.Key.Type,
                Id = item.Key.Id,
                Name = name,
                AssignedIds = assignedIds
            };
        });
        return result;
    }

    #region Helper Methods

    private class EntityItem
    {
        public string? Name { get; set; }
        public string? Content { get; set; }
        public string? Author { get; set; }
    };

    private async Task<bool> ChangeImagesAsync(EntityType fromType, long fromId, EntityType toType, long toId, CancellationToken cancellationToken)
    {
        var images = await _database.Images.Where(x => x.EntityType == fromType && x.EntityId == fromId).ToListAsync(cancellationToken);
        images.ForEach(x =>
        {
            x.EntityType = toType;
            x.EntityId = toId;
        });
        return true;
    }

    private async Task<long> SaveMovedEntityAsync(EntityItem entity, EntityType toType, CancellationToken cancellationToken)
    {
        if (toType == EntityType.Author)
        {
            var row = new Author
            {
                Name = entity.Name,
                Content = entity.Content,
            };
            await _database.Authors.AddAsync(row);
            await _database.SaveChangesAsync(cancellationToken);
            return row.AuthorId;
        }

        else if (toType == EntityType.Post)
        {
            var row = new Post
            {
                Title = entity.Name,
                Content = entity.Content,
                Author = entity.Author,
            };
            await _database.Posts.AddAsync(row);
            await _database.SaveChangesAsync(cancellationToken);
            return row.PostId;
        }

        else if (toType == EntityType.Area)
        {
            var row = new Area
            {
                Name = entity.Name,
                Content = entity.Content,
            };
            await _database.Areas.AddAsync(row);
            await _database.SaveChangesAsync(cancellationToken);
            return row.AreaId;
        }

        else if (toType == EntityType.Book)
        {
            var row = new Book
            {
                Title = entity.Name,
                Content = entity.Content,
                Author = entity.Author,
            };
            await _database.Books.AddAsync(row);
            await _database.SaveChangesAsync(cancellationToken);
            return row.BookId;
        }

        else if (toType == EntityType.Link)
        {
            var row = new Link
            {
                Name = entity.Name,
                Content = entity.Content,
                Url = entity.Author,
            };
            await _database.Links.AddAsync(row);
            await _database.SaveChangesAsync(cancellationToken);
            return row.LinkId;
        }

        else if (toType == EntityType.Period)
        {
            var row = new Period
            {
                Name = entity.Name,
                Content = entity.Content,
            };
            await _database.Periods.AddAsync(row);
            await _database.SaveChangesAsync(cancellationToken);
            return row.PeriodId;
        }

        else if (toType == EntityType.Thesis)
        {
            var row = new Thesis
            {
                Name = entity.Name,
                Content = entity.Content,
            };
            await _database.Theses.AddAsync(row);
            await _database.SaveChangesAsync(cancellationToken);
            return row.ThesisId;
        }

        else if (toType == EntityType.Topic)
        {
            var row = new Topic
            {
                Name = entity.Name,
                Content = entity.Content,
            };
            await _database.Topics.AddAsync(row);
            await _database.SaveChangesAsync(cancellationToken);
            return row.TopicId;
        }
        return -1;
    }

    private async Task<IEnumerable<Relationship>> ChangeRelationshipsAsync(EntityType fromType, long fromId, EntityType toType, long toId, CancellationToken cancellationToken)
    {
        var items = await _database.Relationships.Where(x => (x.EntityTypeA == fromType && x.EntityIdA == fromId) || (x.EntityTypeB == fromType && x.EntityIdB == fromId)).ToListAsync(cancellationToken);
        items.ForEach(x =>
        {
            if (x.EntityTypeA == fromType && x.EntityIdA == fromId)
            {
                x.EntityTypeA = toType;
                x.EntityIdA = toId;
            }
            else if (x.EntityTypeB == fromType && x.EntityIdB == fromId)
            {
                x.EntityTypeB = toType;
                x.EntityIdB = toId;
            }
        });
        return items;
    }

    private async Task<EntityItem> RemoveEntityAsync(EntityType fromType, long id, CancellationToken cancellationToken)
    {
        var entity = new EntityItem();
        if (fromType == EntityType.Author)
        {
            var row = await _database.Authors.FirstOrDefaultAsync(x => x.AuthorId == id, cancellationToken);
            entity.Name = row.Name;
            entity.Content = row.Content;
            _database.Authors.Remove(row);
        }

        else if (fromType == EntityType.Post)
        {
            var row = await _database.Posts.FirstOrDefaultAsync(x => x.PostId == id, cancellationToken);
            entity.Name = row.Title;
            entity.Content = row.Content;
            entity.Author = row.Author;
            _database.Posts.Remove(row);
        }

        else if (fromType == EntityType.Area)
        {
            var row = await _database.Areas.FirstOrDefaultAsync(x => x.AreaId == id, cancellationToken);
            entity.Name = row.Name;
            entity.Content = row.Content;
            _database.Areas.Remove(row);
        }

        else if (fromType == EntityType.Book)
        {
            var row = await _database.Books.FirstOrDefaultAsync(x => x.BookId == id, cancellationToken);
            entity.Name = row.Title;
            entity.Content = row.Content;
            entity.Author = row.Author;
            _database.Books.Remove(row);
        }

        else if (fromType == EntityType.Link)
        {
            var row = await _database.Links.FirstOrDefaultAsync(x => x.LinkId == id, cancellationToken);
            entity.Name = row.Name;
            entity.Content = row.Content;
            entity.Author = row.Url;
            _database.Links.Remove(row);
        }

        else if (fromType == EntityType.Period)
        {
            var row = await _database.Periods.FirstOrDefaultAsync(x => x.PeriodId == id, cancellationToken);
            entity.Name = row.Name;
            entity.Content = row.Content;
            _database.Periods.Remove(row);
        }

        else if (fromType == EntityType.Thesis)
        {
            var row = await _database.Theses.FirstOrDefaultAsync(x => x.ThesisId == id, cancellationToken);
            entity.Name = row.Name;
            entity.Content = row.Content;
            _database.Theses.Remove(row);
        }

        else if (fromType == EntityType.Topic)
        {
            var row = await _database.Topics.FirstOrDefaultAsync(x => x.TopicId == id, cancellationToken);
            entity.Name = row.Name;
            entity.Content = row.Content;
            _database.Topics.Remove(row);
        }
        return entity;
    }

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
