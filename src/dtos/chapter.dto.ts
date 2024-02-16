import { ApiProperty } from '@nestjs/swagger';

export class ChapterDto {
  @ApiProperty()
  chapterName: string;
  @ApiProperty()
  courseId: string;
}

export class GetAllChapterDto {
  @ApiProperty()
  courseId: string;
}

export class UpdateChapterDto {
  @ApiProperty()
  chapterName: string;
}
