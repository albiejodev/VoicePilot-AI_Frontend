  export interface WebSocketMessage {
      type: string;
      data: any;
    }


  export type WebSocketEvent =
  | "ai_response"
  | "transcript"
  | "audio"
  | "error"
  | "connection"