export type AssessmentStatus =
  | 'NEW'
  | 'TOKEN_SENT'
  | 'TOKEN_EXPIRED'
  | 'TEST_STARTED'
  | 'TEST_FINISHED'
  | 'AUTO_ASSESSMENT_READY'
  | 'ASSESSMENT_COMPLETED'
  | 'ERROR'
  | 'CANCELED';

export type AssessmentAnswerType =
  | 'CHOICE'
  | 'CODE_GAPS'
  | 'CODE_REVIEW'
  | 'DATABASE'
  | 'DEVOPS'
  | 'ESSAY'
  | 'PROGRAMMING'
  | 'TESTING';
