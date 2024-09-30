
namespace Leibniz.Api.Images.Services;
public interface IImagesService
{
    void SaveImage(string? filePath, EntityType type, long id);
    string GetFilePath(string fileName);
}
