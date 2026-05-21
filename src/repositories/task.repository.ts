import { Task, WorkspaceMember } from "../prisma/client.js";
import { CreateTaskInput } from "../services/tasks.js";

export interface ITaskRepository {
  findMember(userId: string, workspaceId: string):Promise<WorkspaceMember | null>
  createTask(data: CreateTaskInput):Promise<Task>
  findTask(taskId:string, workspaceId:string):Promise<Task | null>
  updateTask(taskId:string, data: Partial<Task> ):Promise<Task>
  deleteTask(taskId: string):Promise<void>
  getTasks(userId:string, workspaceId:string):Promise<Task[]>
}
