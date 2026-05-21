import { ConflictError, ForbidenError, NotFoundError } from "../errors.js";
import { Workspace } from "../prisma/client.js";
import { ROLE } from "../prisma/enums.js";
import { ITaskRepository } from "../repositories/task.repository.js";
import { IUser } from "../repositories/user.repository.js";
import { IWorkspaceRepository } from "../repositories/workspace.repository.js";

export interface CreateWorkspace {
  name: string
  description?: string
}

export interface MemberResponse {
    id: string;
    role: ROLE;
    joinedAt: Date;
    workspaceId: string;
    userId: string;
}

export interface WorkspaceResponse {
    name: string;
    id: string;
    description: string | null;
    createdAt: Date;
}

export interface WorkspaceCreateResponse {
  workspace: WorkspaceResponse
  member:MemberResponse
} 

export class WorkspaceServices {
  constructor(private repo: IWorkspaceRepository, private userRepo:IUser){
  }

  async createWorkspace(userId: string, data:CreateWorkspace){

      const workspace = await this.repo.createWorkspace(userId, data)

      return workspace
  }

  async updateWorkspace(workspaceId:string, userId:string, data: Partial<Workspace>){

    const member = await this.repo.findMember(userId, workspaceId)

    if(!member){
      throw new ForbidenError('Sem permissão para editar workspace')
    }

    const isTheOwner = member.role === 'OWNER'

    if(!isTheOwner){
      throw new ForbidenError('Sem permissão para editar workspace')
    }

    const workspaceUpdated = await this.repo.updateWorkspace(workspaceId, data)

    return workspaceUpdated
  }

  async deleteWorkspace(userId:string, workspaceId:string){
    const member = await this.repo.findMember(userId, workspaceId)

    if(!member){
      throw new ForbidenError('Sem permissão para apagar workspace')
    }

    const isTheOwner = member.role === 'OWNER'

    if(!isTheOwner){
      throw new ForbidenError('Sem permissão para apagar workspace')
    }
    return await this.repo.deleteWorkspace(workspaceId)
  }

  async findWorkspace(userId:string, workspaceId:string){
    const member = await this.repo.findMember(userId, workspaceId)

    if(!member){
      throw new ForbidenError('Sem prmissão para ver este workspace')
    }

    return await this.repo.findWorkspace(workspaceId)
  }

  async getWorkspaces(userId:string){
    return await this.repo.getWorkspace(userId)
  }

  async insertMember(userId:string, memberId:string, workspaceId:string){

    const member = await this.repo.findMember(userId, workspaceId)
    const isTheOwner = member?.role === 'OWNER'
    
    if(!isTheOwner){
      throw new ForbidenError('Sem permissão para inserir membros ao workspace.')
    }

    const isThisMemberUser = await this.userRepo.findUserById(memberId)

    if(!isThisMemberUser){
      throw new NotFoundError('Membro não encontrado.')
    }

    const isThisMemberExists = await this.repo.findMember(memberId, workspaceId)

    if(isThisMemberExists){
      throw new ConflictError('Este membro já pertence ao workspace.')
    }

    return await this.repo.insertMember(memberId, workspaceId)

  }

}