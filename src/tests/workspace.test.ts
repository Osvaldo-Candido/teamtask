import {fastify} from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../prisma-db.js";
import { hashPassword } from "../auth.js";
import { authRoutes } from "../routes/auth.routes.js";
import { workspaceRoutes } from "../routes/workspace.routes.js";

const app = fastify({
  ajv:{
    customOptions:{
      strict: false
    }
  }
})

app.register(authRoutes, {prefix: '/auth'})
app.register(workspaceRoutes, {prefix: '/workspace'})

let ownerToken: string
let memberToken: string

beforeAll(async() => {
   await app.ready()
    await prisma.user.deleteMany({
      where:{
        email:{in:[
          'ws-owner@test.com',
          'ws-member@test.com'
        ]}
      }
    })

    await prisma.workspace.deleteMany({

    })

    await prisma.user.create({
      data:{
        name:'owner',
        email: 'ws-owner@test.com',
        password: await hashPassword('ps1234')
      }
    })

    await prisma.user.create({
      data:{
        name:'member',
        email: 'ws-member@test.com',
        password: await hashPassword('ps1234')
      }
    })


    //fazer login com os respectivos usuários
    const owner = await app.inject({
      method: 'POST',
      url: '/auth/login',
      body: {email: 'ws-owner@test.com', password: 'ps1234'}
    })

    ownerToken = owner.json().token
})
afterAll(async()=>{
    await prisma.workspaceMember.deleteMany({
      where:{
        user:{
          email:{in:['ws-owner@test.com','ws-member@test.com']}
        }
      }
    })

    await prisma.workspace.deleteMany({
      where:{
        name: 'imobil'
      }
    })
    await prisma.user.deleteMany({
      where:{
        email:{in:[
          'ws-owner@test.com',
          'ws-member@test.com'
        ]}
      }
    })
  
    await app.close()
    await prisma.$disconnect()
})
describe('POST /workspace', async () => {
  it('deve ser possível criar um workspace', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/workspace',
        headers:{authorization: `Bearer ${ownerToken}`},
        body:{name: 'imobil', description: 'aqui serão distribuídos todas as tarefas do pessoal da imobiliária'}
      })

      expect(response.statusCode).toBe(201)
  })

})

describe('GET /workspace', async () => {
  it('O utilizador autenticado vê os seus posts', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/workspace',
      headers: {authorization: `Bearer ${ownerToken}`}
    })

    expect(response.statusCode).toBe(200)
    const data = response.json()
    expect(data[0]).toHaveProperty('name')
  })

  it('utilizador sem token recebe 401', async () => {
    const response = await app.inject({
      method:'GET',
      url:'/workspace',
    }) 

    expect(response.statusCode).toBe(401)
  })
})