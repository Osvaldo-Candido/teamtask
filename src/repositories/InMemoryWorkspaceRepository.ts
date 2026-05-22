import { ROLE, User, Workspace, WorkspaceMember } from "../prisma/client.js";
import { CreateWorkspace, WorkspaceCreateResponse } from "../services/workspaces.js";
import { IWorkspaceRepository } from "./workspace.repository.js";

export class InMemoryWorkspaceRepository implements IWorkspaceRepository {
  private workspace: Workspace [] = []
  private workspaceMember: WorkspaceMember [] = []
  private user: User [] = []

  async createWorkspace(userId: string, data: CreateWorkspace): Promise<WorkspaceCreateResponse> {
    const workspace = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description ?? null,
      createdAt: new Date()
    }
    
    const member = {
      id: crypto.randomUUID(),
      workspaceId: workspace.id,
      userId,
      role: 'OWNER' as ROLE,
      joinedAt: new Date()
    }

    this.workspace.push(workspace)
    this.workspaceMember.push(member)

    return {workspace, member}
  }
  async updateWorkspace(workspaceId: string, data: Partial<Workspace>): Promise<Workspace | null> {
    const index = this.workspace.findIndex(w => w.id === workspaceId)
    
    if(index === -1) return null as any

    this.workspace[index] = {
      ...this.workspace[index],
      ...data,
    }

    return this.workspace[index]
  }
  async deleteWorkspace(workspaceId: string): Promise<void> {
    this.workspaceMember = this.workspaceMember.filter(m => m.workspaceId !== workspaceId)
    this.workspace = this.workspace.filter(w => w.id !== workspaceId)
  }
  async findWorkspace(workspaceId: string): Promise<Workspace | null> {
    return this.workspace.find(w => w.id === workspaceId) ?? null
  }
  async findMember(userId: string, workspaceId: string): Promise<WorkspaceMember | null> {
    return this.workspaceMember.find(m => m.userId === userId && m.workspaceId === workspaceId) ?? null
  }
  async addMember(member:WorkspaceMember){
    this.workspaceMember.push(member)
  }
  async addUser(user:User){
    this.user.push(user)
  }
  async insertMember(memberId: string, workspaceId: string): Promise<WorkspaceMember> {
    const member = {
      id: crypto.randomUUID(),
      userId: memberId,
      workspaceId,
      role: 'MEMBER' as ROLE,
      joinedAt: new Date()
    }

    this.workspaceMember.push(member)
    return member
  }
  async getWorkspace(userId: string): Promise<Workspace[] | null> {
    const memberWorkspaceIds  = this.workspaceMember.filter(m => m.userId === userId).map(m => m.workspaceId)

    return this.workspace.filter(w => memberWorkspaceIds.includes(w.id))
  }



}