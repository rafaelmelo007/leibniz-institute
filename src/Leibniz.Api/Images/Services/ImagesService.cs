
namespace Leibniz.Api.Images.Services;
public class ImagesService : IImagesService
{
    private readonly AcademyDbContext _database;
    private const string ROOT_FOLDER = @"C:\data\tamarindo\files\images";

    public ImagesService(AcademyDbContext database)
    {
        _database = database;
    }

    public void SaveImage(string? filePath, EntityType type, long id)
    {
        if (string.IsNullOrWhiteSpace(filePath)) return;

        var file = new FileInfo(filePath);

        if (!file.Exists) return;

        var fileName = Path.GetFileName(filePath);
        var to = Path.Combine(ROOT_FOLDER, Path.GetFileName(filePath));
        if (!File.Exists(to))
        {
            File.Copy(filePath, to);
        }

        var found = _database.Images.SingleOrDefault(x => x.ImageFileName == fileName);
        if (found is not null) return;

        found = new Image
        {
            ImageFileName = fileName,
            EntityType = type,
            EntityId = id
        };
        _database.Images.Add(found);
        _database.SaveChanges();
    }

    public string GetFilePath(string fileName)
    {
        var path = Path.Combine(ROOT_FOLDER, Path.GetFileName(fileName));
        return path;
    }
}
