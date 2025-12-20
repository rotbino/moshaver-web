import { z } from "zod"

export const createTodoSchema = z.object({
  todo: z.string().min(1, "Task title is required").max(200, "Task title must be less than 200 characters").trim(),
  completed: z.boolean().default(false),
})

export const updateTodoSchema = z.object({
  todo: z
    .string()
    .min(1, "Task title is required")
    .max(200, "Task title must be less than 200 characters")
    .trim()
    .optional(),
  completed: z.boolean().optional(),
})

export type CreateTodoFormData = z.infer<typeof createTodoSchema>
export type UpdateTodoFormData = z.infer<typeof updateTodoSchema>
