import z from "zod";

export const loginSchema = z.object({
  email: z.string().email('Email inserido é inválido'),
  password: z.string().min(1, 'Palavra passe é obrigatório')
})