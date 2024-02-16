import { ApiProperty } from '@nestjs/swagger';

export class UploadVideoDto {
  @ApiProperty()
  title: string;
  @ApiProperty()
  description: string;
}
