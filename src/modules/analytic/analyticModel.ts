import {
  IsNotEmpty,
} from 'class-validator';

import { Constants } from '../../config/constants';
import { Model } from '../../model';

export class AnalyticModel extends Model {

  @IsNotEmpty()
  public openAt: Date;

  @IsNotEmpty()
  public closeAt: Date;

  constructor(body: any) {
    super();
    const { openAt ,closeAt} = body;
    this.openAt=openAt;
    this.closeAt=closeAt;
  }
}