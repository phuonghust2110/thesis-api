import { ApiProperty } from '@nestjs/swagger';

export class GetVideoDto {
  @ApiProperty()
  userId: string;
}
