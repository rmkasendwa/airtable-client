import { PaginationParams } from './Utils';

export type CandidateStatus =
  | 'IN_EVALUATION'
  | 'WAITING_FOR_DECISION'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELED'
  | 'ERROR';

export type FindAllCandidatesSearchParams = {
  status?: CandidateStatus[];
} & PaginationParams;
