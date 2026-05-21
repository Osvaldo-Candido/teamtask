import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authMiddleware } from "../middleware.js";
import { prisma } from "../prisma-db.js";
import { paramsInsertMemberSchema, paramsSchema, workspaceSchemaCreate, workspaceSchemaUpdate } from "./workspace.schema.js";
import { WorkspaceServices } from "../services/workspaces.js";
import { PrismaWorkspaceRepository } from '../repositories/prisma-workspace.repository.js';
import { PrismaUserRepository } from "../repositories/prisma-user.repository.js";

export async function workspaceRoutes(app: FastifyInstance){
  const repo = new PrismaWorkspaceRepository()
  const userRepo = new PrismaUserRepository()
  const service = new WorkspaceServices(repo, userRepo)

    app.post('/', {
      preHandler: [
        authMiddleware
      ],
      schema: {
        tags:['Workspace'],
        response:{
            201:{
              type: 'object',
              properties: {
                workspace:{
                type: 'object',
                properties:{
                  id: {type: 'string', format: 'uuid'},
                  name: {type: 'string'},
                  description: {type: 'string'},
                }
              },
                member:{
                  type: 'object',
                  properties:{
                  id: {type: 'string', format: 'uuid'},
                  workspaceId: {type: 'string', format: 'uuid'},
                  userId: {type: 'string', format: 'uuid'},
                  
                }
              }
              }
            }
        }
      }}, async (request: FastifyRequest, reply: FastifyReply) => {
        const data = workspaceSchemaCreate.parse(request.body)
        const userId = request.user.id

        const result = await service.createWorkspace(userId, data)
       
        const {workspace, member} = result

          return reply.status(201).send({workspace, member})
      })

      app.put('/:id',{
        preHandler:[authMiddleware],
        schema:{
          tags:['Workspace'],
          response:{
            201:{
              type:'object'
            }
          }
        }
      }, async (request: FastifyRequest, reply: FastifyReply) => {
          const data = workspaceSchemaUpdate.parse(request.body)
          const {id} = paramsSchema.parse(request.params)
          const userId = request.user.id

         const workspaceUpdated = await service.updateWorkspace(id, userId, data)

          return reply.status(200).send({workspaceUpdated})
      })

      app.delete('/:id', {preHandler:[authMiddleware], 
        schema:{
          tags:['Workspace Delete'],
          response:{
            200:{
              type:'object',
              properties:{ 
                message:{type:'string'}
              }
            }
          }
        }},  
        async(request:FastifyRequest, reply:FastifyReply)=>{
          const {id} = paramsSchema.parse(request.params)
          const userId = request.user.id
          
          await service.deleteWorkspace(userId, id)

          return reply.status(200).send({message:'Workspace eliminado com sucesso.'})
      })

      app.get('/:id',{preHandler:[authMiddleware], schema:{}}, 
        async (request: FastifyRequest, reply: FastifyReply) =>{
          const {id} = paramsSchema.parse(request.params)
          const userId = request.user.id
          
          const workspace = await service.findWorkspace(userId, id)

          return reply.status(200).send({workspace})
        })

        app.get('/', {preHandler:[authMiddleware], schema:{
          tags:['Getworkspaces'],
          response:{
            200:{
              type:'array',
              items:{
                type: 'object',
                properties:{
                  id: {type: 'string'},
              name:{type: 'string'},
              description:{type: 'string'}}
              },
              required: ['id','name','description']
            }
          }
        }}, 
          async(request: FastifyRequest, reply: FastifyReply)=>{
              const userId = request.user.id

              const workspaces = await service.getWorkspaces(userId)

              return reply.status(200).send(workspaces)
        })

        //adicionando um member no workspace
        app.post('/:workspaceId/members/:memberId', {
          preHandler: [authMiddleware],
          schema:{
            tags:['Inserir'],
            response:{
              201:{

              }
            }
          }
        }, async (request: FastifyRequest, reply: FastifyReply) => {
          const {workspaceId, memberId} = paramsInsertMemberSchema.parse(request.params)
          const userId = request.user.id

          const createdMember = await service.insertMember(userId, memberId, workspaceId)
          
          return reply.status(201).send({createdMember})

        })
}