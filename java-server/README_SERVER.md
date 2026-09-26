Run the Java server (requires Maven 3.6+ and Java 17):

1. Set Google credentials for Drive API:
   - Create a service account JSON and set `GOOGLE_APPLICATION_CREDENTIALS` to its path.

2. Build and run:
   ```bash
   cd java-server
   mvn package
   mvn spring-boot:run
   ```

3. Endpoints:
   - `GET /api/drive/list?folderId=<id>` — lists files in a Drive folder (requires credentials).
   - `GET /api/posts` — lists saved posts (reads `posts.json`).
   - `POST /api/posts` — save a post; JSON body: `{ "mediaUrl": "...", "date": "YYYY-MM-DD", "about": "..." }`
