import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common/decorators';

import { DeviceSessionService } from 'src/devicesession/devicesession.service';
import { RedisService } from 'src/redis/redis.service';
import { JwtService } from 'src/service/jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(DeviceSessionService)
    private deviceSessionService: DeviceSessionService,
    @Inject(RedisService) private redisService: RedisService,
  ) {}

  async validateRequest(request) {
    const headers = request.headers;
    const token = request.headers['authorization'] || null;
    if (!token) throw new UnauthorizedException();
    const tokenPayload = JwtService.decode(request.headers);
    const userId = tokenPayload['user']['id'];
    const deviceId = await this.deviceSessionService.getDeviceId(userId);

    if (!deviceId.includes(tokenPayload['deviceId'])) {
      throw new UnauthorizedException('Token is invalid for this device');
    }
    try {
      const keySk = this.deviceSessionService.keySk(
        userId,
        tokenPayload['deviceId'],
      );
      const secretKeyfromCache = (await this.redisService.get(keySk)) as string;
      if (secretKeyfromCache) {
        return !!JwtService.verify(token, secretKeyfromCache);
      }
      const secretKey = await this.deviceSessionService.getSecretKey(headers);
      return !!JwtService.verify(token, secretKey);
    } catch (e) {
      console.log(e);
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!(await this.validateRequest(request))) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
