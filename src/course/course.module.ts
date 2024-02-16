import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from 'src/entities/course.entity';
import { UsersEntity } from 'src/entities/users.entity';
import { ChapterEntity } from 'src/entities/chapter.entity';
import { VideoEntity } from 'src/entities/video.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseEntity,
      UsersEntity,
      ChapterEntity,
      VideoEntity,
    ]),
  ],
  providers: [CourseService],
  controllers: [CourseController],
})
export class CourseModule {}
