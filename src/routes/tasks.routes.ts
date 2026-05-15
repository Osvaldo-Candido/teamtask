import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify'
import { authMiddleware } from '../middleware.js'
import { statusTaskSchema, taskParamasSchema, taskSchema, updateTaskSchema, workspaceParamasSchema } from './tasks.schema.js'
import { paramsSchema } from './workspace.schema.js'
import { prisma } from '../prisma-db.js'
import { createTask, deleteTask, getTasks, updateStatus, updateTask } from '../services/tasks.js'

export async function taskRoutes(app: FastifyInstance){
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
      const user = request.user

      const task = await createTask({
          title,
          description,
          userId: user.id,
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

        const tasks = await getTasks({workspaceId, userId})

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

          const taskUpdated = await updateTask({
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

          await deleteTask({id, workspaceId, userId})
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

        const updatedStatusTask = await updateStatus({
          status,
          id,
          workspaceId,
          userId
        })
         return reply.status(200).send({updatedStatusTask})

      }
    )
}