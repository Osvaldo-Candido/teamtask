import { ForbidenError, NotFoundError } from "../errors.js";
import { prisma } from "../prisma-db.js";
import { STATUS } from "../prisma/enums.js";

export interface CreateTask {
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

export async function createTask({title, description, status, userId, workspaceId}:CreateTask){
    const member = await prisma.workspaceMember.findFirst({
      where:{
        userId,
        workspaceId
      }
    })

    if(!member){
      throw new ForbidenError('Não és membro deste workspace')
    }

    const task = await prisma.task.create({
      data:{
        title,
        description,
        userId,
        workspaceId,
        status
      }
    })

    return task

}

export async function updateTask({title, description, status, id ,workspaceId, userId}:UpdateTask){
  
  const task = await prisma.task.findFirst({
      where:{
        id,
        workspaceId
      }
  })

  if(!task){
      throw new NotFoundError()
  }

  await verifyTaskPermission(task.userId, userId, workspaceId)

  const taskUpdated = await prisma.task.update({
    data:{
      title: title ?? task?.title,
      description: description ?? task?.description
    },
    where:{
      id
    }
  })

  return taskUpdated
}

export async function updateStatus({status, id, workspaceId, userId}:UpdateStatus){
    const task = await prisma.task.findFirst({
      where:{
        id,
        workspaceId
      }
    })

    if(!task){
      throw new NotFoundError()
    }
     await verifyTaskPermission(task.userId, userId, workspaceId)

    const statusUpdated = await prisma.task.update({
      where:{
        id
      },
      data:{
        status
      }
    })

    return statusUpdated
}

export async function deleteTask({id, workspaceId, userId}:DeleteTask){
  const task = await prisma.task.findFirst({
    where:{
      id,
      workspaceId
    }
  })

    if(!task){
      throw new NotFoundError()
    }

  await verifyTaskPermission(task.userId, userId, workspaceId)

  return await prisma.task.delete({
    where:{
      id
    }
  })
}

async function verifyTaskPermission(taskUserId: string, userId: string, workspaceId: string){
  const isTheCreator = taskUserId === userId

  const isOwner = await prisma.workspaceMember.findFirst({
    where:{
      userId,
      workspaceId,
      role: 'OWNER'
    }
  })

  if(!isTheCreator && !isOwner){
    throw new ForbidenError() 
  }
}

export async function getTasks({workspaceId, userId}:GetTasks){
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
    }
  })

  if(!workspace){
     throw new ForbidenError('Não és membro deste workspace')
  }

  return workspace.tasks
}