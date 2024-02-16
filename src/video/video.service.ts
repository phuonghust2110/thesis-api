import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
const apiKey = require('../../apiKey.json');
import { google } from 'googleapis';
import { UsersEntity } from 'src/entities/users.entity';
import { VideoEntity } from 'src/entities/video.entity';
import { Repository } from 'typeorm';
const SCOPE = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.JWT(
  apiKey.client_email,
  null,
  apiKey.private_key,
  SCOPE,
);

const drive = google.drive({ version: 'v3', auth });

@Injectable()
export class VideoService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(VideoEntity) private videoRepo: Repository<VideoEntity>,
    @InjectRepository(UsersEntity) private userRepo: Repository<UsersEntity>,
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

  async uploadVideo(file, userId: string, title: string, description: string) {
    try {
      console.log(file);
      const user = await this.userRepo.findOne({ where: { id: userId } });
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
      const getUrl = await this.getUrlFile(fileId);
      return await this.videoRepo.save({
        fileId,
        title,
        description,
        size: file.size,
        fileName: file.originalname,
        urlFile: getUrl.data.webViewLink,
        user: user,
      });
    } catch (e) {
      console.log(e);
    }
  }

  async deleteFile(fileId: string) {
    try {
      const deleteFile = await drive.files.delete({
        fileId,
      });

      return deleteFile;
    } catch (e) {
      console.log(e);
    }
  }

  async getVideo(userId: string) {
    const video = await this.videoRepo
      .createQueryBuilder('video')
      .leftJoinAndSelect('video.user', 'user')
      .where('user.id = :userId', { userId })
      .select([
        'video.id',
        'video.urlFile',
        'video.fileName',
        'video.title',
        'video.description',
        'video.createdAt',
      ])
      .getMany();
    return video;
  }
}
