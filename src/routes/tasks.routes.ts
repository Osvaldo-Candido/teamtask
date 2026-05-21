import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify'
import { authMiddleware } from '../middleware.js'
import { statusTaskSchema, taskParamasSchema, taskSchema, updateTaskSchema, workspaceParamasSchema } from './tasks.schema.js'
import { PrismaTaskRepository } from '../repositories/prisma-task.repository.js'
import { TaskService } from '../services/tasks.js'

export async function taskRoutes(app: FastifyInstance){
  const repo = new PrismaTaskRepository()
  const service = new TaskService(repo)
    app.post('/tasks', 
      {preHandler:[authMiddleware],
      schema:{
        tags:['Create Task'],
        body:{
          type:'object',
          required: ['title'],
          properties: {
            title:{type:'string'}
          }
        },
        response:{
          201:{
            task:{
              type:'object', 
              properties:{
                id: {type: 'string'},
                title: {type:'string'},
                description:{type:'string'},
                status:{type:'string'},
                userId: {type:'string', format:'uuid'},
                workspaceId: {type:'string', format:'uuid'}     
            }
            }
          }
        }
      }
    },async (request:FastifyRequest, reply: FastifyReply) => {
      const {title, description, status} = taskSchema.parse(request.body)
      const {workspaceId} = workspaceParamasSchema.parse(request.params)
      const userId = request.user.id

      const task = await service.createTask({
          title,
          description,
          userId,
          workspaceId: workspaceId,
          status
        })

        return reply.status(201).send({task})
    })

    app.get('/tasks',
      {
        preHandler:[authMiddleware],
        schema:{
          tags:['Listar Tarefas'],
          response:{

          }
        }
      },
      async (request: FastifyRequest, reply: FastifyReply) => {
        const {workspaceId} = taskParamasSchema.parse(request.params)
        const userId = request.user.id

        const tasks = await service.getTasks(workspaceId, userId)

        return reply.status(200).send({tasks})
      }
    )

    app.put('/tasks/:id',
      {
        preHandler:[authMiddleware],
        schema:{
          tags:['Editar Tarefa'],
          response:{
            200:{

            }
          }
        }
      },
      async (request: FastifyRequest, reply: FastifyReply) => {
        const {title, description, status} = updateTaskSchema.parse(request.body)
        const {workspaceId, id} = taskParamasSchema.parse(request.params)
        const userId = request.user.id

          const taskUpdated = await service.updateTask({
                title,
                description,
                status,
                id,
                workspaceId,
                userId
          })

          return reply.status(200).send({taskUpdated})

       }
    )

    app.delete('/tasks/:id',
      {
        preHandler:[authMiddleware],
        schema:{
          tags:['Apagar Tarefa'],
          response:{
            200:{

            }
          }
        }
      },
      async (request: FastifyRequest, reply: FastifyReply) => {
        const {workspaceId,id} = taskParamasSchema.parse(request.params)
        const userId = request.user.id

          await service.deleteTask({id, workspaceId, userId})
          return reply.status(200).send({message: 'Tarefa deletada com sucesso'})       
      }
    )

    app.patch('/tasks/:id',
      {
        preHandler:[authMiddleware],
        schema:{
          tags:['Editar Status'],
          response:{
            200:{

            }
          }
        }
      },
      async (request: FastifyRequest, reply: FastifyReply) => {
        const {status} = statusTaskSchema.parse(request.body)
        const {workspaceId,id} = taskParamasSchema.parse(request.params)
        const userId = request.user.id

        const updatedStatusTask = await service.updateStatus({
          status,
          id,
          workspaceId,
          userId
        })
         return reply.status(200).send({updatedStatusTask})

      }
    )
}