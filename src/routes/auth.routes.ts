import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../prisma-db.js";
import { loginSchema } from "./auth.schema.js";
import { generateToken, passwordVerify } from "../auth.js";
import { PrismaUserRepository } from "../repositories/prisma-user.repository.js";
import { UserService } from "../services/user.js";

export async function authRoutes(app: FastifyInstance) {
  const repo = new PrismaUserRepository()
  const service = new UserService(repo)
  app.post('/login', {
    schema: {
        tags: ['Auth'],
        body:{
          required: ['email', 'password'],
          properties: {
            email: {type: 'string', format: 'email'},
            password: {type: 'string', minLength: 4}
          }
        },
        response:{  
          200:{
              type: 'object',
              properties: {
              token: {type: 'string'},
              user: {
                type: 'object',
                properties: {
                  id: {type: 'string'},
                  name: {type: 'string'},
                  email: {type: 'string'}
                }
              }
              }
          }
        }
  }}, async (request: FastifyRequest, reply: FastifyReply) => {
        const {email, password} = loginSchema.parse(request.body)

        const user = await service.login(email, password)
        
        const {safeData, token} = user

        return reply.status(200).send({user: safeData, token})
        
  })
}