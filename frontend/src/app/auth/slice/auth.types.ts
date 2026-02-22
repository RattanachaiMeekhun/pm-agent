export type User = {
  id: string;
  username: string;
  email: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};

export type RegisterRequest = {
  username: string;
  password: string;
  email: string;
};

export type RegisterResponse = {
  token: string;
  user: User;
};
