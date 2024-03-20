import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnswerEntity } from 'src/entities/answer.entity';
import { ChapterEntity } from 'src/entities/chapter.entity';
import { QuestionEntity } from 'src/entities/question.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuestionAnswerService {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionRepo: Repository<QuestionEntity>,
    @InjectRepository(AnswerEntity)
    private readonly answerRepo: Repository<AnswerEntity>,
    @InjectRepository(ChapterEntity)
    private readonly chapterRepo: Repository<ChapterEntity>,
  ) {}

  async createQuestionAndAnswer(
    question: string,
    answer: string,
    chapterId: string,
  ) {
    const chapter = await this.chapterRepo.findOne({
      where: { id: chapterId },
    });
    const newQuestion = this.questionRepo.create({
      question,
      chapter,
    });
    const newQuestionSave = await this.questionRepo.save(newQuestion);
    const newAnswer = this.answerRepo.create({
      answer,
      isCorrect: true,
      question: newQuestionSave,
    });

    return await this.answerRepo.save(newAnswer);
  }

  async getQuestion(chapterId: string) {
    return await this.questionRepo.find({
      where: { chapter: { id: chapterId } },
    });
  }

  async getAnswer(questionId: string) {
    try {
      const answer = await this.answerRepo.findOne({
        where: { question: { id: questionId } },
      });
      return answer;
    } catch (error) {
      throw error;
    }
  }
}
