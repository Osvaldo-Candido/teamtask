import {afterAll, beforeAll, describe, expect, it} from 'vitest'
import {fastify} from 'fastify'
import { prisma } from '../prisma-db.js'
import { hashPassword } from '../auth-middleware.js'
import { authRoutes } from '../routes/auth.routes.js'

const app = fastify({
  ajv:{
    customOptions:{
      strict: false
    }
  }
})

app.register(authRoutes, {prefix: '/auth'})

let osvaldoToken: string
let albertinaToken: string
let cebolaToken: string

afterAll(async () => {
  await app.ready()

  await prisma.user.deleteMany({
    where:{email: {in: [
      'osvaldo@test.com',
      'albertina@test.com',
      'cebola@test.com'
    ]}}
  })

 await prisma.user.create({
    data: {
      name: 'osvaldo',
      email: 'osvaldo@test.com',
      password: await hashPassword('ps1234')
    }
  })


 await prisma.user.create({
    data: {
      name: 'albertina',
      email: 'albertina@test.com',
      password: await hashPassword('ps1234')
    }
  })

 await prisma.user.create({
    data: {
      name: 'cebola',
      email: 'cebola@test.com',
      password: await hashPassword('ps1234')
    }
  })

})

beforeAll(async() => {
  await prisma.user.deleteMany({where:{email:{in:[
     'osvaldo@test.com',
      'albertina@test.com',
      'cebola@test.com'
  ]}}})

  await prisma.$disconnect()
  app.close()
})

describe('POST auth/login testando o login da minha aplicação', async () => {
  it('deve ser possível fazer login com as credenciais correctas', async () => {
        const response = await app.inject({
        method: 'POST',
        url: '/login',
        body: {email: 'osvaldo@test.com', password: 'ps1234'}
        })

        expect(response.statusCode).toBe(200)
  })
})