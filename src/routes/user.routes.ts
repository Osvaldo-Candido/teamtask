import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../prisma-db.js";
import { registerUserSchema } from "./user.schema.js";
import { hashPassword } from "../auth-middleware.js";
import { da } from "zod/locales";

export async function authRoutes(app:FastifyInstance){
  app.post('/', {
    schema:{
      tags:['User'],
      body:{
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
              name: {type: 'string'},
              email: {type: 'string'},
              password: {type: 'string'}
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
        ...dataUser
      }
    })

    const {password:_, ...safeUser} = createdUser

    return reply.status(200).send({user: safeUser})
  })
}