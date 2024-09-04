import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExpensesService } from '../expenses/expenses.service';
import { IncomesService } from '../incomes/incomes.service';
import { DateRangeType } from '../utils/date-utils';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SummaryService } from './summary.service';

@Controller('summary')
@ApiQuery({ name: 'type', enum: DateRangeType, required: false })
@ApiTags('Summary')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class SummaryController {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly incomesService: IncomesService,
    private readonly summaryService: SummaryService,
  ) {}

  @Get('')
  async getCombinedSummary(@Request() req, @Query('type') type: DateRangeType) {
    return this.summaryService.getCombinedSummary(
      req.user.userId,
      type || DateRangeType.TODAY,
    );
  }

  @Get('expenses')
  async getExpenseSummary(@Request() req, @Query('type') type: DateRangeType) {
    return this.expensesService.getSummary(
      req.user.userId,
      type || DateRangeType.TODAY,
    );
  }

  @Get('incomes')
  async getIncomeSummary(@Request() req, @Query('type') type: DateRangeType) {
    return this.incomesService.getSummary(
      req.user.userId,
      type || DateRangeType.TODAY,
    );
  }
}
