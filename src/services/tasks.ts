import { ForbidenError, NotFoundError } from "../errors.js";
import { prisma } from "../prisma-db.js";
import { Task } from "../prisma/client.js";
import { STATUS } from "../prisma/enums.js";
import { ITaskRepository } from "../repositories/task.repository.js";

export interface CreateTaskInput {
  title: string,
  description?: string, 
  status: STATUS, 
  userId: string, 
  workspaceId: string
}

export interface UpdateTask {
  title?: string,
  description?: string, 
  status?: STATUS, 
  id: string,
  userId: string, 
  workspaceId: string
}

export interface UpdateStatus {
  status: STATUS, 
  id: string, 
  workspaceId: string, 
  userId: string
}

export interface DeleteTask {
  id: string, 
  workspaceId: string, 
  userId: string
}

export interface GetTasks {
  workspaceId: string
  userId: string
}

export class TaskService {
  constructor(private repo:ITaskRepository){}

   async createTask (data: CreateTaskInput) {

      const member = await this.repo.findMember(data.userId, data.workspaceId)

      if(!member){
        throw new ForbidenError('Este usuário não pertence a este workspace')
      }
      
      const task = await this.repo.createTask({
        title: data.title,
        description: data.description,
        status: data.status,
        workspaceId: data.workspaceId,
        userId: data.userId
      })

      return task
   }

   async updateTask (data: UpdateTask) {
    const task = await this.repo.findTask(data.id, data.workspaceId)

    if(!task){
      throw new NotFoundError('Tarefa não encontrada!')
    }

    const isTheCreator = data.userId === task.userId
    const membro = await this.repo.findMember(data.userId, task.workspaceId)
    const isTheOwner = membro?.role === 'OWNER'

    if(!isTheCreator && !isTheOwner){
      throw new ForbidenError('Sem permissão para editar esta tarefa')
    }

    const taskUpdate = await this.repo.updateTask(data.id, data)

    return taskUpdate

   } 
   async deleteTask (data: DeleteTask) {
    const task = await this.repo.findTask(data.id, data.workspaceId)

    if(!task){
      throw new NotFoundError('Tarefa não encontrada!')
    }

    const isTheCreator = data.userId === task.userId
    const membro = await this.repo.findMember(data.userId, task.workspaceId)
    const isTheOwner = membro?.role === 'OWNER'

    if(!isTheCreator && !isTheOwner){
      throw new ForbidenError('Sem permissão para editar esta tarefa')
    }

    return await this.repo.deleteTask(data.id)

   } 
   async updateStatus (data:UpdateStatus) {
     const task = await this.repo.findTask(data.id, data.workspaceId)

    if(!task){
      throw new NotFoundError('Tarefa não encontrada!')
    }

    const isTheCreator = data.userId === task.userId
    const membro = await this.repo.findMember(data.userId, task.workspaceId)
    const isTheOwner = membro?.role === 'OWNER'

    if(!isTheCreator && !isTheOwner){
      throw new ForbidenError('Sem permissão para editar esta tarefa')
    }

    const statusUpdated = await this.repo.updateTask(data.id, data)

    return task
   } 
   async getTasks (workspaceId:string, userId:string) {
      return this.repo.getTasks(workspaceId, userId)
   }
}