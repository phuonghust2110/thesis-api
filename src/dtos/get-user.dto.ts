import { ApiProperty } from '@nestjs/swagger';

export class GetUserDto {
  @ApiProperty()
  userId: string;
}
