import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { GetCourseByIdDto, InfoCourseDto } from 'src/dtos/info-course.dto';
import { UserId } from 'src/decorators/userid.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/guard/auth.guard';
import {
  ChapterDto,
  GetAllChapterDto,
  UpdateChapterDto,
} from 'src/dtos/chapter.dto';
import { AddLessonDto, GetLessonDto } from 'src/dtos/lesson.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@ApiTags('COURSE')
@Controller('api/v1/course')
export class CourseController {
  constructor(
    @Inject(CourseService) private readonly courseService: CourseService,
  ) {}

  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination: './thumnail' }),
    }),
  )
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post('createInfoCourse')
  createInfoCourse(
    @UploadedFile() file,
    @Body() infoCourseDto: InfoCourseDto,
    @UserId() userId: string,
  ) {
    const { title, shortDescription, description } = infoCourseDto;
    return this.courseService.createInfoCourse(
      file,
      title,
      shortDescription,
      description,
      userId,
    );
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post('createChapter')
  createChapter(@Body() { chapterName, courseId }: ChapterDto) {
    return this.courseService.createChapter(chapterName, courseId);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('getAllChapter')
  getAllChapter(@Query() { courseId }: GetAllChapterDto) {
    return this.courseService.getAllChapter(courseId);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Put('updateChapter/:id')
  updateChapter(
    @Param('id') id: string,
    @Body() { chapterName }: UpdateChapterDto,
  ) {
    return this.courseService.updateChapter(id, chapterName);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Delete('deleteChapter/:id')
  deleteChapter(@Param('id') id: string) {
    return this.courseService.deleteChapter(id);
  }

  // @UseGuards(AuthGuard)
  // @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination: './lesson' }),
    }),
  )
  @Post('add-lesson')
  addLesson(@UploadedFile() file, @Body() addLessonDto: AddLessonDto) {
    const { title, chapterId, courseId } = addLessonDto;
    return this.courseService.addLesson(chapterId, title, courseId, file);
  }

  @Get('get-lesson')
  getLesson(@Query() { chapterId }: GetLessonDto) {
    return this.courseService.getLesson(chapterId);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('get-all-course')
  getAllCourse() {
    return this.courseService.getAllCourse();
  }

  @Get('getCourseById')
  async getCourseById(@Query() { id }: GetCourseByIdDto) {
    return this.courseService.getCourseById(id);
  }
}
