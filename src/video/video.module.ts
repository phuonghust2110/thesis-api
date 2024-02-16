import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoEntity } from 'src/entities/video.entity';
import { UsersEntity } from 'src/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VideoEntity, UsersEntity])],
  controllers: [VideoController],
  providers: [VideoService ],
})
export class VideoModule {}
