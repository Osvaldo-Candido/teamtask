import { User } from "../prisma/client.js";
import { CreateUserInterface } from "../services/user.js";
import { IUser } from "./user.repository.js";

export class InMemoryUserRepository implements IUser {
  private user: User [] =  []

  async createUser(data: CreateUserInterface): Promise<Partial<User>> {
    const user = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      password: data.password,
      createdAt: new Date()
    }

    this.user.push(user)

    return user
  }
  async findUserById(userId: string): Promise<Partial<User> | null> {
    return this.user.find(u => u.id === userId) ?? null
  }
  async findUserByEmail(email: string): Promise<User | null> {
    return this.user.find(u => u.email === email) ?? null
  }

  addUser(user:User){
    this.user.push(user)
  }
 
}