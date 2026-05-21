import fastify from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../prisma-db.js";
import { hashPassword } from "../auth.js";
import { authRoutes } from "../routes/auth.routes.js";
import { taskRoutes } from "../routes/tasks.routes.js";
import { workspaceRoutes } from "../routes/workspace.routes.js";
import { InMemoryTaskRepository } from "../repositories/in-memory-task.repository.js";
import { TaskService } from "../services/tasks.js";

const app = fastify({
  ajv:{
    customOptions:{
      strict: false
    }
  }
})

app.register(authRoutes, {prefix:'/auth'})
app.register(taskRoutes, {prefix: '/workspace/:workspaceId'})
app.register(workspaceRoutes, {prefix: '/workspace'})

let ownerToken: string
/* let memberToken: string */
let notMemberToken:string

beforeAll(async()=>{
  //criando o owner
  await app.ready()
  await prisma.task.deleteMany({
         where:{
          title: {in:['tarefa_membro','dev_project','Tarefa 1']}
         }
      })

  await prisma.workspaceMember.deleteMany({
    where:{
      user:{
        email:{in:['wr-owner@test.com','notmember@test.com']}
      }
    }
  })

  await prisma.workspace.deleteMany({
    where:{
      name:{in: ['workspace_test','work para editar']}
    }
  })

  await prisma.user.deleteMany({
    where:{email:{in:['wr-owner@test.com','wr-member@test.com','notmember@test.com']}}
  })

   const ownerUser = await prisma.user.create({
    data:{
      name: 'owner',
      email: 'wr-owner@test.com',
      password: await hashPassword('ps1234')
    },
    include:{
      workspaceMembers: true
    }
  })

  await prisma.user.create({
    data:{
      name: 'member',
      email: 'wr-member@test.com',
      password: await hashPassword('ps1234')
    }
  })

  await prisma.user.create({
    data:{
      name: 'not member',
      email: 'notmember@test.com',
      password: await hashPassword('ps1234')
    }
  })

  const notMember = await app.inject({
    method: 'POST',
    url: '/auth/login',
    body: {email: 'notmember@test.com', password: 'ps1234'}
  })

  notMemberToken = notMember.json().token

  const owner = await app.inject({
    method: 'POST',
    url: '/auth/login',
    body: {email: 'wr-owner@test.com', password: 'ps1234'}
  })

  ownerToken = owner.json().token
  
/*   const member = await app.inject({
    method: 'POST',
    url:'/auth/login',
    body:{email:'wr-member@test.com', password: 'ps1234'}
  })

  memberToken = member.json().token
 */
})

afterAll(async()=>{
  await prisma.task.deleteMany({
    where:{
      title: {in:['tarefa_membro','dev_project','Tarefa 1','Tarefa 2', 'tarefa de membro', 'tarefa de membro actualizado', 'Tarefa proibida','Tarefa apagada']}
    }
  })

  await prisma.workspaceMember.deleteMany({
    where:{
      user:{
        email:{in:['wr-owner@test.com','notmember@test.com','wr-member@test.com']}
      }
    }
  })

  await prisma.workspace.deleteMany({
    where:{
      name: { in : ['workspace_test', 'novo workspace', 'work para editar', 'owner workspace','ultimo workspace', 'workspace2']}
    }
  })

  await prisma.user.deleteMany({
    where:{
      email:{in:['wr-owner@test.com','wr-member@test.com','notmember@test.com']}
    }
  })

  await app.close()
  await prisma.$disconnect()
})

