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

export class TaskModel extends Model {

  @IsNotEmpty()
  public title: string;

  @IsNotEmpty()
  public projectid: string;

  constructor(body: any) {
    super();
    const { title,projectid } = body;
    this.title=title;
    this.projectid=projectid;
  }
}

export class TaskStatusModel extends Model {

  @IsNotEmpty()
  public status: string;

  constructor(body: any) {
    super();
    const { status,projectid } = body;
    this.status=status;
  }
}