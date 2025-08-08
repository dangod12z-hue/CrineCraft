export type NetEvent =
  | { type: 'hello'; id: string }
  | { type: 'state'; players: Record<string, { x: number; y: number; flipX: boolean }> }
  | { type: 'join'; id: string }
  | { type: 'leave'; id: string };

export class NetClient {
  private ws?: WebSocket;
  private url: string;
  id: string | null = null;
  others: Record<string, { x: number; y: number; flipX: boolean }> = {};

  constructor(url = `ws://${location.hostname}:8080`) {
    this.url = url;
  }

  connect(onEvent?: (e: NetEvent) => void): void {
    this.ws = new WebSocket(this.url);
    this.ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data as string) as NetEvent;
        if (data.type === 'hello') this.id = data.id;
        if (data.type === 'state') this.others = data.players;
        onEvent?.(data);
      } catch {
        // ignore
      }
    };
  }

  sendState(x: number, y: number, flipX: boolean): void {
    if (!this.ws || this.ws.readyState !== this.ws.OPEN) return;
    this.ws.send(JSON.stringify({ type: 'state', x, y, flipX }));
  }
}