import { BaseEntity, type OptionalRelations } from './base.entity';

class SampleEntity extends BaseEntity {
  title!: string;

  constructor(data: { id: number; createdAt: Date; updatedAt: Date; title: string }) {
    super();
    Object.assign(this, data);
  }
}

describe('BaseEntity', () => {
  it('exposes identity and timestamps without an HTTP status', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const actualEntity = new SampleEntity({
      id: 7,
      createdAt,
      updatedAt,
      title: 'Sample',
    });
    expect(actualEntity.id).toBe(7);
    expect(actualEntity.createdAt).toBe(createdAt);
    expect(actualEntity.updatedAt).toBe(updatedAt);
    expect(actualEntity.deletedAt).toBeUndefined();
    expect(actualEntity).not.toHaveProperty('statusCode');
  });
});

describe('OptionalRelations', () => {
  type SamplePayload = {
    id: number;
    createdAt: Date;
    title: string;
    owner: { id: number };
    tags: string[];
  };

  it('keeps scalars and dates required while making objects and arrays optional', () => {
    const actualPayload: OptionalRelations<SamplePayload> = {
      id: 1,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      title: 'Sample',
    };
    expect(actualPayload.id).toBe(1);
    expect(actualPayload.title).toBe('Sample');
    expect(actualPayload.owner).toBeUndefined();
    expect(actualPayload.tags).toBeUndefined();
  });
});
