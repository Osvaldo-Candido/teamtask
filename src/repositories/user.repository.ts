import { User } from "../prisma/client.js";
import { CreateUserInterface } from "../services/user.js";

export interface IUser {
  createUser(data:CreateUserInterface):Promise<Partial<User>>
  findUserById(userId:string):Promise<Partial<User> | null>
  findUserByEmail(email:string):Promise<User | null>
}