describe('', async () => {
        it('POST membro do workspace consegue criar tarefas', async () => {
        const workspace = await app.inject({
          method: 'POST',
          url:'/workspace',
          headers:{authorization: `Bearer ${ownerToken}`},
          body:{name:'workspace_test', description: 'workspace de teste'}
        })
        
        const workspaceId = workspace.json().workspace.id

        const task = await app.inject({
          method: 'POST',
          url: `/workspace/${workspaceId}/tasks`,
          headers:{authorization: `Bearer ${ownerToken}`},
          body:{title: 'tarefa_membro', description: 'tarefa criada por um membro', status: 'IN_PROGRESS'}
        })
        expect(task.statusCode).toBe(201)
    })

    it('Não membro recebe 403 ao tentar criar tarefa', async () => {

       const workspace = await app.inject({
        method: 'POST',
        url: '/workspace',
        headers:{authorization: `Bearer ${ownerToken}`},
        body: {name: 'novo workspace', description: 'novo workspace'}
      })
      
      const workspaceId = workspace.json().workspace.id

      const task = await app.inject({
        method: 'POST',
        url: `/workspace/${workspaceId}/tasks`,
        headers:{authorization: `Bearer ${notMemberToken}`},
        body: {title: 'dev_project', description: 'projecto para dev', status: 'IN_PROGRESS'}
      })

      expect(task.statusCode).toBe(403)
    })

    it('criador consegue editar sua tarefa', async () => {
      const workspace = await app.inject({
        method: 'POST',
        url: '/workspace',
        headers: {authorization: `Bearer ${ownerToken}`},
        body: {name: 'work para editar', description: 'workspace para editar mesmo'}
      })

      const workspaceId = workspace.json().workspace.id

      const task1 = await app.inject({
        method: 'POST',  
        url: `/workspace/${workspaceId}/tasks`,
        headers: {authorization: `Bearer ${ownerToken}`},
        body: {title: 'Tarefa 1', description: 'Descrição para tarefa 1', status: 'IN_PROGRESS'}
      })

      // console.log(task1.json())
      expect(task1.json().task.title).toBe('Tarefa 1')

      const task2 = await app.inject({
        method: 'PUT',
        url: `/workspace/${workspaceId}/tasks/${task1.json().task.id}`,
        headers: {authorization: `Bearer ${ownerToken}`},
        body: {title: 'Tarefa 2'}
      })

      expect(task2.json().taskUpdated.title).toBe('Tarefa 2')

    })

    it('Owner consegue editar tarefa que não croiou', async () => {
      const workspace = await app.inject({
        method: 'POST',
        url: '/workspace',
        headers: {authorization: `Bearer ${ownerToken}`},
        body: {name: 'workspace2', description: 'Este workspace é apenas de teste'}
      })

      const workspaceId = workspace.json().workspace.id

      const member = await app.inject({
        method: 'POST',
        url: '/auth/login',
        body: {email: 'wr-member@test.com', password: 'ps1234'}
      })
      const memberId = member.json().user.id

      const insertMember = await app.inject({
        method: 'POST',
        url: `workspace/${workspaceId}/members/${memberId}`,
        headers: {authorization: `Bearer ${ownerToken}`}
      })
      
      const memberToken = member.json().token

      const task = await app.inject({
        method: 'POST',
        url: `workspace/${workspaceId}/tasks`,
        headers: {authorization: `Bearer ${memberToken}`},
        body: {title: 'tarefa de membro', description: 'tarefa de membro para testes'}
      })

      expect(task.statusCode).toBe(201)
      expect(task.json().task.title).include('tarefa de membro')


     // expect(task)

     const taskUpdated = await app.inject({
      method: 'PUT',
      url:`workspace/${workspaceId}/tasks/${task.json().task.id}`,
      headers: {authorization: `Bearer ${ownerToken}`},
      body: {title: 'tarefa de membro actualizado'}
     })

      expect(taskUpdated.json().taskUpdated.title).include('tarefa de membro actualizado')
    })

    it('Utilizador sem relação com a tarefa recebe 403 ao editar', async () => {

      const member = await app.inject({
        method: 'POST',
        url: '/auth/login',
        body: {email: 'wr-member@test.com', password: 'ps1234'}
      })

      const memberToken = member.json().token

      const workspace = await app.inject({
        method: 'POST',
        url:'/workspace',
        headers: {authorization: `Bearer ${ownerToken}`},
        body: {name: 'owner workspace'}
      })

      const workspaceId = workspace.json().workspace.id

     // console.log(workspaceId)
      const task = await app.inject({
        method: 'POST',
        url:`/workspace/${workspaceId}/tasks`,
        headers: {authorization: `Bearer ${ownerToken}`},
        body: {title: 'Tarefa proibida'}
      })

      expect(task.json().task.title).include('Tarefa proibida')

      const taskUpdated = await app.inject({
        method: 'PUT',
        url: `/workspace/${workspaceId}/tasks/${task.json().task.id}`,
        headers: {authorization: `Bearer ${memberToken}`},
        body: {title: 'Tarefa não proibida'}
      })

      expect(taskUpdated.statusCode).toBe(403)
    })

    it('delete funciona para o criador e o owner', async()=>{
      const workspace = await app.inject({
        method: 'POST',
        url: '/workspace',
        headers: {authorization: `Bearer ${ownerToken}`},
        body: {name: 'ultimo workspace'}
      })

      const member = await app.inject({
        method: 'POST',
        url: '/auth/login',
        body: {email: 'wr-member@test.com', password: 'ps1234'}
      })

      const memberId = member.json().user.id

      const memberWorskpace = await app.inject({
        method: 'POST',
        url: `/workspace/${workspace.json().workspace.id}/members/${memberId}`,
        headers: {authorization: `Bearer ${ownerToken}`},
      })

      const task = await app.inject({
          method: 'POST',
          url: `/workspace/${workspace.json().workspace.id}/tasks`,
          headers: {authorization: `Bearer ${member.json().token}`},
          body:{title:'Tarefa apagada'}
      })

      expect(task.statusCode).toBe(201)

      const taskApagada = await app.inject({
        method: 'DELETE',
        url: `/workspace/${workspace.json().workspace.id}/tasks/${task.json().task.id}`,
        headers: {authorization: `Bearer ${ownerToken}`}
      })

      expect(taskApagada.statusCode).toBe(200)
    })
})

describe('TaskService.createTask', async () => {
  it('deve ser possível criar tarefa', async ()=>{
    const repo = new InMemoryTaskRepository()
    const taskService = new TaskService(repo)

    repo.addMember({
      id: 'member-1',
      userId: 'userId-1',
      workspaceId: 'workspace-1',
      role: 'MEMBER',
      joinedAt: new Date()
    })

    const task = await taskService.createTask({
      title: 'tarefa teste',
      description: 'Descrição',
      status: 'TODO',
      userId: 'userId-1',
      workspaceId: 'workspace-1'
    })

    expect(task.title).toBe('tarefa teste')
    expect(task.userId).toBe('userId-1')
  })

  it('Não membro não deve ter', async () => {
    const repo = new InMemoryTaskRepository()
    const service = new TaskService(repo)

    await expect(service.createTask({
      title: 'tarefa teste',
      description: 'Descrição teste',
      status: 'TODO',
      userId: 'user-1',
      workspaceId: 'workspace-1'
    })).rejects.toThrow('Este usuário não pertence a este workspace')
  })
})