# JourneyFrames

Scaffold for a JourneyFrames site with a React (Vite) frontend and Express backend. Connects to Google Drive (service account) to list folders and media.

Setup

1. Install dependencies

- For the static Ember client (no build required) you can open `client/index.html` directly in a browser.
- For the Java server you'll need Maven and Java 17+. Install with your platform package manager.

To run the Java server, open a terminal in `java-server` and run:

```bash
mvn spring-boot:run
```

Set the `GOOGLE_APPLICATION_CREDENTIALS` env var to the full path of your service account JSON before running the server.

2. Provide Google service account credentials JSON and set `GOOGLE_APPLICATION_CREDENTIALS` to its path.

3. Run dev (runs client and server concurrently):

```bash
npm run dev
```

4. Local hosting options

- Option A — Static client (quick):

	- Open `client/index.html` in your browser (or run a simple static server from `client/`):

	```bash
	# from repo root
	npx http-server client -p 8080
	# then open http://localhost:8080
	```

- Option B — Java server + open client directly (client will call `/api` on the same host):

	1. Set `GOOGLE_APPLICATION_CREDENTIALS` to your service account JSON path.
	2. From `java-server` run `mvn spring-boot:run` (server runs on port 8080).
	3. Serve the static client as above or open `client/index.html` — requests to `/api` will work if you host the client on the same host/port or use a proxy.

Notes:
- The Java backend exposes `/api/drive/list?folderId=<id>` which returns a JSON list of files in the specified Drive folder.
- If you'd like a full Ember CLI app (recommended for larger projects), run `npm install -g ember-cli` and generate a new app in `client/` with `ember new client` and I can wire it into the Java backend.

Docker (no Java/Maven locally)

1. Create a `creds` folder at the repo root and place your service account JSON there as `creds/creds.json`.

2. Build and run with Docker Compose:

```bash
docker compose up --build
```

3. Open the static client at `http://localhost:8081` and the Java API will be available at `http://localhost:8080`.
