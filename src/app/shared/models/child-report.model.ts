import { AnswerReportDto } from './answer-report.model';

export interface ChildReportDto {
  childId: string;
  childName: string;
  date: string;
  answers: AnswerReportDto[];
  score: number;
}
