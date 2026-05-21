import z from "zod";

export const taskSchema = z.object({
  title: z.string('O campo título é obrigatório'),
  description: z.string().optional(),
  status: z.enum(['TODO','IN_PROGRESS','DONE']).default('TODO')
})


export const updateTaskSchema = z.object({
  title: z.string('O campo título é obrigatório').optional(),
  description: z.string().optional(),
  status: z.enum(['TODO','IN_PROGRESS','DONE']).default('IN_PROGRESS')
})

export const statusTaskSchema = z.object({
  status: z.enum(['TODO','IN_PROGRESS','DONE'])
})

export const taskParamasSchema = z.object({
  workspaceId: z.string().uuid(),
  id: z.string().uuid()
}) 

export const workspaceParamasSchema = z.object({
  workspaceId: z.string().uuid(),
}) 