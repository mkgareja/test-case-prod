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

import { Model } from '../../model';

export class MergeModel extends Model {

  @IsNotEmpty()
  public source_pid: string;
  
  @IsNotEmpty()
  public destination_pid: string;

  constructor(body: any) {
    super();
    const { source_pid, destination_pid } = body;
    this.source_pid = source_pid;
    this.destination_pid = destination_pid;
  }
}