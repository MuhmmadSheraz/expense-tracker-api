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
import { SourcesService } from './sources.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags("Sources")
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Post()
  create(@Request() request, @Body() createSourceDto: CreateSourceDto) {
    return this.sourcesService.create(createSourceDto, request.user.userId);
  }

  @Get()
  findAll(@Request() request) {
    return this.sourcesService.findAll(request.user.userId);
  }

  @Patch(':id')
  update(
    @Request() request,
    @Param('id') id: string,
    @Body() updateSourceDto: UpdateSourceDto,
  ) {
    return this.sourcesService.update(id, request.user.userId, updateSourceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() request) {
    return this.sourcesService.remove(id, request.user.userId);
  }
}
