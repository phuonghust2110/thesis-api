import { ApiProperty } from '@nestjs/swagger';

export class AddLessonDto {
  @ApiProperty()
  title: string;
  @ApiProperty()
  chapterId: string;
}

export class GetLessonDto {
  @ApiProperty()
  chapterId: string;
}
