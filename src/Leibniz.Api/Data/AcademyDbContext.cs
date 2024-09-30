namespace Leibniz.Api.Data;
public class AcademyDbContext : DbContext
{
    public readonly ICurrentUserService _currentUserService;
    public readonly IDateTimeService _dateTimeService;

    public AcademyDbContext(
        DbContextOptions<AcademyDbContext> options,
        ICurrentUserService currentUserService,
        IDateTimeService dateTimeService) : base(options)
    {
        _currentUserService = currentUserService;
        _dateTimeService = dateTimeService;
    }

    public static AcademyDbContext CreateEmptyDatabase(
        ICurrentUserService currentUserService,
        IDateTimeService dateTimeService)
    {
        var options = new DbContextOptionsBuilder<AcademyDbContext>();
        options.UseInMemoryDatabase(Guid.NewGuid().ToString());
        var ctx = new AcademyDbContext(options.Options, currentUserService, dateTimeService);
        return ctx;
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<Link> Links { get; set; }
    public DbSet<Period> Periods { get; set; }
    public DbSet<Book> Books { get; set; }
    public DbSet<Thesis> Theses { get; set; }
    public DbSet<Author> Authors { get; set; }
    public DbSet<Topic> Topics { get; set; }
    public DbSet<Area> Areas { get; set; }
    public DbSet<Relationship> Relationships { get; set; }
    public DbSet<Image> Images { get; set; }

    public override int SaveChanges()
    {
        var GetUserId = (long? userId) =>
        {
            var id = _currentUserService.UserId;
            return userId.HasValue && userId > 0 ? userId ?? -1 : id ?? -1;
        };

        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedBy = GetUserId(entry.Entity.CreatedBy);
                    entry.Entity.CreateDateUtc = _dateTimeService.NowUtc;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedBy = GetUserId(entry.Entity.UpdatedBy);
                    entry.Entity.UpdateDateUtc = _dateTimeService.NowUtc;
                    break;
                case EntityState.Deleted:
                    entry.Entity.DeletedBy = GetUserId(entry.Entity.DeletedBy);
                    entry.Entity.DeleteDateUtc = _dateTimeService.NowUtc;
                    entry.Entity.IsDeleted = true;
                    entry.State = EntityState.Modified;
                    break;
            }
        }
        return base.SaveChanges();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return SaveChanges();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AcademyDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }

}
