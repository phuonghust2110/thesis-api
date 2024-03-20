import { Module } from '@nestjs/common';
import { QuestionAnswerController } from './question-answer.controller';
import { QuestionAnswerService } from './question-answer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionEntity } from 'src/entities/question.entity';
import { AnswerEntity } from 'src/entities/answer.entity';
import { ChapterEntity } from 'src/entities/chapter.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuestionEntity, AnswerEntity, ChapterEntity]),
  ],
  controllers: [QuestionAnswerController],
  providers: [QuestionAnswerService],
})
export class QuestionAnswerModule {}
