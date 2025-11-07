import { defaultClasses, getModelForClass, prop, modelOptions } from '@typegoose/typegoose';
import { User, UserType } from '../../types/index.js';
import { createSHA256 } from '../../libs/utils.js';

export interface UserEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'users'
  }
})
export class UserEntity extends defaultClasses.TimeStamps implements User {
  @prop({ required: true, minlength: 1, maxlength: 15, default: '' })
  public name: string;

  @prop({ required: true, unique: true, match: [/^([\w-\\.]+@([\w-]+\.)+[\w-]{2,4})?$/, 'Email is incorrect'] })
  public email: string;

  @prop({ required: false, default: '' })
  public avatarSrc?: string;

  @prop({ required: true, default: '' })
  public password!: string;

  @prop({
    type: () => String,
    required: true,
    enum: ['pro', 'обычный']
  })
  public type: UserType;

  constructor(userData: User) {
    super();

    this.email = userData.email;
    this.avatarSrc = userData.avatarSrc;
    this.name = userData.name;
    this.type = userData.type;
  }

  public setPassword(password: string, salt: string) {
    this.password = createSHA256(password, salt);
  }

  public getPassword() {
    return this.password;
  }
}

export const UserModel = getModelForClass(UserEntity);
