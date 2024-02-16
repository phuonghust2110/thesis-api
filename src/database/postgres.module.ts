import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswerEntity } from 'src/entities/answer.entity';
import { ChapterEntity } from 'src/entities/chapter.entity';
import { CourseEntity } from 'src/entities/course.entity';
import { DeviceSessionEntity } from 'src/entities/devicesession.entity';
import { DocumentEntity } from 'src/entities/document.entity';
import { QuestionEntity } from 'src/entities/question.entity';
import { UsersEntity } from 'src/entities/users.entity';
import { VideoEntity } from 'src/entities/video.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [
          UsersEntity,
          DeviceSessionEntity,
          VideoEntity,
          DocumentEntity,
          QuestionEntity,
          AnswerEntity,
          CourseEntity,
          ChapterEntity,
        ],
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
  ],
})
export class PostgresModule {}
