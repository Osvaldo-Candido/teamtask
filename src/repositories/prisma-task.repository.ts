import { ForbidenError } from "../errors.js";
import { prisma } from "../prisma-db.js";
import { WorkspaceMember, Task } from "../prisma/client.js";
import { CreateTaskInput } from "../services/tasks.js";
import { ITaskRepository } from "./task.repository.js";

export class PrismaTaskRepository implements ITaskRepository {
  async getTasks(userId: string, workspaceId: string): Promise<Task[]> {
   const workspace = await prisma.workspace.findFirst({
    where:{
      id: workspaceId,
      workspaceMembers:{
        some:{
          userId
        }
      }
    },
    include:{
      tasks: true
    }})

    if(!workspace) return []

    return workspace.tasks
  }

  async findMember(userId: string, workspaceId: string): Promise<WorkspaceMember | null> {
   return await prisma.workspaceMember.findFirst({
    where:{
      workspaceId,
      userId
    }
   })
  }
  async createTask(data: CreateTaskInput): Promise<Task> {
    const task = await prisma.task.create({
      data:{
        title: data.title,
        description: data.description,
        status: data.status ?? 'TODO',
        workspaceId: data.workspaceId,
        userId: data.userId
      }
    })

    return task
  }
  async findTask(taskId: string, workspaceId: string): Promise<Task | null> {
    const task = await prisma.task.findFirst({
      where:{
        id: taskId,
        workspaceId
      }
    })

    return task
  }
  async updateTask(taskId: string, data: Partial<Task>): Promise<Task> {
    const task = await prisma.task.update({
      where:{
        id: taskId
      },
      data:{
        ...data
      }
    })

    return task
  }
  async deleteTask(taskId: string): Promise<void> {
    await prisma.task.delete({
      where: {
        id: taskId
      }
    })
  }

}