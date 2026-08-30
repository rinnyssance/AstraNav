import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_WAYPOINTS } from './src/data/mockTelemetry';
import { calculateBioMetrics } from './src/utils/bioEngine';
import { generateAIBriefing, generateAIChatReply } from './server/gemini';
import { BioCoreTelemetry } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // In-memory rover state
  let currentWaypoints = [...INITIAL_WAYPOINTS];
  let activeWaypointIndex = 0;

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'nominal',
      subsystem: 'AstraNav PSR Bioastronautics Mission Engine',
      geminiKeyConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // Get mock rover waypoints and current active telemetry
  app.get('/api/telemetry/mock-rover', (req, res) => {
    res.json({
      waypoints: currentWaypoints,
      activeWaypointIndex,
      activeTelemetry: currentWaypoints[activeWaypointIndex]?.telemetry || currentWaypoints[0].telemetry,
      mission_time: new Date().toISOString(),
    });
  });

  // Telemetry Ingestion Endpoint: accepts PSR-SOUTH-POLE-LOG JSON payload
  app.post('/api/telemetry/ingest', (req, res) => {
    try {
      const payload = req.body;
      if (!payload || !payload.siteId) {
        return res.status(400).json({ error: 'Invalid PSR telemetry payload: siteId required.' });
      }

      // Compute derived bioastronautics metrics
      const computed = calculateBioMetrics(payload);
      const fullTelemetry: BioCoreTelemetry = {
        ...payload,
        computed,
      };

      // If matching an existing waypoint, update it; otherwise add to list
      const idx = currentWaypoints.findIndex((w) => w.telemetry.siteId === fullTelemetry.siteId);
      if (idx >= 0) {
        currentWaypoints[idx].telemetry = fullTelemetry;
        activeWaypointIndex = idx;
      }

      res.json({
        success: true,
        message: 'Telemetry successfully ingested into AstraNav Bio-Core.',
        telemetry: fullTelemetry,
      });
    } catch (err: any) {
      console.error('Ingestion error:', err);
      res.status(500).json({ error: err?.message || 'Failed to ingest telemetry payload.' });
    }
  });

  // Set active waypoint index
  app.post('/api/telemetry/select-waypoint', (req, res) => {
    const { index } = req.body;
    if (typeof index === 'number' && index >= 0 && index < currentWaypoints.length) {
      activeWaypointIndex = index;
      res.json({
        success: true,
        activeWaypointIndex,
        activeTelemetry: currentWaypoints[activeWaypointIndex].telemetry,
      });
    } else {
      res.status(400).json({ error: 'Invalid waypoint index' });
    }
  });

  // Reset to default mock waypoints
  app.post('/api/telemetry/reset', (req, res) => {
    currentWaypoints = [...INITIAL_WAYPOINTS];
    activeWaypointIndex = 0;
    res.json({
      success: true,
      waypoints: currentWaypoints,
      activeWaypointIndex,
      activeTelemetry: currentWaypoints[0].telemetry,
    });
  });

  // AI Flight Director Briefing Endpoint
  app.post('/api/ai/briefing', async (req, res) => {
    try {
      const telemetry: BioCoreTelemetry = req.body.telemetry || currentWaypoints[activeWaypointIndex].telemetry;
      const briefing = await generateAIBriefing(telemetry);
      res.json(briefing);
    } catch (err: any) {
      console.error('AI Briefing API error:', err);
      res.status(500).json({ error: err?.message || 'Failed to generate AI flight briefing' });
    }
  });

  // Interactive AI Copilot / Flight Director Q&A
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { question, telemetry, history } = req.body;
      if (!question) {
        return res.status(400).json({ error: 'Question is required' });
      }
      const activeData = telemetry || currentWaypoints[activeWaypointIndex].telemetry;
      const reply = await generateAIChatReply(question, activeData, history || []);
      res.json({ reply });
    } catch (err: any) {
      console.error('AI Chat API error:', err);
      res.status(500).json({ error: err?.message || 'Failed to generate AI response' });
    }
  });

  // --- Vite Middleware for Development / Static serving for Production ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AstraNav PSR Server] Mission Control running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
