import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<UserDocument | null> {
    const user: any = (
      await this.userModel.findOne({ username }).exec()
    )?.toObject();
    if (!user) {
      this.logger.warn(`Failed to find user with username ${username}`);

      throw new UnauthorizedException('User not found');
    }
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    } else {
      this.logger.warn(`Incorrect Password for ${username}`);
      throw new UnauthorizedException('Incorrect Password');
    }
  }

  async login(user: LoginDto) {
    try {
      const userData: Omit<UserDocument, 'password'> | null =
        await this.validateUser(user.username, user.password);

      const payload = {
        username: user.username,
        sub: userData._id,
        role: userData.role,
      };

      const accessToken = this.jwtService.sign(payload);
      this.logger.info(`User Logged in successfully`, { userData });

      return {
        ...userData,
        access_token: accessToken,
        message: 'User Logged in successfully',
      };
    } catch (error) {
      this.logger.info(`Failed to Logged In User`);

      throw new UnauthorizedException(error.message);
    }
  }
}
