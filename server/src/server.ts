// server/src/server.ts
// Express REST API Server for RTO One

import express, { Request, Response } from 'express';
import cors from 'cors';
import { AppDataStore } from './store';
import { JurisdictionRuleEngine } from '../../src/shared/jurisdiction-engine';
import { VoiceIdentifierParser } from '../../src/shared/voice-parser';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const store = AppDataStore.getInstance();

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    service: 'RTO One Core Orchestrator',
    timestamp: new Date().toISOString(),
    environment: 'SIMULATED_DEMO',
  });
});

// Dashboard metrics
app.get('/api/dashboard', (req: Request, res: Response) => {
  res.json(store.getDashboard());
});

// Tasks & DAG Graph
app.get('/api/tasks', (req: Request, res: Response) => {
  res.json(store.getTasks());
});

app.get('/api/graph', (req: Request, res: Response) => {
  res.json(store.getGraphData());
});

app.post('/api/tasks/:id/complete', (req: Request, res: Response) => {
  try {
    const updated = store.completeTask(req.params.id as string);
    res.json({ success: true, tasks: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/tasks/:id/status', (req: Request, res: Response) => {
  try {
    const { status, reason } = req.body;
    const task = store.updateTaskStatus(req.params.id as string, status, reason);
    res.json({ success: true, task });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Vehicles, Licences, Challans
app.get('/api/vehicles', (req: Request, res: Response) => {
  res.json(store.getState().vehicles);
});

app.get('/api/licences', (req: Request, res: Response) => {
  res.json(store.getState().licences);
});

app.get('/api/challans', (req: Request, res: Response) => {
  res.json(store.getState().challans);
});

// Appointments & Scarcity
app.get('/api/appointments', (req: Request, res: Response) => {
  res.json({
    slots: store.getState().appointmentSlots,
    leadDays: store.getState().appointmentLeadDays,
    isScarcityActive: store.getState().isScarcityMode,
  });
});

app.post('/api/appointments/:id/book', (req: Request, res: Response) => {
  try {
    const slot = store.bookAppointment(req.params.id as string);
    res.json({ success: true, slot });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/appointments/:id/cancel', (req: Request, res: Response) => {
  try {
    const slot = store.cancelAppointment(req.params.id as string);
    res.json({ success: true, slot });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Payments
app.get('/api/payments', (req: Request, res: Response) => {
  res.json(store.getState().payments);
});

app.post('/api/payments/:id/action', (req: Request, res: Response) => {
  try {
    const { action } = req.body;
    const payment = store.handlePaymentAction(req.params.id as string, action);
    res.json({ success: true, payment });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Integrations
app.get('/api/integrations', (req: Request, res: Response) => {
  res.json(store.getState().integrations);
});

// Household & Privacy
app.get('/api/household', (req: Request, res: Response) => {
  res.json({
    members: store.getState().household,
    vehicles: store.getState().vehicles,
    licences: store.getState().licences,
  });
});

app.post('/api/privacy/consent', (req: Request, res: Response) => {
  const { entityId, entityType, purpose } = req.body;
  if (!entityId || !purpose) {
    res.status(400).json({ error: 'entityId and purpose are required.' });
    return;
  }
  const event = store.recordPrivacyConsent(entityId, entityType || 'VEHICLE', purpose);
  res.json({ success: true, event });
});

// Audit Log
app.get('/api/audit', (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  let logs = store.getState().auditLogs;
  if (category && category !== 'ALL') {
    logs = logs.filter((l) => l.category === category);
  }
  res.json(logs);
});

// Jurisdiction Rules
app.get('/api/rules/national', (req: Request, res: Response) => {
  res.json(JurisdictionRuleEngine.getNationalCoverage());
});

app.get('/api/rules/:code', (req: Request, res: Response) => {
  try {
    const code = req.params.code as string;
    const pack = JurisdictionRuleEngine.getRulePack(code);
    res.json(pack);
  } catch (err: any) {
    // Missing Odisha / unconfigured jurisdiction safe fallback!
    res.status(404).json({
      error: 'RULES_UNAVAILABLE',
      jurisdiction: req.params.code as string,
      message: err.message,
      officialPortal: JurisdictionRuleEngine.getOfficialPortal(req.params.code as string),
    });
  }
});

// Voice Parsing
app.post('/api/voice/parse', (req: Request, res: Response) => {
  const { transcript } = req.body;
  const result = VoiceIdentifierParser.parse(transcript || '');
  res.json(result);
});

// Demo Lab Scenarios
app.post('/api/demo/scarcity', (req: Request, res: Response) => {
  const { activate } = req.body;
  store.setAppointmentScarcity(!!activate);
  res.json({
    success: true,
    isScarcityMode: store.getState().isScarcityMode,
    leadDays: store.getState().appointmentLeadDays,
  });
});

app.post('/api/demo/reset', (req: Request, res: Response) => {
  store.resetToInitial(true);
  res.json({ success: true, message: 'All demo states reset to clean baseline.' });
});

// Listen
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[RTO One Backend] Server running on http://localhost:${PORT}`);
  });
}

export default app;
