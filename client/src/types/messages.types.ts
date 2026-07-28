export interface IMessage {
  _id: String;
  senderId: String;
  receiverId: String;
  text: string;
  image?: string;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}
