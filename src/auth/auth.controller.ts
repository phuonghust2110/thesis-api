import {
  Body,
  Controller,
  Inject,
  Post,
  Req,
  Headers,
  Ip,
  Get,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from 'src/dtos/auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { SendMailDTO } from 'src/dtos/sendmail.dto';
import { MailService } from 'src/mail/mail.service';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(MailService) private readonly mailService: MailService,
  ) {}

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @Post('login')
  async login(
    @Req() req,
    @Ip() ip,
    @Body() signInDto: SignInDto,
    @Headers() headers: Headers,
  ) {
    const deviceId = req.fingerprint.hash;
    const ipAddress = ip;
    const ua = headers['user-agent'];
    const metadata = { deviceId, ipAddress, ua };
    return await this.authService.signIn(signInDto, metadata);
  }

  @Post('send-mail')
  async sendMail(@Body() sendMailDTO: SendMailDTO) {
    const { email, fullName } = sendMailDTO;
    await this.mailService.sendMail(email, fullName);
  }

  @Get('getUser')
  async getUser(@Query() userId: string) {
    await this.authService.getUser(userId);
  }
}
