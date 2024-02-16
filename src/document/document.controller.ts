import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserId } from 'src/decorators/userid.decorator';
import { DocumentDto, GetDocumentDto } from 'src/dtos/document.dto';
import { DocumentService } from './document.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthGuard } from 'src/guard/auth.guard';

@ApiTags('document')
@Controller('api/v1/document')
export class DocumentController {
  constructor(
    @Inject(DocumentService) private documentService: DocumentService,
  ) {}
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination: './document' }),
    }),
  )
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  upload(@UploadedFile() file, @Body() documentDto: DocumentDto) {
    const { title, description, chapterId } = documentDto;

    return this.documentService.uploadDocument(
      file,
      title,
      description,
      chapterId,
    );
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('getDocument')
  getDocument(@Query() getDocumentDto: GetDocumentDto) {
    const { userId } = getDocumentDto;
    return this.documentService.getDocument(userId);
  }
}
