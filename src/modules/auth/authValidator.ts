import PhoneNumber from 'awesome-phonenumber';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import * as mysql from 'jm-ez-mysql';
import { Tables } from '../../config/tables';

@ValidatorConstraint({ async: true })
export class IsEmailAlreadyExistConstraint implements ValidatorConstraintInterface {
  public async validate(email: string, args: any) {
    let condition = `email = '${email}'`;
    if (args.object.id) {
      condition += ` AND id != ${args.object.id}`;
    }
    const user = await mysql.first(Tables.USER, ['id'], condition);
    if (user) {
      return false;
    }
    return true;
  }
}

@ValidatorConstraint({ async: true })
export class IsEmailAlreadyExistStoreConstraint implements ValidatorConstraintInterface {
  public async validate(email: string, args: any) {
    let condition = `email = '${email}'`;
    if (args.object.id) {
      condition += ` AND soId != ${args.object.soId}`;
    }
    const user = await mysql.first(Tables.STOREOWNER, ['soId'], condition);
    if (user) {
      return false;
    }
    return true;
  }
}

@ValidatorConstraint({ async: true })
export class IsPhoneNumberExistsConstraint implements ValidatorConstraintInterface {
  public async validate(mobileNumber: string, args: any) {
    let condition = `mobileNumber = '${mobileNumber}'`;
    if (args.object.id) {
      condition += ` AND id != ${args.object.id}`;
    }
    const staff = await mysql.first(Tables.USER, ['id'], condition);
    if (staff) {
      return false;
    }
    return true;
  }
}

@ValidatorConstraint({ async: false })
export class IsPasswordMatchesRequirementsConstraint implements ValidatorConstraintInterface {
  public validate(password: string, args: ValidationArguments) {
    const regex = new RegExp('^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$');
    return regex.test(password);
  }
}

@ValidatorConstraint({ async: false })
export class IsPhoneNumberValidConstraint implements ValidatorConstraintInterface {
  public validate(mobileNumber: string, args: ValidationArguments) {
    const phoneNo = new PhoneNumber(mobileNumber, process.env.DEFAULT_COUNTRY_CODE);
    return (
      (args.property === 'mobileNumber' && phoneNo.isValid()) ||
      (phoneNo.isValid() && phoneNo.isMobile())
    );
  }
}
