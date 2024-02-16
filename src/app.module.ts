import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PostgresModule } from './database/postgres.module';
import { DeviceSessionModule } from './devicesession/devicesession.module';
import { NestjsFingerprintModule } from 'nestjs-fingerprint';
import { MailModule } from './mail/mail.module';
import { CourseModule } from './course/course.module';
import { VideoModule } from './video/video.module';
import { DocumentModule } from './document/document.module';

@Module({
  imports: [
    AuthModule,
    PostgresModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    NestjsFingerprintModule.forRoot({
      params: ['headers', 'userAgent', 'ipAddress'],
      cookieOptions: {
        // httpOnly: true, // optional
      },
    }),
    MailModule,
    CourseModule,
    VideoModule,
    DocumentModule,
    DeviceSessionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
