import { z } from 'zod';

export const ZodString = z.string();
export const ZodStringNullable = z.string().nullable();
export const ZodNumber = z.number();
export const ZodNumberNullable = z.number().nullable();
export const ZodBoolean = z.boolean();
export const ZodBooleanNullable = z.boolean().nullable();
export const ZodDate = z.date();
export const ZodDateNullable = z.date().nullable();
export const ZodJson = z.unknown();
export const ZodJsonNullable = z.unknown().nullable();

export const BaseZodSchema = z.object({
  id: ZodNumber,
  createdAt: ZodDate,
  updatedAt: ZodDate,
  deletedAt: ZodDateNullable.optional(),
});
