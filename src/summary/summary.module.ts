import { Module } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { SummaryController } from './summary.controller';
import { ExpensesModule } from 'src/expenses/expenses.module';
import { IncomesModule } from 'src/incomes/incomes.module';

@Module({
  imports:[ExpensesModule,IncomesModule],
  controllers: [SummaryController],
  providers: [SummaryService]
})
export class SummaryModule {}
