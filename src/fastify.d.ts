import { Role } from "./prisma/enums.ts"

declare module 'fastify' {
  interface FastifyRequest {
    user:{
      id: string
      email: string
      name: string
    }
  }
} 