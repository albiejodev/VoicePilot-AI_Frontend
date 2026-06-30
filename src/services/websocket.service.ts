const WS_URL = import.meta.env.VITE_WS_URL;

class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners = new Map<string, ((data: any) => void)[]>();

  connect(sessionId: string) {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.socket = new WebSocket(`${WS_URL}/ws/${sessionId}`);
    this.socket.binaryType = "arraybuffer";

    this.socket.onopen = () => {
      console.log("WebSocket connected");
    };

      this.socket.onmessage = async (event) => {

        if (typeof event.data === "string") {
    
            const message = JSON.parse(event.data);
    
            console.log(
                "Received:",
                message
            );
    
            this.emit(
                message.type,
                message.data
            );
    
            return;
        }
    
        console.log("Received audio");
    
        this.emit(
            "audio",
            event.data
        );
    };

    this.socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    this.socket.onerror = (error) => {
      console.error(error);
    };
  }

  on(event: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(event) || [];

    listeners.push(callback);

    this.listeners.set(event, listeners);
  }

  off(event: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(event);

    if (!listeners) return;

    this.listeners.set(
      event,
      listeners.filter((listener) => listener !== callback),
    );
  }

  private emit(event: string, data: any) {
    const listeners = this.listeners.get(event);

    if (!listeners) return;

    listeners.forEach((listener) => listener(data));
  }

  send(data: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    }
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }

  startRecordingSession() {
    this.send(
        JSON.stringify({
            type: "start_recording",
        })
    );
}

  stopRecordingSession() {
      this.send(
          JSON.stringify({
              type: "stop_recording",
          })
      );
  }
}

export const websocketService = new WebSocketService();
