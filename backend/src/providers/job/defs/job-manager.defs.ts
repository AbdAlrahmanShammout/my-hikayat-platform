export type EnqueueJobInput = {
  readonly name: string;
  readonly payload: Readonly<Record<string, unknown>>;
};

export type EnqueueJobResult = {
  readonly jobId: string;
  readonly name: string;
};

export type HandleJobInput = {
  readonly name: string;
  readonly payload: Readonly<Record<string, unknown>>;
};
