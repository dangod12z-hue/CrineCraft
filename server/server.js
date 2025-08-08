/* eslint-disable no-console */
const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });
console.log('WS server on ws://localhost:8080');

const clients = new Map(); // ws -> id
const states = new Map();  // id -> { x, y, flipX }
let idSeq = 1;

wss.on('connection', (ws) => {
  const id = `p${idSeq++}`;
  clients.set(ws, id);
  ws.send(JSON.stringify({ type: 'hello', id }));
  broadcast({ type: 'join', id });

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'state') {
        const cur = { x: msg.x | 0, y: msg.y | 0, flipX: !!msg.flipX };
        states.set(id, cur);
        // Send aggregated state to all
        const players = Object.fromEntries([...states.entries()]);
        broadcast({ type: 'state', players });
      }
    } catch (e) {
      console.error('message error', e);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    states.delete(id);
    broadcast({ type: 'leave', id });
  });
});

function broadcast(obj) {
  const data = JSON.stringify(obj);
  for (const ws of wss.clients) {
    if (ws.readyState === ws.OPEN) ws.send(data);
  }
}