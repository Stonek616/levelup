export type ReportTargetType = 'REVIEW' | 'COMMENT' | 'USER';

export type ReportReason =
  | 'SPAM'
  | 'INAPPROPRIATE_CONTENT'
  | 'HARASSMENT'
  | 'HATE_SPEECH'
  | 'OTHER';

export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

export interface CreateReportRequest {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
}

export interface ReportItem {
  id: string;
  reporterUsername: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  status: ReportStatus;
  notes: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface UpdateReportRequest {
  status: 'RESOLVED' | 'DISMISSED';
  notes?: string;
  deleteContent?: boolean;
}
