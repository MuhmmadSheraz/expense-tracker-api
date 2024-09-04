import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { SourcesModule } from './sources/sources.module';
import { CategoriesModule } from './categories/categories.module';
import { IncomesModule } from './incomes/incomes.module';
import { ExpensesModule } from './expenses/expenses.module';
import { SummaryModule } from './summary/summary.module';
import * as winston from 'winston';
import { winstonConfig } from './logger/logger.config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    WinstonModule.forRoot(winstonConfig),
    AuthModule,
    UsersModule,
    SourcesModule,
    CategoriesModule,
    IncomesModule,
    ExpensesModule,
    SummaryModule,
  ],
  providers: [Logger],
})
export class AppModule {}
