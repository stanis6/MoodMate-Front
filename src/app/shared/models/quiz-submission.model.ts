import { AnswerDto } from './answer.model';

export interface QuizSubmissionDto {
  childId: string;
  quizDate: string;          // in 'YYYY-MM-DD' format
  answers: AnswerDto[];
}
