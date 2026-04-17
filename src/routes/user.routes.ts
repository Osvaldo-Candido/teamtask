import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../prisma-db.js";
import { registerUserSchema } from "./user.schema.js";
import { hashPassword } from "../auth.js";

export async function userRoutes(app:FastifyInstance){
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

    const user = await prisma.user.findFirst({where: {email: dataUser.email}})

    if(user) {
      return reply.status(409).send({message: 'Já existe um usuário registado com este email.'})
    }

    const hashedPassword = await hashPassword(dataUser.password)

    const createdUser = await prisma.user.create({
      data:{
       name: dataUser.name,
       email: dataUser.email,
       password: hashedPassword
      }
    })

    const {password:_, ...safeUser} = createdUser
    return reply.status(201).send({safeUser})
  })
}