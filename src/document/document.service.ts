import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentEntity } from 'src/entities/document.entity';
import { UsersEntity } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
const apiKey = require('../../apiKey.json');
const SCOPE = ['https://www.googleapis.com/auth/drive'];
import { google } from 'googleapis';
import * as fs from 'fs';
import * as xlsx from 'xlsx';
import { IQuestionAndAnwser } from 'src/interface/question.answer.interface';
import { QuestionEntity } from 'src/entities/question.entity';
import { AnswerEntity } from 'src/entities/answer.entity';
import { IAnswer } from 'src/interface/answer.model';
const excelToJson = require('convert-excel-to-json');
const auth = new google.auth.JWT(
  apiKey.client_email,
  null,
  apiKey.private_key,
  SCOPE,
);

const drive = google.drive({ version: 'v3', auth });

@Injectable()
export class DocumentService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(DocumentEntity)
    private documentRepo: Repository<DocumentEntity>,
    @InjectRepository(UsersEntity) private userRepo: Repository<UsersEntity>,
    @InjectRepository(QuestionEntity)
    private questionRepo: Repository<QuestionEntity>,
    @InjectRepository(AnswerEntity)
    private answerRepo: Repository<AnswerEntity>,
  ) {}

  async setPublicFile(fileId: string) {
    try {
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  async getUrlFile(fileId: string) {
    try {
      return await drive.files.get({
        fileId,
        fields: 'webViewLink, webContentLink',
      });
    } catch (e) {
      console.log(e);
    }
  }

  async uploadDocument(
    file,
    title: string,
    description: string,
    chapterId: string,
  ) {
    try {
      const chapter = await this.userRepo.findOne({ where: { id: chapterId } });
      const folderFaqId = this.configService.get('FOLDER_FAQ_ID');
      const folderDocumentId = this.configService.get('FOLDER_DOCUMENT_ID');
      console.log(file);
      if (file.originalname.split('.')[1] === 'pdf') {
        const createFile = await drive.files.create({
          requestBody: {
            name: file.originalname,
            mimeType: file.mimetype,
            parents: [folderDocumentId],
          },
          media: {
            mimeType: file.mimetype,
            body: fs.createReadStream(file.path),
          },
        });
        const fileId = createFile.data.id;
        await this.setPublicFile(fileId);
        const getUrl = await this.getUrlFile(fileId);
        return await this.documentRepo.save({
          fileId,
          title,
          description,
          fileName: file.originalname,
          urlFile: getUrl.data.webViewLink,
          chapter: chapter,
        });
      } else {
        const result = excelToJson({
          sourceFile: file.path,
          columnToKey: {
            A: 'question',
            B: 'A',
            C: 'B',
            D: 'C',
            E: 'D',
            F: 'correct',
          },
          header: {
            // Is the number of rows that will be skipped and will not be present at our result object. Counting from top to bottom
            rows: 1, // 2, 3, 4, etc.
          },
          sheets: ['Trang_tính1'],
        });
        this.saveQuestionAndAnswer(result['Trang_tính1']);

        const createFile = await drive.files.create({
          requestBody: {
            name: file.originalname,
            mimeType: file.mimetype,
            parents: [folderFaqId],
          },
          media: {
            mimeType: file.mimetype,
            body: fs.createReadStream(file.path),
          },
        });
        const fileId = createFile.data.id;
        await this.setPublicFile(fileId);
        const getUrl = await this.getUrlFile(fileId);
        return await this.documentRepo.save({
          fileId,
          title,
          description,
          size: file.size,
          fileName: file.originalname,
          urlFile: getUrl.data.webViewLink,
          chapter: chapter,
        });
      }
    } catch (e) {
      throw e;
    }
  }

  async getDocument(userId: string) {
    const document = await this.documentRepo
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.user', 'user')
      .where('user.id = :userId', { userId })
      .select([
        'document.id',
        'document.urlFile',
        'document.fileName',
        'document.title',
        'document.description',
        'document.createdAt',
      ])
      .getMany();
    // console.log(document);
    return document;
  }

  async saveQuestionAndAnswer(result: IQuestionAndAnwser[]) {
    try {
      result.map(async (data: IQuestionAndAnwser) => {
        const question = this.questionRepo.create({
          question: data.question,
        });

        const newQuestion = await this.questionRepo.save(question);

        const answersDatas: IAnswer[] = [
          {
            answer: data.A,
            isCorrect: data.correct === data.A,
            question: newQuestion,
          },
          {
            answer: data.B,
            isCorrect: data.correct === data.B,
            question: newQuestion,
          },
          {
            answer: data.C,
            isCorrect: data.correct === data.C,
            question: newQuestion,
          },
          {
            answer: data.D,
            isCorrect: data.correct === data.D,
            question: newQuestion,
          },
        ];
        answersDatas.map(async (answersData: IAnswer) => {
          const newAnswer = this.answerRepo.create({
            answer: answersData.answer,
            isCorrect: answersData.isCorrect,
            question: answersData.question,
          });
          return await this.answerRepo.save(newAnswer);
        });
      });
    } catch (e) {
      throw e;
    }
  }
}
