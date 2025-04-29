import { User } from "../../auth/interfaces";
import { Role } from "../../home/interfaces";



export interface IResponseGetFindUsers {
  total: number;
  users: User[];
}


export interface IBodyInvitateUser {
  userId: string;
  role: Role;
}
