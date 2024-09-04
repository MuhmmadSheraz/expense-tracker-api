  import {
    Inject,
    Injectable,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model, Types } from 'mongoose';
  import { Expense } from './schemas/expense.schema';
  import { CategoriesService } from 'src/categories/categories.service';
  import { CreateExpenseDto } from './dto/create-expense.dto';
  import { UpdateExpenseDto } from './dto/update-expense.dto';
  import { DateRangeType, getDateRange } from 'src/utils/date-utils';
  import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
  import { Logger } from 'winston';

  @Injectable()
  export class ExpensesService {
    constructor(
      @InjectModel(Expense.name) private expenseModel: Model<Expense>,
      @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,

      private categoryService: CategoriesService,
    ) {}

    async getSummary(userId: string, dateRangeType: DateRangeType) {
      const { startDate, endDate } = getDateRange(dateRangeType);
      return this.expenseModel.aggregate([
        {
          $match: {
            user: userId,
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]);
    }

    async create(userId: Types.ObjectId, expenseDto: CreateExpenseDto) {
      try {
        const findCategory = await this.categoryService.find(expenseDto.category);

        if (!findCategory) {
          this.logger.warn(`Category not found with ID: ${expenseDto.category}`);
          throw new Error('Invalid category ID');
        }
        if (findCategory.user != userId) {
          this.logger.warn(
            `Category ID ${expenseDto.category} does not belong to user ${userId}`,
          );
          throw new Error('Category not found');
        }

        const expense = new this.expenseModel({ ...expenseDto, user: userId });
        const response = await expense.save();
        this.logger.info(`Expense created successfully`, { expense: response });

        return {
          message: 'Expense Created successfully',
          data: response,
        };
      } catch (error) {
        this.logger.error(`Failed to create expense: ${error.message}`, {
          stack: error.stack,
        });
        throw new InternalServerErrorException(error.message);
      }
    }

    async findAll(userId: string): Promise<Expense[]> {
      try {
        const response = await this.expenseModel
          .find({ user: userId })
          .populate({
            path: 'category',
            select: '-user',
          })
          .exec();
        this.logger.info(
          `Fetched all expenses successfully for user ID ${userId}`,
          { expenses: response },
        );

        return response;
      } catch (error) {
        this.logger.error(
          `Failed to fetch all expenses for user ID ${userId}: ${error.message}`,
          { stack: error.stack },
        );
        throw new InternalServerErrorException(error.message);
      }
    }

    async update(
      expenseId: string,
      userId: Types.ObjectId,
      updateExpenseDto: UpdateExpenseDto,
    ) {
      try {
        const findExpense = await this.expenseModel.findOne({
          _id: expenseId,
          user: userId,
        });
        if (!findExpense) {
          this.logger.warn(
            `Expense with ID ${expenseId} not found for user ${userId}`,
          );
          throw new Error('Invalid expense ID');
        }
        if (updateExpenseDto.category) {
          const findCategory = await this.categoryService.find(
            updateExpenseDto.category,
          );

          if (!findCategory) {
            this.logger.warn(
              `Category with ID ${updateExpenseDto.category} not found`,
            );
            throw new Error('Invalid category ID');
          }
          if (findCategory.user != userId) {
            this.logger.warn(
              `Category ID ${updateExpenseDto.category} does not belong to user ${userId}`,
            );
            throw new Error('Category not found');
          }
        }
        const updatedExpense = await this.expenseModel
          .findOneAndUpdate({ _id: expenseId, user: userId }, updateExpenseDto, {
            new: true,
          })
          .populate({
            path: 'category',
            select: '-user',
          })
          .exec();

        this.logger.info(`Expense updated successfully`, {
          expense: updatedExpense,
        });
        return {
          message: 'Expense updated successfully',
          data: updatedExpense,
        };
      } catch (error) {
        this.logger.error(
          `Failed to update expense with ID ${expenseId}: ${error.message}`,
          { stack: error.stack },
        );
        throw new InternalServerErrorException(error.message);
      }
    }

    async remove(expenseId: string, userId: Types.ObjectId) {
      try {
        const findExpense = await this.expenseModel.findOne({
          _id: expenseId,
          user: userId,
        });
        if (!findExpense) {
          this.logger.warn(
            `Expense with ID ${expenseId} not found for user ${userId}`,
          );
          throw new Error('Invalid expense ID');
        }

        await this.expenseModel.findByIdAndDelete(expenseId).exec();
        this.logger.info(`Expense with ID ${expenseId} deleted successfully`);

        return { message: 'Expense deleted successfully' };
      } catch (error) {
        this.logger.error(
          `Failed to delete expense with ID ${expenseId}: ${error.message}`,
          { stack: error.stack },
        );
        throw new InternalServerErrorException(error.message);
      }
    }
  }
