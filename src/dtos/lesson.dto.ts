import { ApiProperty } from '@nestjs/swagger';

export class AddLessonDto {
  @ApiProperty()
  title: string;
  @ApiProperty()
  chapterId: string;
  @ApiProperty()
  courseId: string;
}

export class GetLessonDto {
  @ApiProperty()
  chapterId: string;
}
