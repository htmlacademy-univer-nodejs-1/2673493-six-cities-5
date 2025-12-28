import { IUserService } from './user-service.interface.js';
import { DocumentType, types } from '@typegoose/typegoose';
import { UserEntity } from './user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { inject, injectable } from 'inversify';
import { Component } from '../../types/index.js';
import { ILogger } from '../../libs/logger/index.js';
import { LoginUserDto } from './dto/login-user.dto.js';
import { OfferEntity } from '../offer/offer.entity.js';

@injectable()
export class DefaultUserService implements IUserService {
  constructor(
    @inject(Component.UserModel) private readonly userModel: types.ModelType<UserEntity>,
    @inject(Component.Logger) private readonly logger: ILogger,
  ) {}

  public async create(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>> {
    const user = new UserEntity(dto);
    user.setPassword(dto.password, salt);

    const result = await this.userModel.create(user);
    this.logger.info(`New user created: ${user.email}`);

    return result as unknown as DocumentType<UserEntity>;
  }

  public async findByEmail(email: string): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findOne({email}).exec() as unknown as Promise<DocumentType<UserEntity> | null>;
  }

  public async findOrCreate(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>> {
    const existedUser = await this.findByEmail(dto.email);

    if (existedUser) {
      return existedUser;
    }

    return this.create(dto, salt);
  }

  public async findById(userId: string): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findById(userId).exec() as unknown as Promise<DocumentType<UserEntity> | null>;
  }

  public async verifyUser(dto: LoginUserDto, salt: string): Promise<DocumentType<UserEntity> | null> {
    const user = await this.findByEmail(dto.email);

    if (!user) {
      return null;
    }

    if (user.verifyPassword(dto.password, salt)) {
      return user;
    }

    return null;
  }

  public async addToFavorites(userId: string, offerId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { $addToSet: { favorites: offerId } }).exec();
  }

  public async removeFromFavorites(userId: string, offerId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { $pull: { favorites: offerId } }).exec();
  }

  public async getFavorites(userId: string): Promise<DocumentType<OfferEntity>[]> {
    const user = await this.userModel
      .findById(userId)
      .populate('favorites')
      .exec();

    return (user?.favorites as unknown as DocumentType<OfferEntity>[]) ?? [];
  }

  public async setAvatar(userId: string, avatarPath: string): Promise<DocumentType<UserEntity> | null> {
    const result = this.userModel
      .findByIdAndUpdate(userId, { avatarSrc: avatarPath }, { new: true })
      .exec();
    return result as unknown as DocumentType<UserEntity> | null;
  }

  public async exists(userId: string): Promise<boolean> {
    const result = await this.userModel.exists({ _id: userId });
    return result !== null;
  }
}
