import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  MaxLength,
  Validate,
} from 'class-validator';

import { Constants } from '../../config/constants';
import { Model } from '../../model';

export class ProjectModel extends Model {

  @IsNotEmpty()
  public name: string;

  constructor(body: any) {
    super();
    const { name } = body;
    this.name=name;
  }
}