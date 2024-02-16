import { Global, Module } from '@nestjs/common';
import { DeviceSessionController } from './devicesession.controller';
import { DeviceSessionService } from './devicesession.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceSessionEntity } from 'src/entities/devicesession.entity';
import { UsersEntity } from 'src/entities/users.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([DeviceSessionEntity, UsersEntity])],
  controllers: [DeviceSessionController],
  providers: [DeviceSessionService],
  exports: [DeviceSessionService],
})
export class DeviceSessionModule {}
