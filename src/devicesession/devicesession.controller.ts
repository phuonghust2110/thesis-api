import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DeviceSessionService } from './devicesession.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/guard/auth.guard';
import { ReAuthDto } from 'src/dtos/auth.dto';
import { UserId } from 'src/decorators/userid.decorator';
import { DeviceIdDto } from 'src/dtos/deviceId.dto';

@ApiTags('DeviceSessions')
@Controller('api/v1/devicesession')
export class DeviceSessionController {
  constructor(
    @Inject(DeviceSessionService)
    private deviceSessionService: DeviceSessionService,
  ) {}
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('secret-key')
  getSecretKey(@Headers() headers: Headers) {
    return this.deviceSessionService.getSecretKey(headers);
  }

  @Post('refresh-token')
  async reAuth(@Body() { _refreshToken }: ReAuthDto, @Req() req) {
    const deviceId = req.fingerprint.hash;
    return this.deviceSessionService.reAuth(deviceId, _refreshToken);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  async logOut(@Req() req, @UserId() userId: string) {
    const deviceId = req.fingerprint.hash;
    console.log(deviceId);
    return this.deviceSessionService.logOut(userId, deviceId);
  }

  @Get('deviceId')
  async getDeviceId(@Query() { userId }: DeviceIdDto) {
    return this.deviceSessionService.getDeviceId(userId);
  }
}
