import { Inject, Injectable } from '@nestjs/common';
import { ExpensesService } from 'src/expenses/expenses.service';
import { IncomesService } from 'src/incomes/incomes.service';
import { DateRangeType } from 'src/utils/date-utils';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class SummaryService {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly incomesService: IncomesService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getCombinedSummary(userId: string, dateRangeType: DateRangeType) {
    try {
      this.logger.debug(
        `Fetching combined summary for userId: ${userId} and dateRangeType: ${dateRangeType}`,
      );

      // Fetch expense summary
      this.logger.debug(`Fetching expense summary`);
      const expenseSummary = await this.expensesService.getSummary(
        userId,
        dateRangeType,
      );
      this.logger.info(
        `Expense summary fetched successfully for userId: ${userId} and dateRangeType: ${dateRangeType}`,
        {
          expenseSummary,
        },
      );

      // Fetch income summary
      this.logger.debug(`Fetching income summary`);
      const incomeSummary = await this.incomesService.getSummary(
        userId,
        dateRangeType,
      );
      this.logger.info(
        `Income summary fetched successfully for userId: ${userId} and dateRangeType: ${dateRangeType}`,
        {
          incomeSummary,
        },
      );

      // Calculate totals
      const totalExpenses = expenseSummary[0]?.totalAmount || 0;
      const totalIncomes = incomeSummary[0]?.totalAmount || 0;
      const netBalance = totalIncomes - totalExpenses;

      this.logger.debug(
        `Calculated totals: totalExpenses=${totalExpenses}, totalIncomes=${totalIncomes}, netBalance=${netBalance}`,
      );

      return {
        totalExpenses,
        totalIncomes,
        netBalance,
        expenseCount: expenseSummary[0]?.count || 0,
        incomeCount: incomeSummary[0]?.count || 0,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching combined summary for userId: ${userId} and dateRangeType: ${dateRangeType}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
