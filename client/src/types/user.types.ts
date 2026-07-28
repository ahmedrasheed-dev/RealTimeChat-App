export interface IUser {
  _id: String;
  email: string;
  fullName: string;
  password?: string;
  profilePic?: string;
  bio?: string;
}