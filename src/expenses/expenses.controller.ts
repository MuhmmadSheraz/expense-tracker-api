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
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { DateRangeType } from 'src/utils/date-utils';

@ApiTags('Expenses')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expenseService: ExpensesService) {}

  @Post()
  create(@Request() request, @Body() createExpenseDto: CreateExpenseDto) {
    return this.expenseService.create(request.user.userId, createExpenseDto);
  }

  @Get()
  findAll(@Request() request) {
    return this.expenseService.findAll(request.user.userId);
  }

  @Patch(':id')
  update(
    @Request() request,
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expenseService.update(
      id,
      request.user.userId,
      updateExpenseDto,
    );
  }

  @Delete(':id')
  remove(@Request() request, @Param('id') id: string) {
    return this.expenseService.remove(id, request.user.userId);
  }
}
