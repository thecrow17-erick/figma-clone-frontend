import { Role, Status } from "../../home/interfaces";

export interface IRoomIDGetResponse {
  room: Room;
}

export interface Room {
  id:          number;
  name:        string;
  description: string;
  code:        string;
  status:      boolean;
  createdAt:   Date;
  updatedAt:   Date;
  users:       UserElement[];
}

export interface UserElement {
  user_id:   string;
  role:      Role;
  room_id:   number;
  status:    Status;
  createdAt: Date;
  user:      UserUser;
}

export interface UserUser {
  id:        string;
  username:  string;
  email:     string;
  password:  string;
  createdAt: Date;
  updatedAt: Date;
}
