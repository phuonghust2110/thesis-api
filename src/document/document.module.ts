import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity } from 'src/entities/document.entity';
import { UsersEntity } from 'src/entities/users.entity';
import { AnswerEntity } from 'src/entities/answer.entity';
import { QuestionEntity } from 'src/entities/question.entity';
import { ChapterEntity } from 'src/entities/chapter.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentEntity,
      UsersEntity,
      AnswerEntity,
      QuestionEntity,
      ChapterEntity,
    ]),
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
