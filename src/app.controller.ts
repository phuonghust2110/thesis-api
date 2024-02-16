import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Fingerprint, IFingerprint } from 'nestjs-fingerprint';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getFingerprint(@Fingerprint() fp: IFingerprint) {
    return fp;
  }
}
