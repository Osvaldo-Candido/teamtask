import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../prisma-db.js";
import { registerUserSchema } from "./user.schema.js";
import { hashPassword } from "../auth.js";
import { PrismaUserRepository } from "../repositories/prisma-user.repository.js";
import { UserService } from "../services/user.js";

export async function userRoutes(app:FastifyInstance){
  const repo = new PrismaUserRepository()
  const service = new UserService(repo)

  app.post('/', {
    schema:{
      tags:['User'],
      body:{
          type: 'object',
          required: ['name', 'email', 'password'],
          properties:{
            name: {type: 'string', minLength: 1},
            email: {type: 'string', format: 'email'},
            password: {type: 'string', minLength: 6}
          }
      },
      response:{
          201:{
            type: 'object',
            properties: {
              safeUser:{
              type: 'object',
              properties: {
              name: {type: 'string'},
              email: {type: 'string'}
              }
              }
             
            }
          }
      }
    }
  },async (request: FastifyRequest, reply: FastifyReply) => {
    const dataUser = registerUserSchema.parse(request.body)

    const safeUser = await service.create(dataUser)
    return reply.status(201).send({safeUser})
  })
}