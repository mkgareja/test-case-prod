import {
    IsNotEmpty,
  } from 'class-validator';

import { Model } from '../../model';

export class ResultModel extends Model {

    @IsNotEmpty()
    public status: string;
  
    constructor(body: any) {
      super();
      const { status } = body;
      this.status=status;
    }
}