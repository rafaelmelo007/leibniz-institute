using Microsoft.Extensions.Options;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace Leibniz.Api.Images.Services;
public class ImagesService : IImagesService
{
    private readonly AcademyDbContext _database;
    private readonly ImageConfiguration _configuration;

    public ImagesService(
        AcademyDbContext database,
        IOptions<ImageConfiguration> configuration)
    {
        _database = database;
        _configuration = configuration.Value;
    }

    public void SaveImage(string? filePath, EntityType type, long id)
    {
        if (string.IsNullOrWhiteSpace(filePath)) return;

        var file = new FileInfo(filePath);

        if (!file.Exists) return;

        var rootPath = _configuration.RootFilePath;
        if (rootPath is null) throw new ApplicationException("RootFilePath not configured.");

        var fileName = Path.GetFileName(filePath);
        var to = Path.Combine(rootPath, Path.GetFileName(filePath));
        if (!File.Exists(to))
        {
            File.Copy(filePath, to);
        }

        var found = _database.Images.SingleOrDefault(x => x.ImageFileName == fileName);
        if (found is not null) return;

        found = new Domain.Image
        {
            ImageFileName = fileName,
            EntityType = type,
            EntityId = id
        };
        _database.Images.Add(found);
        _database.SaveChanges();
    }

    public async Task<string?> GetImageFilePathAsync(string fileName,
        int? Width = default, int? Height = default,
        CancellationToken cancellationToken = default)
    {
        var image = await _database.Images.FirstOrDefaultAsync(x => x.ImageFileName == fileName, cancellationToken);
        if (image is null) return default;

        var rootPath = _configuration.RootFilePath;
        if (rootPath is null) return default;

        var path = Path.Combine(rootPath, Path.GetFileName(fileName));

        if (!File.Exists(path)) return default;

        if (Width.HasValue && Height.HasValue && Width.Value > 0 && Height.Value > 0)
        {
            path = GetOrSetCachedImageFilePath(path, Width.Value, Height.Value);
        }

        return path;
    }

    #region Helper Methods

    private string GetOrSetCachedImageFilePath(string path, int maxWidth, int maxHeight)
    {
        if (path is null) return path;

        var cacheFolder = Path.Combine(Path.GetDirectoryName(path), "Cache");
        if (!Directory.Exists(cacheFolder))
        {
            Directory.CreateDirectory(cacheFolder);
        }

        string cachedFilePath = Path.Combine(cacheFolder,
            $"{Path.GetFileNameWithoutExtension(path)}__{maxWidth}x{maxHeight}{Path.GetExtension(path)}");

        if (File.Exists(cachedFilePath))
        {
            return cachedFilePath;
        }

        using var image = SixLabors.ImageSharp.Image.Load(path);

        double ratioX = (double)maxWidth / image.Width;
        double ratioY = (double)maxHeight / image.Height;
        double ratio = Math.Min(ratioX, ratioY);

        int newWidth = (int)(image.Width * ratio);
        int newHeight = (int)(image.Height * ratio);

        image.Mutate(x => x.Resize(newWidth, newHeight));
        image.Save(cachedFilePath);

        return cachedFilePath;
    }


    #endregion
}
