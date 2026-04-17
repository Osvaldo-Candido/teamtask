import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../prisma-db.js";
import { loginSchema } from "./auth.schema.js";
import { generateToken, passwordVerify } from "../auth.js";

export async function authRoutes(app: FastifyInstance) {
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

        const user = await prisma.user.findFirst({where: {email}})

        if(!user){
          return reply.status(401).send({message: 'Credenciais inválidas!'})
        }

        const passwordCompare = await passwordVerify(password, user.password)

        if(!passwordCompare){
          return reply.status(401).send({message: 'Credenciais inválidas!'})
        }

        const token = generateToken(user.id, user.email, user.name)
        
        const {password:_, ...safeData} = user

        return reply.status(200).send({user: safeData, token})
        
  })
}