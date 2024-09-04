import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesModule } from 'src/categories/categories.module';
import { Expense, ExpenseSchema } from './schemas/expense.schema';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }]),
    CategoriesModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports:[ExpensesService]
})
export class ExpensesModule {}
