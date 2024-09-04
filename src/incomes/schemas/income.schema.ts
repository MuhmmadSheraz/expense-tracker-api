import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Income extends Document {
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Date, default: Date.now })
  date: Date;

  @Prop({ type: Types.ObjectId, ref: 'Source', required: true })
  source: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;
}

export const IncomeSchema = SchemaFactory.createForClass(Income);
