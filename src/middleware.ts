import { FastifyReply, FastifyRequest } from "fastify";
import { verifyToken } from "./auth.js";

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply){
    const authHeaders = request.headers.authorization

    if(!authHeaders?.startsWith('Bearer ')){
      return reply.status(401).send({message: 'Token não fornecido!'})
    }

    const token = authHeaders.split(' ')[1]
    try {
      const payload = verifyToken(token)
      request.user = {
        id: payload.id,
        email: payload.email,
        name: payload.name
      }
    } catch (error) {
      return reply.status(401).send({message: 'Token inválido'})
    }
}