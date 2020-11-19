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

export class DeviceModel extends Model {

  @IsNotEmpty()
  public devicetype: string;
  
  @IsNotEmpty()
  public deviceId: number;

  constructor(body: any) {
    super();
    const { deviceId, devicetype } = body;
    this.deviceId = deviceId;
    this.devicetype=devicetype;
  }
}