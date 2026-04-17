import {fastify} from 'fastify'
import {afterAll, beforeAll, describe, expect, it} from 'vitest'
import { prisma } from '../prisma-db.js'
import { hashPassword } from '../auth.js'
import { userRoutes } from '../routes/user.routes.js'
import { authRoutes } from '../routes/auth.routes.js'

const app = fastify({
  ajv:{
    customOptions:{
      strict: false
    }
  }
})

app.register(authRoutes, {prefix: '/auth'})
app.register(userRoutes, {prefix: '/user'})
beforeAll(async () => {
 await app.ready()

  await prisma.user.deleteMany({
    where:{email: {in: [
      'owner@test.com',
      'member@test.com'
    ]}}
  })

 await prisma.user.create({
    data: {
      name: 'owner',
      email: 'owner@test.com',
      password: await hashPassword('ps1234')
    }
  })


 await prisma.user.create({
    data: {
      name: 'member',
      email: 'member@test.com',
      password: await hashPassword('ps1234')
    }
  })


})

afterAll(async() => {
  await prisma.user.deleteMany({where:{email:{in:[
      'owner@test.com',
      'member@test.com'
  ]}}})
  await app.close()
  await prisma.$disconnect()

})

describe('POST auth/login testando o login da minha aplicação', async () => {
  it('deve ser possível fazer login com as credenciais correctas', async () => {
        const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        body: {email: 'owner@test.com', password: 'ps1234'}
        })
        
        expect(response.statusCode).toBe(200)
        const body = response.json()
        expect(body.password).toBeUndefined()
  })

  it('não deve ser possível fazer login com email errado', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        body: {email: 'ossan@test.com', password: 'ps1234'}
      })

      expect(response.statusCode).toBe(401)
  })
})