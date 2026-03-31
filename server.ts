import express from 'express';
import { createServer as createViteServer } from 'vite';
import mongoose from 'mongoose';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Connect to MongoDB if URI is provided
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('MongoDB connection error:', err);
    }
  } else {
    console.log('No MONGODB_URI provided, running without database connection.');
  }

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' 
    });
  });

  app.post('/api/claude/message', async (req, res) => {
    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'ANTHROPIC_API_KEY environment variable is required' });
      }

      const anthropic = new Anthropic({
        apiKey: apiKey,
      });

      const { messages, system, model = 'claude-3-haiku-20240307', max_tokens = 1024 } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages array is required' });
      }

      const response = await anthropic.messages.create({
        model,
        max_tokens,
        system,
        messages,
      });

      res.json(response);
    } catch (error: any) {
      console.error('Anthropic API Error:', error);
      res.status(500).json({ error: error.message || 'An error occurred while communicating with the Anthropic API' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
