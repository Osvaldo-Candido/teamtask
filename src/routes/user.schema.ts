import z from "zod";

export const registerUserSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string().min(4, 'Minímo 4 caracteres para a palavra passe.')
})