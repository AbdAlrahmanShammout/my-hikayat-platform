export abstract class BaseEntity {
  id!: number;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date | null;
}

type ScalarKeys<T> = {
  [K in keyof T]-?: T[K] extends Date ? K : T[K] extends object ? never : K;
}[keyof T];

export type OptionalRelations<T> = Pick<T, ScalarKeys<T>> & Partial<Omit<T, ScalarKeys<T>>>;
