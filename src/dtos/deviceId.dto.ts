import { ApiProperty } from '@nestjs/swagger';

export class DeviceIdDto {
  @ApiProperty()
  userId: string;
}
