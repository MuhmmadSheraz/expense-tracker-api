import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string) {
    try {
      const category = new this.categoryModel({
        ...createCategoryDto,
        user: userId,
      });
      const categoryResponse = await category.save();
      this.logger.info(`Category created successfully`, {
        category: categoryResponse,
      });
      return {
        message: 'Category Created Successfully',
        data: categoryResponse,
      };
    } catch (error) {
      this.logger.error(`Failed to create category: ${error.message}`, {
        stack: error.stack,
      });
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(userId: string) {
    try {
      const response = await this.categoryModel.find({ user: userId }).exec();
      this.logger.info(`Categories fetched successfully for user ${userId}`, {
        categories: response,
      });
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to fetch categories for user ${userId}: ${error.message}`,
        { stack: error.stack },
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async find(categoryId: Types.ObjectId) {
    try {
      const response = await this.categoryModel.findById(categoryId).exec();
      if (!response) {
        this.logger.warn(`Category with ID ${categoryId} not found`);
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }
      this.logger.info(`Category fetched successfully with ID ${categoryId}`, {
        category: response,
      });
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to fetch category with ID ${categoryId}: ${error.message}`,
        { stack: error.stack },
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(
    categoryId: string,
    userId: string,
    updateDto: Partial<CreateCategoryDto>,
  ) {
    try {
      if (!categoryId) {
        this.logger.warn(`Invalid category ID provided: ${categoryId}`);
        throw new InternalServerErrorException('Invalid ID of Category');
      }

      const response = await this.categoryModel
        .findOneAndUpdate({ _id: categoryId, user: userId }, updateDto, {
          new: true,
        })
        .exec();

      if (!response) {
        this.logger.warn(`Category with ID ${categoryId} not found`);
        throw new NotFoundException('Category not found');
      }

      this.logger.info(`Category updated successfully with ID ${categoryId}`, {
        updatedCategory: response,
      });
      return {
        message: 'Category Updated Successfully',
        data: response,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update category with ID ${categoryId}: ${error.message}`,
        { stack: error.stack },
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(categoryId: string, userId: string) {
    try {
      if (!categoryId) {
        this.logger.warn(`Invalid category ID provided: ${categoryId}`);
        throw new InternalServerErrorException('Invalid ID of category');
      }

      const response = await this.categoryModel
        .findOneAndDelete({ _id: categoryId, user: userId })
        .exec();

      if (!response) {
        this.logger.warn(
          `Category with ID ${categoryId} not found or already deleted`,
        );
        throw new NotFoundException('Category not found or already deleted');
      }

      this.logger.info(`Category deleted successfully with ID ${categoryId}`);
      return { message: 'Category deleted successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to delete category with ID ${categoryId}: ${error.message}`,
        { stack: error.stack },
      );
      throw new InternalServerErrorException(error.message);
    }
  }
}
