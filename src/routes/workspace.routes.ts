import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authMiddleware } from "../middleware.js";
import { prisma } from "../prisma-db.js";
import { paramsSchema, workspaceSchemaCreate, workspaceSchemaUpdate } from "./workspace.schema.js";
import { requireRole } from "../auth.js";
export async function workspaceRoutes(app: FastifyInstance){
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
        const user = request.user


        const result = await prisma.$transaction(async (tx) => {
            const workspace = await tx.workspace.create({
                data:{
                  name: data.name,
                  description: data.description  
                }
            })

            const member = await tx.workspaceMember.create({
              data:{
                userId: user.id,
                workspaceId: workspace.id,
                role: 'OWNER'
              }
            })

            return {workspace, member}
          })
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
          const user = request.user

          const member = await prisma.workspaceMember.findFirst({
            where:{
              userId: user.id,
              workspaceId: id,
              role: 'OWNER'
            },include:{
              workspace: true
            }
          })

          if(!member){
            return reply.status(403).send({message: 'Apenas o owner pode editar o workspace'})
          }

          const workspaceUpdated = await prisma.workspace.update({
            where:{
              id
            },
            data:{
              name: data.name || member.workspace?.name,
              description: data.description || member.workspace?.description
            }
          })

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
          const user = request.user

          const member = await prisma.workspaceMember.findFirst({
            where:{
              workspaceId: id,
              userId: user.id,
              role: 'OWNER'
            }
          })

          if(!member){
            return reply.status(403).send({message:'Apenas Owner pode eliminar workspace.'})
          }

          await prisma.workspaceMember.deleteMany({where:{
            id: member.id,
            workspaceId: id,
            userId: user.id
          }})

          await prisma.workspace.delete({
            where:{
              id
            }
          })

          return reply.status(200).send({message:'Workspace eliminado com sucesso.'})
      })

      app.get('/:id',{preHandler:[authMiddleware], schema:{}}, 
        async (request: FastifyRequest, reply: FastifyReply) =>{
          const {id} = paramsSchema.parse(request.params)
          const user = request.user

          const member = await prisma.workspaceMember.findFirst({
            where:{
              workspaceId: id,
              userId: user.id,
            }
          })

          if(!member){
            return reply.status(404).send({message: 'Workspace não encontrado'})
          }

          const workspace = await prisma.workspace.findFirst({
            where:{
              id
            }
          })

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
              const user = request.user

              const member = await prisma.workspaceMember.findMany({
                where:{
                  userId: user.id,
                },
                include:{
                  workspace: true
                }
              })

              if(!member){
                return reply.status(404).send({message:'Nenhum workspace encontrado.'})
              }
              const workspaces = member.map(m=>m.workspace)
             // console.log(workspaces)

              return reply.status(200).send(workspaces)
        })
}