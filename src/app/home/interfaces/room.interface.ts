

export interface IResponseAllRooms {
  total: number;
  rooms: IRooms[];
}

export interface IRooms {
  role:      Role;
  status:    Status;
  createdAt: Date;
  room:      IRoom;
}

export interface IRoom {
  id:          number;
  code:        string;
  name:        string;
  description: string;
  status:      boolean;
  createdAt:   Date;
  updatedAt:   Date;
}

export interface IResponseCreateRoom {
  room: IRoom;
}

export interface IBodyCreateRoom {
  name: string;
  description: string;
}


export type Role = "OWNER" | "COLABORATOR" | "MEMBER";

export type Status = "OFICIAL" | "INVITATION" | "REFUSED" | "REMOVED";

export const isRole = {
  "OWNER": "Administrador",
  "COLABORATOR": "Colaborador",
  "MEMBER": "Miembro"
}
