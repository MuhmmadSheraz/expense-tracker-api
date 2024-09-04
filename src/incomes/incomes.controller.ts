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
  Query,
} from '@nestjs/common';
import { IncomesService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DateRangeType } from 'src/utils/date-utils';

@ApiTags('Incomes')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('incomes')
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @Post()
  create(@Request() request, @Body() createIncomeDto: CreateIncomeDto) {
    return this.incomesService.create(request.user.userId, createIncomeDto);
  }

  @Get()
  findAll(@Request() request) {
    return this.incomesService.findAll(request.user.userId);
  }


  @Patch(':id')
  update(
    @Request() request,
    @Param('id') id: string,
    @Body() updateIncomeDto: UpdateIncomeDto,
  ) {
    return this.incomesService.update(id, request.user.userId, updateIncomeDto);
  }

  @Delete(':id')
  remove(@Request() request, @Param('id') id: string) {
    return this.incomesService.remove(id, request.user.userId);
  }
}
