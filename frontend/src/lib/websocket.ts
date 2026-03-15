/**
 * WebSocket Client for EcoSync
 */

export type WSStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface WSConfig {
  url: string;
  clientId: string;
  perspective: 'consumer' | 'enterprise' | 'datacenter';
  onMessage?: (data: unknown) => void;
  onStatusChange?: (status: WSStatus) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: WSConfig;
  private status: WSStatus = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(config: WSConfig) {
    this.config = config;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.setStatus('connecting');

    const wsUrl = `${this.config.url.replace('http', 'ws')}/${this.config.perspective}/ws?client_id=${this.config.clientId}`;
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.setStatus('connected');
        this.reconnectAttempts = 0;
        console.log(`Connected to ${this.config.perspective} WebSocket`);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.config.onMessage?.(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        this.setStatus('disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.setStatus('error');
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.setStatus('error');
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.setStatus('disconnected');
  }

  send(data: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, message not sent');
    }
  }

  private scheduleReconnect(): void {
    const { reconnectInterval = 3000, maxReconnectAttempts = 5 } = this.config;

    if (this.reconnectAttempts >= maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private setStatus(status: WSStatus): void {
    this.status = status;
    this.config.onStatusChange?.(status);
  }

  getStatus(): WSStatus {
    return this.status;
  }

  isConnected(): boolean {
    return this.status === 'connected';
  }
}

// Hook-friendly factory function
export function createWebSocketClient(config: WSConfig): WebSocketClient {
  return new WebSocketClient(config);
}
