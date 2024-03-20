import { Body, Controller, Inject, Post, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QuestionAnswerService } from './question-answer.service';
import {
  GetAnswerDto,
  GetQuestionDto,
  QuestionAndAnswerDto,
} from 'src/dtos/question-answer.dto';

@ApiTags('question-answer')
@Controller('api/v1/question-answer')
export class QuestionAnswerController {
  constructor(
    @Inject(QuestionAnswerService)
    private questionAnswerService: QuestionAnswerService,
  ) {}
  @Post('create-question-answer')
  createQuestionAndAnswer(
    @Body() { question, answer, chapterId }: QuestionAndAnswerDto,
  ) {
    return this.questionAnswerService.createQuestionAndAnswer(
      question,
      answer,
      chapterId,
    );
  }

  @Get('get-question')
  getQuestion(@Query() { chapterId }: GetQuestionDto) {
    return this.questionAnswerService.getQuestion(chapterId);
  }

  @Get('get-answer')
  getAnswer(@Query() { questionId }: GetAnswerDto) {
    return this.questionAnswerService.getAnswer(questionId);
  }
}
