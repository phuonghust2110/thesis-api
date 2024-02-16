import { ApiProperty } from '@nestjs/swagger';

export class DocumentDto {
  @ApiProperty()
  title: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  chapterId: string;
}

export class GetDocumentDto {
  @ApiProperty()
  userId: string;
}
