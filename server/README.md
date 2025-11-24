# HealthTalk Backend Server

Backend server para armazenamento de conversas em arquivos JSON.

## Instalação

```bash
cd server
npm install
```

## Executar

```bash
npm start
```

Ou com auto-reload durante desenvolvimento:
```bash
npm run dev
```

O servidor iniciará em `http://localhost:3001`

## API Endpoints

### GET /api/conversations
Retorna todas as conversas salvas

### GET /api/conversations/:id
Retorna uma conversa específica

### POST /api/conversations
Salva uma nova conversa
```json
{
  "messages": [...],
  "userId": "user@example.com"
}
```

### PUT /api/conversations/:id
Atualiza uma conversa existente

### DELETE /api/conversations/:id
Deleta uma conversa específica

### DELETE /api/conversations
Deleta todas as conversas

### GET /api/stats
Retorna estatísticas de armazenamento

## Estrutura de Dados

As conversas são salvas em `server/data/conversations.json`:

```json
[
  {
    "id": "conv_1234567890_abc123",
    "userId": "user@example.com",
    "timestamp": "2025-11-24T17:30:00.000Z",
    "messages": [
      {
        "role": "user",
        "text": "Olá!"
      },
      {
        "role": "ai",
        "text": "Olá! Como posso ajudar?"
      }
    ],
    "preview": "Olá!"
  }
]
```
