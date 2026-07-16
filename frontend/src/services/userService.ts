import { api } from "../lib/api";

export interface User {

  id: number;

  name: string;

  email: string;

  role: string;

  isActive: boolean;

  createdAt: string;

}

export interface CreateUserRequest {

  name: string;

  email: string;

  password: string;

  role: string;

}

export async function getUsers() {

  return api<User[]>(

    "/users"

  );

}

export async function createUser(

  data: CreateUserRequest

) {

  return api<User>(

    "/users",

    {

      method: "POST",

      body: JSON.stringify(data),

    }

  );

}

export async function updateUser(

  id: number,

  data: Omit<User, "id" | "createdAt">

) {

  return api<User>(

    `/users/${id}`,

    {

      method: "PUT",

      body: JSON.stringify(data),

    }

  );

}