import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from 'winston';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './user-role.enum';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  private async checkUserPermission(
    id: string,
    loggedInUser: { userId: string; role: UserRole },
  ): Promise<void> {
    if (
      id !== loggedInUser.userId &&
      loggedInUser.role !== UserRole.SUPER_USER
    ) {
      this.logger.warn(
        `Unauthorized access attempt by user ${loggedInUser.userId} to user ${id}`,
      );

      throw new ForbiddenException('You do not have permission');
    }
  }

  async findUser(id: string, loggedInUser): Promise<User | undefined> {
    await this.checkUserPermission(id, loggedInUser);
    try {
      this.logger.debug(`Attempting to find user with ID ${id}`);
      const user = await this.userModel.findById(id).select('-password').exec();
      this.logger.debug(`User found with ID ${id}`, { user });
      return user?.toObject();
    } catch (error) {
      this.logger.error(
        `Error finding user with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async findUserById(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      this.logger.info(`User found with ID ${id}`, { user });
      return user;
    } catch (error) {
      this.logger.error(
        `Error finding user by ID ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async createUser({ email, password, role, username }: CreateUserDto) {
    try {
      this.logger.debug(
        `Attempting to create user with username ${username} and email ${email}`,
      );
      const existingUser = await this.userModel
        .findOne({ username, email })
        .exec();

      if (existingUser) {
        this.logger.warn(
          `User with username ${username} or email ${email} already exists`,
        );
        throw new ConflictException('Username or email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const createdUser = new this.userModel({
        username,
        password: hashedPassword,
        email,
        role,
      });
      const userResponse = await createdUser.save();

      this.logger.info(`User created successfully`, { userResponse });

      return {
        data: userResponse,
        message: 'User created successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      this.logger.debug(`Fetching all users`);
      const users = await this.userModel.find().select('-password').exec();
      this.logger.info(`Users found successfully`, { users });
      return users;
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`, error.stack);
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: string, loggedInUser, updateUserDto: Partial<User>) {
    // Validate user permissions
    await this.checkUserPermission(id, loggedInUser);

    const userData = await this.findUserById(id);

    // Check if the user being updated is a SUPER_USER
    if (
      userData.role == UserRole.SUPER_USER &&
      loggedInUser.role !== UserRole.SUPER_USER
    ) {
      this.logger.warn(
        `Unauthorized update attempt on SUPER_USER with ID ${id}`,
      );
      throw new ForbiddenException('Cannot Update Super User');
    }

    try {
      this.logger.debug(`Attempting to update user with ID ${id}`);
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .exec();
      this.logger.info('User updated successfully', { updatedUser });
      return { data: updatedUser, message: 'User updated successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to update user with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(id: string, loggedInUser) {
    // Checking for user Permission
    await this.checkUserPermission(id, loggedInUser);

    const userData = await this.findUserById(id);

    // Check if the user being deleted is a SUPER_USER
    if (
      userData.role == UserRole.SUPER_USER &&
      loggedInUser.role !== UserRole.SUPER_USER
    ) {
      this.logger.warn(
        `Unauthorized delete attempt on SUPER_USER with ID ${id}`,
      );
      throw new ForbiddenException('Cannot Delete Super User');
    }

    try {
      this.logger.debug(`Attempting to delete user with ID ${id}`);
      const user = await this.userModel.findByIdAndDelete(id).exec();
      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      this.logger.info(`User deleted successfully`, { user });

      return { message: 'User deleted successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to delete user with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }
}
