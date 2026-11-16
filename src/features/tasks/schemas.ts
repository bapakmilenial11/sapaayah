import { z } from 'zod';

export const taskPriorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);
export type TaskPriority = z.infer<typeof taskPriorityEnum>;

export const taskStatusEnum = z.enum(['todo', 'in_progress', 'completed', 'cancelled']);
export type TaskStatus = z.infer<typeof taskStatusEnum>;

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: 'Judul tugas minimal 3 karakter.' })
    .max(255, { message: 'Judul tugas maksimal 255 karakter.' }),
  description: z.string().trim().max(2000).optional().nullable(),
  priority: taskPriorityEnum.default('medium'),
  due_at: z.string().datetime({ message: 'Format tenggat waktu tidak valid (ISO 8601).' }).optional().nullable().or(z.literal('')),
  assignee_ids: z.array(z.string().uuid({ message: 'ID personel tidak valid.' })).optional().default([]),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskStatusSchema = z.object({
  task_id: z.string().uuid({ message: 'ID tugas tidak valid.' }),
  status: taskStatusEnum,
  progress_percent: z.coerce.number().int().min(0).max(100).optional(),
  notes: z.string().trim().min(3, { message: 'Catatan progres minimal 3 karakter.' }).max(1000),
});

export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;

