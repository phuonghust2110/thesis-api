import { ApiProperty } from '@nestjs/swagger';

export class SendMailDTO {
  @ApiProperty()
  email: string;
  @ApiProperty()
  fullName: string;
}
