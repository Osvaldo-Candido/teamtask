import z from "zod";

export const workspaceSchemaCreate = z.object({
  name: z.string('Campo nome é obrigatório'),
  description: z.string().optional(),
})

export const workspaceSchemaUpdate = z.object({
  name: z.string('Campo nome é obrigatório').optional(),
  description: z.string().optional(),
})

export const paramsSchema = z.object({
  id: z.string().uuid()
})
