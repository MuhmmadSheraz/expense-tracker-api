import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Source } from './schemas/source.schema';
import { CreateSourceDto } from './dto/create-source.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class SourcesService {
  constructor(
    @InjectModel(Source.name) private sourceModel: Model<Source>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async create(createSourceDto: CreateSourceDto, userId: string) {
    try {
      this.logger.debug(
        `Creating source with data: ${JSON.stringify(
          createSourceDto,
        )} and userId: ${userId}`,
      );

      const source = new this.sourceModel({ ...createSourceDto, user: userId });
      const sourceResponse = await source.save();

      this.logger.info(
        `Source Created Successfully : ${JSON.stringify(sourceResponse)}`,
      );

      return {
        message: 'Source Created Successfully',
        data: sourceResponse,
      };
    } catch (error) {
      this.logger.error(`Error creating source: ${error.message}`, error.stack);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(userId: string) {
    try {
      this.logger.debug(`Finding all sources for userId: ${userId}`);

      const sources = await this.sourceModel.find({ user: userId }).exec();

      this.logger.info(`Found ${sources.length} sources for userId: ${userId}`);
      return sources;
    } catch (error) {
      this.logger.error(
        `Error finding sources for userId ${userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async find(sourceId: Types.ObjectId) {
    try {
      this.logger.debug(`Finding source with id: ${sourceId}`);

      const source = await this.sourceModel.findById(sourceId).exec();

      if (source) {
        this.logger.info(`Found source with id: ${sourceId}`);
      } else {
        this.logger.warn(`Source with id ${sourceId} not found`);
      }

      return source;
    } catch (error) {
      this.logger.error(
        `Error finding source with id ${sourceId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(
    sourceId: string,
    userId: string,
    updateDto: Partial<CreateSourceDto>,
  ) {
    try {
      if (!sourceId) {
        this.logger.warn('Invalid Id of source for update');
        throw new InternalServerErrorException('Invalid Id of source');
      }

      this.logger.debug(
        `Updating source with id: ${sourceId} for userId: ${userId} with data: ${JSON.stringify(
          updateDto,
        )}`,
      );

      const response = await this.sourceModel
        .findOneAndUpdate({ _id: sourceId, user: userId }, updateDto)
        .exec();

      if (response == null) {
        this.logger.warn(`Source with id ${sourceId} not found`);
        throw new NotFoundException('Source not found');
      }

      const updatedSource = await this.sourceModel.findById(sourceId).exec();

      this.logger.info(
        `Source Updated Successfully : ${JSON.stringify(updatedSource)}`,
      );
      return {
        message: 'Source Updated Successfully',
        data: updatedSource,
      };
    } catch (error) {
      this.logger.error(
        `Error updating source with id ${sourceId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(sourceId: string, userId: string) {
    try {
      if (!sourceId) {
        this.logger.warn('Invalid Id of source for deletion');
        throw new InternalServerErrorException('Invalid Id of source');
      }

      this.logger.debug(
        `Removing source with id: ${sourceId} for userId: ${userId}`,
      );

      const response = await this.sourceModel
        .findOneAndDelete({ _id: sourceId, user: userId })
        .exec();

      if (response == null) {
        this.logger.warn(
          `Source with id ${sourceId} not found or already deleted`,
        );
        throw new NotFoundException('Source not found or already deleted');
      }

      this.logger.info(`Source deleted successfully with id: ${sourceId}`);
      return {
        message: 'Source deleted successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error deleting source with id ${sourceId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }
}
