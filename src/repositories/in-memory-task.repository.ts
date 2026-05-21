import { WorkspaceMember, Task, STATUS } from "../prisma/client.js";
import { CreateTaskInput } from "../services/tasks.js";
import { ITaskRepository } from "./task.repository.js";

export class InMemoryTaskRepository implements ITaskRepository {
  private task: Task [] = []
  private member: WorkspaceMember [] = []
  
  async findMember(userId: string, workspaceId: string): Promise<WorkspaceMember | null> {
    return this.member.find(m => m.userId === userId && m.workspaceId === workspaceId) ?? null
  }

  async createTask(data: CreateTaskInput) {
    const task = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description ?? null,
      status: data.status,
      userId: data.userId,
      workspaceId: data.workspaceId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.task.push(task)
    return task
  }
  async findTask(taskId: string, workspaceId: string): Promise<Task | null> {
    return this.task.find(t => t.id === taskId && t.workspaceId === workspaceId) ?? null
  }
  async updateTask(taskId: string, data: Partial<Task>): Promise<Task> {
    const index = this.task.findIndex(t => t.id === taskId) ?? null

   if(index === -1) return null as any

   this.task[index] = {
    ...this.task[index],
    ...data
   }
    
   return this.task[index]
  }
  async deleteTask(taskId: string): Promise<void> {
   this.task = this.task.filter(t => t.id !== taskId) ?? null
  }

  addMember(member: WorkspaceMember){
    this.member.push(member)
  }

  async getTasks (workaspaceId: string, userId: string) {
    const member = this.member.find(m => m.workspaceId === workaspaceId && m.userId === userId)

    if(!member) return []

    return this.task.filter(t => t.workspaceId === workaspaceId)


  }

}