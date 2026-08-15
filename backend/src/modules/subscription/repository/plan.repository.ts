import { TransactionContext } from '@/common/base/transaction-context';
import {
  CreatePlanRepoInput,
  ListPlansRepoInput,
  PlanPage,
} from '@/modules/subscription/defs/plan-repository.defs';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { PlanKind } from '@/modules/subscription/enum/general.enum';

export abstract class PlanRepository {
  abstract create(input: CreatePlanRepoInput, context?: TransactionContext): Promise<PlanEntity>;
  abstract findById(id: number): Promise<PlanEntity | null>;
  abstract findBySlug(slug: string): Promise<PlanEntity | null>;
  abstract findByKind(kind: PlanKind): Promise<PlanEntity | null>;
  abstract list(input: ListPlansRepoInput): Promise<PlanPage>;
}
