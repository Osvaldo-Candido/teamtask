import { prisma } from "../prisma-db.js";
import { Workspace, WorkspaceMember } from "../prisma/client.js";
import { CreateWorkspace, WorkspaceCreateResponse } from "../services/workspaces.js";
import { IWorkspaceRepository } from "./workspace.repository.js";

export class PrismaWorkspaceRepository implements IWorkspaceRepository {
  async findMember(userId: string, workspaceId: string): Promise<WorkspaceMember | null> {
    return await prisma.workspaceMember.findFirst({
      where:{
        workspaceId,
        userId
      }
    }) 
  }
  async insertMember(idMember: string, workspaceId:string): Promise<WorkspaceMember> {
    const member = await prisma.workspaceMember.create({
      data:{
        userId: idMember,
        role: 'MEMBER',
        workspaceId
      }
    })

    return member
  }
  async createWorkspace(userId:string, data: CreateWorkspace): Promise<WorkspaceCreateResponse> {
    return await prisma.$transaction(async (tx) => {
        const workspace = await tx.workspace.create({
          data:{
            name: data.name,
            description: data.description,
          }
        })

        const member = await tx.workspaceMember.create({
          data:{
            workspaceId: workspace.id,
            userId: userId,
            role: 'OWNER' 
          }
        })

        return  {workspace, member}
    }) 
  }

  async updateWorkspace(workspaceId: string, data: Partial<Workspace>): Promise<Workspace> {
    const workspaceUpdated = await prisma.workspace.update({
      data:{
        name: data.name,
        description: data.description
      },
      where:{
        id: workspaceId,
      }
    })
    return workspaceUpdated 
    }
  async deleteWorkspace(workspaceId: string): Promise<void> {
    await prisma.workspaceMember.deleteMany({
      where:{
        workspaceId
      }
    })
    await prisma.workspace.delete({
      where:{
        id:workspaceId
      }
    }) 
  }
  async findWorkspace(workspaceId: string): Promise<Workspace | null> {
    const workspace = await prisma.workspace.findFirst({
      where:{
          id: workspaceId
      }
    })

    return workspace
  }
  async getWorkspace(userId: string): Promise<Workspace[] | null> {
    return await prisma.workspace.findMany({
        where:{
          workspaceMembers:{
            some:{
              userId
            }
          }
        }
    })
  }

} 