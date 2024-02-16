import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'src/entities/users.entity';
import { DeviceSessionModule } from 'src/devicesession/devicesession.module';
import { DeviceSessionService } from 'src/devicesession/devicesession.service';
import { DeviceSessionEntity } from 'src/entities/devicesession.entity';
import { RedisModule } from 'src/redis/redis.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    MailModule,
    RedisModule,
    DeviceSessionModule,
    TypeOrmModule.forFeature([UsersEntity, DeviceSessionEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthService, DeviceSessionService],
})
export class AuthModule {}
