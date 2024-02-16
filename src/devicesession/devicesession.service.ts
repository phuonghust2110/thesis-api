import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceSessionEntity } from 'src/entities/devicesession.entity';
import addDay from 'src/helper/addDay';
import { IMetadata } from 'src/interface/metadata.interface';
import { DataSource, Repository } from 'typeorm';
import * as randomatic from 'randomatic';
import { EXP_TOKEN, JwtService } from 'src/service/jwt.service';
import { randomUUID } from 'crypto';
import { RedisService } from 'src/redis/redis.service';
import { UsersEntity } from 'src/entities/users.entity';

const EXP_TOKEN_MILIS = EXP_TOKEN * 1000;
const EXP_REFRESHTOKEN = 7;
const EXP_REFRESHTOKEN_MILIS = 7 * 24 * 3600 * 1000;
@Injectable()
export class DeviceSessionService {
  constructor(
    @InjectRepository(DeviceSessionEntity)
    private deviceSessionRepo: Repository<DeviceSessionEntity>,
    private dataSource: DataSource,
    @InjectRepository(UsersEntity)
    private userRepo: Repository<UsersEntity>,
    @Inject(RedisService) private redisService: RedisService,
  ) {}

  async logOut(userId: string, deviceId: string) {
    const sessionId = (
      await this.deviceSessionRepo.findOne({ where: { deviceId } })
    ).id;
    const session = await this.deviceSessionRepo
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.user', 'users')
      .select(['session', 'users.id'])
      .where('session.id = :sessionId', { sessionId })
      .getOne();
    if (!session || session.user.id !== userId) {
      throw new ForbiddenException();
    }
    const keyCacheRf = this.keyRf(userId, session.deviceId);
    const keyCacheSk = this.keySk(userId, session.deviceId);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.redisService.del(keyCacheRf);
      await this.redisService.del(keyCacheSk);
      await this.deviceSessionRepo.delete(sessionId);

      await queryRunner.commitTransaction();
      return { code: HttpStatus.OK, message: 'logout success' };
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async reAuth(deviceId: string, _refreshToken: string) {
    const session = await this.deviceSessionRepo
      .createQueryBuilder('deviceSession')
      .leftJoinAndSelect('deviceSession.user', 'users')
      .select(['deviceSession', 'users.id'])
      .getOne();

    const user = await this.userRepo.findOne({
      where: { id: session.user.id },
    });
    const keyCacheSk = this.keySk(session.user.id, deviceId);
    const keyCacheRf = this.keyRf(session.user.id, deviceId);
    const isRefreshToken = await this.redisService.get(keyCacheRf);
    if (!session || !isRefreshToken || isRefreshToken !== _refreshToken) {
      return new UnauthorizedException('RefreshToken invalid');
    }

    const payload = {
      user,
      deviceId,
    };

    const secretKey = this.generateSecretKey();
    const [accessToken, refreshToken, expired_at] = [
      JwtService.generate(payload, secretKey),
      randomatic('Aa0', 32),
      addDay(7),
    ];
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager
        .getRepository(DeviceSessionEntity)
        .update(session.id, {
          secretKey,
          refreshToken,
          expired_at,
        });
      await this.redisService.set(keyCacheSk, secretKey, EXP_TOKEN_MILIS);

      await this.redisService.set(
        keyCacheRf,
        refreshToken,
        EXP_REFRESHTOKEN_MILIS,
      );
      await queryRunner.commitTransaction();
      return { accessToken, refreshToken, expired_at };
    } catch (e) {
      queryRunner.rollbackTransaction();
      throw e;
    } finally {
      queryRunner.release();
    }
  }

  async handleDeviceSession(user: UsersEntity, loginMetadata: IMetadata) {
    const { deviceId, ua, ipAddress } = loginMetadata;
    const userId = user.id;
    const currentUser = await this.deviceSessionRepo.findOne({
      where: { deviceId },
    });
    const expiredAt = addDay(EXP_REFRESHTOKEN);
    const payload = {
      user,
      deviceId,
    };

    const secretKey = this.generateSecretKey();

    const [accessToken, refreshToken] = [
      JwtService.generate(payload, secretKey),
      randomatic('Aa0', 32),
    ];
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const newDeviceSession = new DeviceSessionEntity();
      newDeviceSession.deviceId = deviceId;
      newDeviceSession.secretKey = secretKey;
      newDeviceSession.refreshToken = refreshToken;
      newDeviceSession.expired_at = expiredAt;
      newDeviceSession.ipAddress = ipAddress;
      newDeviceSession.ua = ua;
      newDeviceSession.user = user;

      await queryRunner.manager.getRepository(DeviceSessionEntity).save({
        id: currentUser?.id || randomUUID(),
        ...newDeviceSession,
      });

      const keyCacheRf = this.keyRf(userId, deviceId);
      const keyCacheSk = this.keySk(userId, deviceId);
      await this.redisService.set(keyCacheSk, secretKey, EXP_TOKEN_MILIS);
      await this.redisService.set(
        keyCacheRf,
        refreshToken,
        EXP_REFRESHTOKEN_MILIS,
      );
      await queryRunner.commitTransaction();
      return {
        message: HttpStatus.OK,
        user,
        accessToken,
        refreshToken,
        expiredAt,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    }
  }

  async getSecretKey(headers) {
    const payload: any = JwtService.decode(headers);
    const { user, deviceId, exp } = payload;
    const userId = user.id;

    const { secretKey }: any = await this.deviceSessionRepo
      .createQueryBuilder('session')
      .where('session.deviceId = :deviceId', { deviceId })
      .andWhere('session.user= :userId', { userId })
      .getOne();

    return secretKey;
  }

  keyRf(userId: string, deviceId: string): string {
    return `rf-${userId}-${deviceId}`;
  }

  generateSecretKey(length = 16) {
    return randomatic('Aa0', length);
  }

  keySk(userId: string, deviceId: string): string {
    return `sk-${userId}-${deviceId}`;
  }

  async getDeviceId(userId: string) {
    const deviceId: string[] = [];
    const sessions: DeviceSessionEntity[] = await this.deviceSessionRepo
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.user', 'user')
      .where('session.user.id =:userId', { userId })
      .getMany();

    sessions.map((session: DeviceSessionEntity) => {
      deviceId.push(session.deviceId);
    });
    return deviceId;
  }
}
