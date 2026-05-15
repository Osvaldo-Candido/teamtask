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
  id: z.string().uuid(),
  memberId: z.string().uuid(),
  workspaceId: z.string().uuid()
})

export const paramsInsertMemberSchema = z.object({
  workspaceId: z.string().uuid(),
  memberId: z.string().uuid()

})

