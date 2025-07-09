using System.Security.Cryptography;

namespace Leibniz.Api.Users.Services;
public class PasswordHasher
{
    public static (byte[] hash, byte[] salt) HashPassword(string password)
    {
        using (var rng = new RNGCryptoServiceProvider())
        {
            byte[] salt = new byte[16];
            rng.GetBytes(salt);

            using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000))
            {
                byte[] hash = pbkdf2.GetBytes(32);
                return (hash, salt);
            }
        }
    }

    public static bool VerifyPassword(string password, byte[] storedHash, byte[] storedSalt)
    {
        using (var pbkdf2 = new Rfc2898DeriveBytes(password, storedSalt, 10000))
        {
            byte[] hash = pbkdf2.GetBytes(32);
            return hash.SequenceEqual(storedHash);
        }
    }
}
