import { prisma } from "../prisma-db.js";
import { User } from "../prisma/client.js";
import { CreateUserInterface } from "../services/user.js";
import { IUser } from "./user.repository.js";

export class PrismaUserRepository implements IUser {
  async findUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where:{
        email
      }
    })

    if(!user) return null

    return user

  }

  async createUser(data:CreateUserInterface): Promise<Partial<User>> {
    const user = await prisma.user.create({
      data:{
        name:data.name,
        email:data.email,
        password: data.password
      },
      select:{
        id:true,
        name:true,
        email:true,
        createdAt:true
      }
    }) 

    return user
  }
  async findUserById(userId: string): Promise<Partial<User> | null> {
    const user = await prisma.user.findFirst({
      where:{
        id: userId
      },
      select:{
        id:true,
        name:true,
        email:true,
        createdAt: true
      }
    })

    if(!user) return null

    return user
  }

}