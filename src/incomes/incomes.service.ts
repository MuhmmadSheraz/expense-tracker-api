import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Income } from './schemas/income.schema';
import { CreateIncomeDto } from './dto/create-income.dto';
import { SourcesService } from 'src/sources/sources.service';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { DateRangeType, getDateRange } from 'src/utils/date-utils';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class IncomesService {
  constructor(
    @InjectModel(Income.name) private incomeModel: Model<Income>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private sourceService: SourcesService,
  ) {}

  async create(userId: Types.ObjectId, incomeDto: CreateIncomeDto) {
    try {
      const findSource = await this.sourceService.find(incomeDto.source);

      if (!findSource) {
        this.logger.warn(`Source not found with ID: ${incomeDto.source}`);
        throw new Error('Invalid source Id');
      }
      if (findSource.user != userId) {
        this.logger.warn(
          `Source ID ${incomeDto.source} does not belong to user ${userId}`,
        );
        throw new Error('Source not found');
      }

      const income = new this.incomeModel({ ...incomeDto, user: userId });
      const response = await income.save();
      this.logger.info(`Income created successfully`, { income: response });

      return {
        message: 'Income Created successfully',
        data: response,
      };
    } catch (error) {
      this.logger.error(`Failed to create income: ${error.message}`, {
        stack: error.stack,
      });
      throw new InternalServerErrorException(error.message);
    }
  }

  async getSummary(userId: string, dateRangeType: DateRangeType) {
    const { startDate, endDate } = getDateRange(dateRangeType);
    try {
      const summary = await this.incomeModel.aggregate([
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
      this.logger.info(`Income summary retrieved successfully`, { summary });
      return summary;
    } catch (error) {
      this.logger.error(`Failed to retrieve income summary: ${error.message}`, {
        stack: error.stack,
      });
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(userId: string): Promise<Income[]> {
    try {
      const response = await this.incomeModel
        .find({ user: userId })
        .populate({
          path: 'source',
          select: '-user',
        })
        .exec();
      this.logger.info(
        `Fetched all incomes successfully for user ID ${userId}`,
        { incomes: response },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to fetch all incomes for user ID ${userId}: ${error.message}`,
        { stack: error.stack },
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(
    incomeId: string,
    userId: Types.ObjectId,
    updateIncome: UpdateIncomeDto,
  ) {
    try {
      const findIncome = await this.incomeModel.findOne({
        _id: incomeId,
        user: userId,
      });
      if (!findIncome) {
        this.logger.warn(
          `Income with ID ${incomeId} not found for user ${userId}`,
        );
        throw new Error('Invalid income Id');
      }
      if (updateIncome.source) {
        const findSource = await this.sourceService.find(updateIncome.source);

        if (!findSource) {
          this.logger.warn(`Source with ID ${updateIncome.source} not found`);
          throw new Error('Invalid source Id');
        }
        if (findSource.user != userId) {
          this.logger.warn(
            `Source ID ${updateIncome.source} does not belong to user ${userId}`,
          );
          throw new Error('Source not found');
        }
      }
      const updatedIncome = await this.incomeModel
        .findOneAndUpdate({ _id: incomeId, user: userId }, updateIncome, {
          new: true,
        })
        .populate({
          path: 'source',
          select: '-user',
        })
        .exec();
      this.logger.info(`Income updated successfully`, {
        income: updatedIncome,
      });

      return {
        message: 'Income updated successfully',
        data: updatedIncome,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update income with ID ${incomeId}: ${error.message}`,
        { stack: error.stack },
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(incomeId: string, userId: Types.ObjectId) {
    try {
      const findIncome = await this.incomeModel.findOne({
        _id: incomeId,
        user: userId,
      });
      if (!findIncome) {
        this.logger.warn(
          `Income with ID ${incomeId} not found for user ${userId}`,
        );
        throw new Error('Invalid income Id');
      }

      await this.incomeModel.findByIdAndDelete(incomeId).exec();
      this.logger.info(`Income with ID ${incomeId} deleted successfully`);

      return { message: 'Income deleted successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to delete income with ID ${incomeId}: ${error.message}`,
        { stack: error.stack },
      );
      throw new InternalServerErrorException(error.message);
    }
  }
}
