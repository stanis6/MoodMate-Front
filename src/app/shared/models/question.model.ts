export interface QuestionDto {
  id: string;
  category: string;
  orderIndex: number;
  prompt: string;
  type: 'EMOJI' | 'YES_NO' | 'TEXT';
  isPrimary: boolean;
  parentQuestionId: string | null;
  condition: 'EMOJI_NEGATIVE' | 'YES_NO_NO' | null;
}
