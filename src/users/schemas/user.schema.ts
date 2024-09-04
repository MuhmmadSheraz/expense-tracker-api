import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../user-role.enum';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ default: UserRole.USER, unique: false })
  role: string;

  @Prop({ required: true })
  password: string;

}

export const UserSchema = SchemaFactory.createForClass(User);
