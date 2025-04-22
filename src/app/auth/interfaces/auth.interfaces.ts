
export interface IBodySignIn {
  email:    string;
  password: string;
}


export interface IResponseSignIn {
  user:  User;
  token: string;
}

export interface User {
  id:        string;
  username:  string;
  email:     string;
  password:  string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBodySignUp {
  username: string;
  email:    string;
  password: string;
}

export interface IResponseSignUp {
  user: User;
}
