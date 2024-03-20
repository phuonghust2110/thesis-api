import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { google } from 'googleapis';
import { ChapterEntity } from 'src/entities/chapter.entity';
import { CourseEntity } from 'src/entities/course.entity';
import { UsersEntity } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
const apiKey = require('../../apiKey.json');
const SCOPE = ['https://www.googleapis.com/auth/drive'];
const auth = new google.auth.JWT(
  apiKey.client_email,
  null,
  apiKey.private_key,
  SCOPE,
);
import * as fs from 'fs';
import { VideoEntity } from 'src/entities/video.entity';

const drive = google.drive({ version: 'v3', auth });
@Injectable()
export class CourseService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,
    @InjectRepository(UsersEntity)
    private readonly userRepo: Repository<UsersEntity>,
    @InjectRepository(ChapterEntity)
    private readonly chapterRepo: Repository<ChapterEntity>,
    @InjectRepository(VideoEntity)
    private readonly videoRepo: Repository<VideoEntity>,
  ) {}

  async createInfoCourse(
    file,
    title: string,
    shortDescription: string,
    description: string,
    userId: string,
  ) {
    const folderThumnail = this.configService.get('FOLDER_THUMNAIL');
    console.log(folderThumnail);
    const createFile = await drive.files.create({
      requestBody: {
        name: file.originalname,
        mimeType: file.mimetype,
        parents: [folderThumnail],
      },
      media: {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path),
      },
    });

    const fileId = createFile.data.id;
    await this.setPublicFile(fileId);
    const user: UsersEntity = await this.userRepo.findOne({
      where: { id: userId },
    });
    if (user) {
      const thumnailUrl = `https://drive.lienuc.com/uc?id=${fileId}`;
      const infoCourse = this.courseRepo.create({
        title,
        shortDescription,
        description,
        thumnailUrl,
        user,
      });

      return await this.courseRepo.save(infoCourse);
    }
  }

  async getAllCourse() {
    return await this.courseRepo.find();
  }

  async createChapter(chapterName: string, courseId: string) {
    const chapter = await this.chapterRepo.findOne({
      where: { chapterName, course: { id: courseId } },
    });
    if (chapter) throw new ConflictException('Chương này đã tồn tại');
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    const newChapter = this.chapterRepo.create({
      chapterName,
      course,
    });

    return await this.chapterRepo.save(newChapter);
  }

  async getAllChapter(courseId: string) {
    return await this.chapterRepo
      .createQueryBuilder('chapter')
      .leftJoinAndSelect('chapter.course', 'course')
      .select(['chapter.id', 'chapter.chapterName'])
      .where('course.id =:courseId', { courseId })
      .orderBy('chapter.create_at', 'ASC')
      .getMany();
  }

  async getLesson(chapterId: string) {
    const lesson = await this.videoRepo
      .createQueryBuilder('video')
      .leftJoinAndSelect('video.chapter', 'chapter')
      .leftJoin('video.course', 'course')
      .where('chapter.id =:chapterId', { chapterId })
      .select([
        'video.id AS id',
        'video.urlFile AS urlFile',
        'video.title AS title',
        'chapter.id AS chapterId',
      ])
      .getRawMany();

    return lesson;
  }

  async updateChapter(id: string, chapterName: string) {
    return await this.chapterRepo
      .update({ id }, { chapterName })
      .then((result) => console.log(result));
  }

  async deleteChapter(id: string) {
    return await this.chapterRepo.delete({ id });
  }

  async addLesson(chapterId: string, title: string, courseId: string, file) {
    try {
      const chapter = await this.chapterRepo.findOne({
        where: { id: chapterId },
      });
      const course = await this.courseRepo.findOne({ where: { id: courseId } });

      if (!chapter || !course) {
        throw new NotFoundException('Không tìm thấy chương');
      }
      const folderId = this.configService.get('FOLDER_ID');
      const createFile = await drive.files.create({
        requestBody: {
          name: file.originalname,
          mimeType: file.mimetype,
          parents: [folderId],
        },
        media: {
          mimeType: file.mimetype,
          body: fs.createReadStream(file.path),
        },
      });

      const fileId = createFile.data.id;
      await this.setPublicFile(fileId);
      const videoUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      const newVideo = this.videoRepo.create({
        title,
        fileId,
        fileName: file.originalname,
        urlFile: videoUrl,
        chapter,
        course,
      });

      return await this.videoRepo.save(newVideo);
    } catch (error) {}
  }

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

  async deleteFile(fileId: string) {
    try {
      console.log('Delete File:::', fileId);
      const deleteFile = await drive.files.delete({
        fileId: fileId,
      });
      console.log(deleteFile.data, deleteFile.status);

      return await this.videoRepo.delete({ fileId });
    } catch (error) {
      console.error(error);
    }
  }

  async getCourseById(id: string): Promise<CourseEntity> {
    return await this.courseRepo.findOne({ where: { id } });
  }
}
