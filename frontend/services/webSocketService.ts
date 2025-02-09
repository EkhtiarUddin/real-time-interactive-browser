interface WebSocketCallbacks {
  onOpen?: () => void
  onMessage?: (event: MessageEvent) => void
  onError?: (event: Event) => void
  onClose?: () => void
}

class WebSocketService {
  private url: string
  private callbacks: WebSocketCallbacks
  private ws: WebSocket | null = null

  constructor(url: string, callbacks: WebSocketCallbacks) {
    this.url = url
    this.callbacks = callbacks
  }

  connect(): void {
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      this.callbacks.onOpen?.()
    }

    this.ws.onmessage = (event) => {
      this.callbacks.onMessage?.(event)
    }

    this.ws.onerror = (event) => {
      this.callbacks.onError?.(event)
    }

    this.ws.onclose = () => {
      this.callbacks.onClose?.()
    }
  }

  send(message: any): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
      return true
    }
    return false
  }

  close(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export default WebSocketService
