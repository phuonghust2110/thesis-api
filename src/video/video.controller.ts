import {
  Controller,
  Inject,
  UseInterceptors,
  Post,
  UploadedFile,
  Body,
  UseGuards,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UploadVideoDto } from 'src/dtos/upload-video.dto';
import { UserId } from 'src/decorators/userid.decorator';
import { AuthGuard } from 'src/guard/auth.guard';
import { DeleteVideoDto } from 'src/dtos/delete-video.dto';
import { GetVideoDto } from 'src/dtos/getVideo.dto';

@ApiTags('video')
@Controller('api/v1/video')
export class VideoController {
  constructor(@Inject(VideoService) private videoService: VideoService) {}

  @Post('upload')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination: './videos' }),
    }),
  )
  upload(
    @UploadedFile() file,
    @Body() uploadVideoDto: UploadVideoDto,
    @UserId() userId: string,
  ) {
    const { title, description } = uploadVideoDto;

    return this.videoService.uploadVideo(file, userId, title, description);
  }

  @Delete('delete')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  delete(@Body() deleteVideoDto: DeleteVideoDto) {
    const { fileId } = deleteVideoDto;
    return this.videoService.deleteFile(fileId);
  }

  @Get('/getVideo')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  getVideo(@Query() getVideoDto: GetVideoDto) {
    const { userId } = getVideoDto;
    return this.videoService.getVideo(userId);
  }
}
