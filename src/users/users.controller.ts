import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Delete,
  Put,
  Patch,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from './user-role.enum';
import { RolesGuard } from 'src/auth/guards/role.guards';
import { Roles } from 'src/auth/decorators/role.decorators';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Request() request, @Param('id') id: string): Promise<User> {
    const loggedInUser = request.user;

    return this.usersService.findUser(id, loggedInUser);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get()
  @Roles(UserRole.SUPER_USER)
  async findAll() {
    return this.usersService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Request() request,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const loggedInUser = request.user;
    return this.usersService.update(id, loggedInUser, updateUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(@Request() request, @Param('id') id: string) {
    const loggedInUser = request.user;
    return this.usersService.delete(id, loggedInUser);
  }
}
