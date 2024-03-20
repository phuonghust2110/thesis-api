import { ApiProperty } from '@nestjs/swagger';

export class QuestionAndAnswerDto {
  @ApiProperty()
  question: string;
  @ApiProperty()
  answer: string;
  @ApiProperty()
  chapterId: string;
}

export class GetQuestionDto {
  @ApiProperty()
  chapterId: string;
}

export class GetAnswerDto {
  @ApiProperty()
  questionId: string;
}
