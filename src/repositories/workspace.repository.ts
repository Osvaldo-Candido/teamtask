import { Workspace, WorkspaceMember } from "../prisma/client.js";
import { CreateWorkspace, WorkspaceCreateResponse } from "../services/workspaces.js";

export interface IWorkspaceRepository {
  createWorkspace(userId:string, data: CreateWorkspace):Promise<WorkspaceCreateResponse>
  updateWorkspace(workspaceId:string, data: Partial<Workspace>):Promise<Workspace>
  deleteWorkspace(workspaceId:string):Promise<void>
  findWorkspace(workspaceId:string):Promise<Workspace | null>
  getWorkspace(userId:string):Promise<Workspace[] | null>
  insertMember(emberId:string, workspaceId:string):Promise<WorkspaceMember>
  findMember(userId: string, workspaceId: string): Promise<WorkspaceMember | null>
}