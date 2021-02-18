import {
  IsNotEmpty,
  IsOptional
} from 'class-validator';
import { Model } from '../../model';


export class ReviewModel extends Model {
  @IsNotEmpty()
  public rating: string;

  @IsOptional()
  public title: string;

  constructor(body: any) {
    super();
    const {rating ,title} = body;
    this.rating = rating;
    this.title=title;
  }
}