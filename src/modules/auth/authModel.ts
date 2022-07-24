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
import {
  IsEmailAlreadyExistStoreConstraint,
  IsEmailAlreadyExistConstraint,
  IsPasswordMatchesRequirementsConstraint,
} from './authValidator';

export class UserModel extends Model {
  @MaxLength(50)
  @IsNotEmpty()
  public firstname: string;

  @IsEmail()
  @IsNotEmpty()
  @Validate(IsEmailAlreadyExistConstraint, {
    message: 'USER_EMAIL_EXIST',
  })
  public email: string;

  @IsNotEmpty()
  @Validate(IsPasswordMatchesRequirementsConstraint, {
    message: 'ERR_REQUIRED_PASSWORD',
  })
  password: string;


  // public title: string;

  constructor(body: any) {
    super();
    const { email, firstname, password ,deviceId} = body;
    this.firstname = firstname;
    this.email = email;
    this.password= password;
  }
}

export class UserUpdateModel extends Model {

  @IsNotEmpty()
  public firstname: string;

  @IsEmail()
  @IsNotEmpty()
  public email: string;

  constructor(body: any) {
    super();
    const { email, firstname} = body;
    this.firstname = firstname;
    this.email = email;
  }
}
export class UserUpdateModelInvite extends Model {

  @MaxLength(50)
  @IsNotEmpty()
  public firstname: string;

  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsNotEmpty()
  @Validate(IsPasswordMatchesRequirementsConstraint, {
    message: 'ERR_REQUIRED_PASSWORD',
  })
  password: string;


  // public title: string;

  constructor(body: any) {
    super();
    const { email, firstname, password ,deviceId} = body;
    this.firstname = firstname;
    this.email = email;
    this.password= password;
  }
}

export class AuthModel extends Model {

  @IsNotEmpty()
  public email: string;

  public password: string;

  constructor(body: any) {
    super();
    const {email, password } = body;

    this.email = email;
    this.password = password;
  }
}

export class ForgotPasswordModel extends Model {
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  constructor(body: any) {
    super();
    const { email } = body;

    this.email = email;
  }
}

export class ResetPasswordModel extends Model {
  @IsNotEmpty()
  public recoveryCode: string;

  @IsNotEmpty()
  @Validate(IsPasswordMatchesRequirementsConstraint, {
    message: 'ERR_REQUIRED_PASSWORD',
  })
  public password: string;

  @IsEmail()
  @IsNotEmpty()
  public email: string;

  constructor(body: any) {
    super();
    const { recoveryCode, password, email } = body;

    this.recoveryCode = recoveryCode;
    this.password = password;
    this.email = email;
  }
}

export class LoginModel extends Model {
  @IsOptional()
  public deviceToken: string;

  @IsNotEmpty()
  @IsEnum([Constants.DEVICE_TYPE.IOS, Constants.DEVICE_TYPE.ANDROID])
  public deviceType: string;

  @IsNotEmpty()
  @IsNumber()
  public timeZone: number;

  @IsNotEmpty()
  public language: number;

  constructor(body: any) {
    super();
    const { deviceToken, deviceType, timeZone, language } = body;

    this.deviceToken = deviceToken;
    this.deviceType = deviceType;
    this.timeZone = timeZone;
    this.language = language;
  }
}

export class PasswordModel extends Model {
  @IsOptional()
  public oldPassword: string;

  @IsNotEmpty()
  @Validate(IsPasswordMatchesRequirementsConstraint, {
    message: 'ERR_REQUIRED_PASSWORD',
  })
  public newPassword: string;

  constructor(body: any) {
    super();
    const { oldPassword, newPassword } = body;

    this.oldPassword = oldPassword;
    this.newPassword = newPassword;
  }
}
