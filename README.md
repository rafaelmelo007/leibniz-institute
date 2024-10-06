# Leibniz Institute

C# 8.0/Angular 18 application for the Leibniz Institute, a knowledge-based platform offering cross-referenced data on authors, periods, areas, posts, quotations, and books. Users can explore author profiles, like Aristotle, and access lists of works, quotations, theses, and key events.

## Sections

- **Posts**: database of posts, articles or quotations from multiple authors;
- **Books**: database of books;
- **Authors**: database of authors;
- **Topics**: database of topics;
- **Periods**: database of periods;
- **Areas**: database of areas;
- **Theses**: database of Theses;
- **Links**: database of links.


## Environment Variables to be added in the .env file:

- **DataConfiguration__ConnectionString**: Connection string to access the application database;

- **EmailConfiguration__EmailFrom**: User account of the smtp credentials;
- **EmailConfiguration__Password**: Password of the smtp credentials;
- **EmailConfiguration__Host**: Host of the smtp credentials;
- **EmailConfiguration__Port**: Smtp port - default 587;
- **EmailConfiguration__RequireSsl**: If Smtp connection requests ssl;

- **ImageConfiguration__RootFilePath**: Physical location of the images managed by the website.
