const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Simple health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Endpoint to list files in a Google Drive folder. Expects query param `folderId`.
// Authentication: service account key JSON path set in env `GOOGLE_APPLICATION_CREDENTIALS`.
app.get('/api/drive/list', async (req, res) => {
  try {
    const folderId = req.query.folderId;
    if (!folderId) return res.status(400).json({ error: 'folderId required' });

    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });
    const drive = google.drive({ version: 'v3', auth });

    // List children in folder
    const q = `'${folderId}' in parents and trashed = false`;
    const resp = await drive.files.list({
      q,
      fields: 'files(id, name, mimeType, thumbnailLink, webViewLink)'
    });

    res.json({ files: resp.data.files || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Serve static client in production (after `npm run build` in client)
if (process.env.SERVE_CLIENT === 'true'){
  const clientDist = path.join(__dirname, '..', '..', 'client', 'dist')
  app.use(express.static(clientDist))
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')))
}

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on ${port}`));
