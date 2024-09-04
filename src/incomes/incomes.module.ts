import { Module } from '@nestjs/common';
import { IncomesService } from './incomes.service';
import { IncomesController } from './incomes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Income, IncomeSchema } from './schemas/income.schema';
import { SourcesService } from 'src/sources/sources.service';
import { SourcesModule } from 'src/sources/sources.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Income.name, schema: IncomeSchema }]),
    SourcesModule
  ],
  controllers: [IncomesController],
  providers: [IncomesService],
  exports: [IncomesService],
})
export class IncomesModule {}
