import { BaseZodSchema, ZodString } from './base.zod';

describe('BaseZodSchema', () => {
  it('describes identity and timestamps for entity construction', () => {
    const inputData = {
      id: 4,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    };
    const actualShape = BaseZodSchema.safeParse(inputData);
    expect(actualShape.success).toBe(true);
  });

  it('can be extended with domain fields without runtime parse in entities', () => {
    const sampleZodSchema = BaseZodSchema.extend({ title: ZodString });
    expect(sampleZodSchema.shape.title).toBe(ZodString);
    expect(sampleZodSchema.shape.id).toBeDefined();
  });
});
