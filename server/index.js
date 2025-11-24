import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_DIR = path.join(__dirname, 'data');
const CONVERSATIONS_FILE = path.join(DATA_DIR, 'conversations.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Read conversations from file
async function readConversations() {
    try {
        const data = await fs.readFile(CONVERSATIONS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty array
        return [];
    }
}

// Write conversations to file
async function writeConversations(conversations) {
    await fs.writeFile(
        CONVERSATIONS_FILE,
        JSON.stringify(conversations, null, 2),
        'utf-8'
    );
}

// Routes

// GET /api/conversations - Get all conversations
app.get('/api/conversations', async (req, res) => {
    try {
        const conversations = await readConversations();
        res.json(conversations);
    } catch (error) {
        console.error('Error reading conversations:', error);
        res.status(500).json({ error: 'Failed to read conversations' });
    }
});

// GET /api/conversations/:id - Get specific conversation
app.get('/api/conversations/:id', async (req, res) => {
    try {
        const conversations = await readConversations();
        const conversation = conversations.find(c => c.id === req.params.id);

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        res.json(conversation);
    } catch (error) {
        console.error('Error reading conversation:', error);
        res.status(500).json({ error: 'Failed to read conversation' });
    }
});

// POST /api/conversations - Save new conversation
app.post('/api/conversations', async (req, res) => {
    try {
        const { messages, userId } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid messages format' });
        }

        const conversations = await readConversations();

        const newConversation = {
            id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: userId || 'anonymous',
            timestamp: new Date().toISOString(),
            messages: messages,
            preview: getConversationPreview(messages)
        };

        conversations.unshift(newConversation);

        // Keep only last 100 conversations
        const trimmed = conversations.slice(0, 100);

        await writeConversations(trimmed);

        res.status(201).json(newConversation);
    } catch (error) {
        console.error('Error saving conversation:', error);
        res.status(500).json({ error: 'Failed to save conversation' });
    }
});

// PUT /api/conversations/:id - Update existing conversation
app.put('/api/conversations/:id', async (req, res) => {
    try {
        const { messages } = req.body;
        const conversations = await readConversations();

        const index = conversations.findIndex(c => c.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        conversations[index] = {
            ...conversations[index],
            messages: messages,
            preview: getConversationPreview(messages),
            updatedAt: new Date().toISOString()
        };

        await writeConversations(conversations);

        res.json(conversations[index]);
    } catch (error) {
        console.error('Error updating conversation:', error);
        res.status(500).json({ error: 'Failed to update conversation' });
    }
});

// DELETE /api/conversations/:id - Delete conversation
app.delete('/api/conversations/:id', async (req, res) => {
    try {
        const conversations = await readConversations();
        const filtered = conversations.filter(c => c.id !== req.params.id);

        if (filtered.length === conversations.length) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        await writeConversations(filtered);

        res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
});

// DELETE /api/conversations - Delete all conversations
app.delete('/api/conversations', async (req, res) => {
    try {
        await writeConversations([]);
        res.json({ message: 'All conversations deleted successfully' });
    } catch (error) {
        console.error('Error deleting conversations:', error);
        res.status(500).json({ error: 'Failed to delete conversations' });
    }
});

// GET /api/stats - Get storage statistics
app.get('/api/stats', async (req, res) => {
    try {
        const conversations = await readConversations();
        const stats = await fs.stat(CONVERSATIONS_FILE).catch(() => ({ size: 0 }));

        res.json({
            totalConversations: conversations.length,
            totalMessages: conversations.reduce((sum, conv) => sum + conv.messages.length, 0),
            storageUsed: formatBytes(stats.size),
            storageUsedBytes: stats.size
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Failed to get statistics' });
    }
});

// Helper functions
function getConversationPreview(messages) {
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    if (firstUserMessage) {
        return firstUserMessage.text.substring(0, 100) +
            (firstUserMessage.text.length > 100 ? '...' : '');
    }
    return 'Nova conversa';
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Initialize and start server
async function startServer() {
    await ensureDataDir();

    app.listen(PORT, () => {
        console.log(`🚀 HealthTalk Server running on http://localhost:${PORT}`);
        console.log(`📁 Data directory: ${DATA_DIR}`);
        console.log(`💾 Conversations file: ${CONVERSATIONS_FILE}`);
    });
}

startServer();
