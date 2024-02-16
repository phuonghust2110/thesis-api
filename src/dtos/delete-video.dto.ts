import { ApiProperty } from '@nestjs/swagger';

export class DeleteVideoDto {
  @ApiProperty()
  fileId: string;
}
