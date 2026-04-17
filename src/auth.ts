import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "./prisma-db.js";

export type Payload = {
  id: string
  email: string
  name: string
}

export async function hashPassword(password: string):Promise<string> {
  return await hash(password, 10)
} 

export async function passwordVerify(password: string, oldPassword: string):Promise<boolean>{
  return await compare(password, oldPassword)
} 

export function generateToken(id: string, email: string, name: string) {
  const payload: Payload = {
      id,
      email,
      name
  }
  const secret = process.env.JWT_SECRET || 'codigo-secreto'
  return  jwt.sign(payload, secret, {expiresIn: '7d'})
} 

export function verifyToken(token: string):Payload {
  const secret = process.env.JWT_SECRET || 'codigo-secreto'
  return jwt.verify(token, secret) as Payload
}

export function requireRole(role: 'OWNER' | 'MEMBER'){
  async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user.id

      const userRole = await prisma.workspaceMember.findFirst({

      })
  }
 
}