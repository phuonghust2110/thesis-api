import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignInDto, SignUpDto } from 'src/dtos/auth.dto';
import { UsersEntity } from 'src/entities/users.entity';
import { IAuthentication } from 'src/interface/auth.interface';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { DeviceSessionService } from 'src/devicesession/devicesession.service';
import { IMetadata } from 'src/interface/metadata.interface';

@Injectable()
export class AuthService implements IAuthentication {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepo: Repository<UsersEntity>,
    @Inject(DeviceSessionService)
    private readonly deviceSessionService: DeviceSessionService,
  ) {}
  async signUp(signUpDto: SignUpDto) {
    const { firstName, lastName, email, password } = signUpDto;
    const user = await this.usersRepo.findOne({ where: { email } });
    if (user) {
      throw new ConflictException('This email has already exist');
    } else {
      try {
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);
        const newUser = this.usersRepo.create();
        newUser.email = email;
        newUser.password = hashPassword;
        newUser.firstName = firstName;
        newUser.lastName = lastName;
        await this.usersRepo.save(newUser);
        return newUser;
      } catch (e) {
        throw e;
      }
    }
  }

  async signIn(signInDto: SignInDto, loginMetadata: IMetadata) {
    try {
      const { email, password } = signInDto;
      const user: UsersEntity = await this.usersRepo.findOne({
        where: { email },
      });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new BadRequestException(
          'Đăng nhập không thành công, vui lòng kiểm tra lại email hoặc mật khẩu',
        );
      } else {
        return await this.deviceSessionService.handleDeviceSession(
          user,
          loginMetadata,
        );
      }
    } catch (e) {
      throw e;
    }
  }

  async getUser(userId: string) {
    return await this.usersRepo.findOne({ where: { id: userId } });
  }
}
