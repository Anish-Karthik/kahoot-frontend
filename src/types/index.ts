
export type LiveUser = {
  username: string;
  imageUrl: string;
};

export enum MessageType {
  ERROR = "ERROR",
  UPDATE = "UPDATE",
  JOIN = "JOIN",
  LEAVE = "LEAVE",
}

export type ChatMessage = {
  type: MessageType;
  content: string;
  sender: LiveUser;
};
