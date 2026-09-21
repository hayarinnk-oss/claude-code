import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { propertyRouter } from './routes/property.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    reinfolibConfigured: Boolean(process.env.REINFOLIB_API_KEY),
    googleMapsConfigured: Boolean(process.env.GOOGLE_MAPS_SERVER_API_KEY),
  });
});

app.use('/api/property', propertyRouter);

// 本番運用時: `client` を `npm run build` した dist を静的配信する(単一プロセスでの動作用)
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`property-value-server listening on http://localhost:${PORT}`);
});
