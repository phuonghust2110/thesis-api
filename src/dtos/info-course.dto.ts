import { ApiProperty } from '@nestjs/swagger';

export class InfoCourseDto {
  @ApiProperty()
  title: string;
  @ApiProperty()
  shortDescription: string;
  @ApiProperty()
  description: string;
}
