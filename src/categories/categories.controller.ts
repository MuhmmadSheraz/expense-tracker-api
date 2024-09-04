import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags("Categories")
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Request() request, @Body() CreateCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(
      CreateCategoryDto,
      request.user.userId,
    );
  }

  @Get()
  findAll(@Request() request) {
    return this.categoriesService.findAll(request.user.userId);
  }

  @Patch(':id')
  update(
    @Request() request,
    @Param('id') id: string,
    @Body() UpdateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(
      id,
      request.user.userId,
      UpdateCategoryDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() request) {
    return this.categoriesService.remove(id, request.user.userId);
  }
}
