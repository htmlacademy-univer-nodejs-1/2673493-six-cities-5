import { DocumentType } from '@typegoose/typegoose';
import { UserEntity } from './user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginUserDto } from './dto/login-user.dto.js';
import { DocumentExists } from '../../libs/rest/middleware/document-exists.interface.js';
import { OfferEntity } from '../offer/offer.entity.js';

export interface IUserService extends DocumentExists {
  create(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>>;
  findOrCreate(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>>;
  findByEmail(email: string): Promise<DocumentType<UserEntity> | null>;
  findById(userId: string): Promise<DocumentType<UserEntity> | null>;
  verifyUser(dto: LoginUserDto, salt: string): Promise<DocumentType<UserEntity> | null>;
  addToFavorites(userId: string, offerId: string): Promise<void>;
  removeFromFavorites(userId: string, offerId: string): Promise<void>;
  getFavorites(userId: string): Promise<DocumentType<OfferEntity>[]>;
  setAvatar(userId: string, avatarPath: string): Promise<DocumentType<UserEntity> | null>;
  exists(userId: string): Promise<boolean>;
}
