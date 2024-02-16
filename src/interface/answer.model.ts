import { QuestionEntity } from 'src/entities/question.entity';

export interface IAnswer {
  answer: string;
  isCorrect: boolean;
  question: QuestionEntity;
}
