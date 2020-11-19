import * as mysql from 'jm-ez-mysql';
import * as moment from 'moment';

import { Constants } from '../../config/constants';
import { Tables, UserTable, DeviceTable,StaticContentTable } from '../../config/tables';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import { LoginModel } from './authModel';
import { SMSUtils } from '../../helpers/smsUtils';
import { SendEmail } from '../../helpers/sendEmail';
import * as path from 'path';
import * as l10n from 'jm-ez-l10n';

export class AuthUtils {
  // Create User
  public async createUser(userDetail: Json): Promise<ResponseBuilder> {
    const newUser = await mysql.insert(Tables.USER, userDetail);
    return ResponseBuilder.data({ id: newUser.insertId });
  }

  public async updateUser(uid: number , userInfo: Json): Promise<ResponseBuilder> {
    const result = await mysql.updateFirst(Tables.USER, userInfo, `${UserTable.ID} = ?`, [uid]);
    if (result.affectedRows > 0) {
      return ResponseBuilder.data({ status: true,data:result});
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }

  // check user email is exists or not
  public async checkUserMobileNumberExists(mobileNumber: string) {
    return await mysql.first(
      Tables.USER,
      [
        UserTable.ID,
        UserTable.FIRSTNAME,
        UserTable.LASTNAME,
        UserTable.EMAIL,
        UserTable.MOBILE_NUMBER,
        UserTable.PASSWORD
      ],
      `${UserTable.MOBILE_NUMBER} = ?
      AND ${UserTable.IS_ENABLE} = 1
      AND ${UserTable.IS_DELETE} = 0`,
      [mobileNumber]
    );
  }

    // check user email is exists or not
    public async checkUserEmailExists(email: string) {
      return await mysql.first(
        Tables.USER,
        [
          UserTable.ID,
          UserTable.FIRSTNAME,
          UserTable.EMAIL,
          UserTable.PASSWORD,
          UserTable.IS_ENABLE,
          UserTable.ZIPCODE
        ],
        `${UserTable.EMAIL} = ?
        AND ${UserTable.IS_ENABLE} = 1
        AND ${UserTable.IS_DELETE} = 0`,
        [email]
      );
    }
  // send otp
  public async sendOtp(countryCode, mobile) {
    const registered = await mysql.first(
      Tables.USER,
      [UserTable.ID],
      `${UserTable.COUNTRY_CODE} = ${countryCode} AND ${UserTable.MOBILE_NUMBER} = ?`,
      [mobile]
    );
    if (!registered) {
      return ResponseBuilder.data({ registered: false });
    }
    const code = await SMSUtils.createOtp();
    const otpData = {
      otp: code,
      otpExpireAt: moment()
        .add(Constants.OTP_EXPIRE_LIMIT, 'minutes')
        .format(Constants.DATA_BASE_DATE_TIME_FORMAT),
    };
    await mysql.updateFirst(Tables.USER, otpData, `${UserTable.MOBILE_NUMBER} = ?`, [
      mobile,
      mobile,
    ]);
    SMSUtils.sendOtp(otpData, `${countryCode.replace("+", "")}${mobile}`);
    return ResponseBuilder.data({ registered: true });
  }
  //send email
  public async sendEmail(email) {
    const registered = await mysql.first(
      Tables.USER,
      [UserTable.ID,UserTable.FIRSTNAME],
      `${UserTable.EMAIL} = ?`,
      [email]
    );
    if (!registered) {
      return ResponseBuilder.data({ registered: false });
    }
    const code = await SMSUtils.createOtp();
    const otpData = {
      recoveryCode: code
    };
    let result = await mysql.updateFirst(Tables.USER, otpData, `${UserTable.EMAIL} = ?`, [
      email,
      email,
    ]);
    const replaceData = {
      '{USERNAME}':registered.firstname,
      '{CODE}': code
    };
    if(result){
      SendEmail.sendRawMail('otp', replaceData, email.toString(),l10n.t('RECOVERY_CODE')); // sending email
      return ResponseBuilder.data({ registered: true });
    }
  }
  // update User by Id
  public async updateUserDetails(details: Json, id: number): Promise<ResponseBuilder> {
    const updatedUser = await mysql.updateFirst(Tables.USER, details, `${UserTable.ID} = ?`, [id]);
    return ResponseBuilder.data(updatedUser);
  }

  // Add login related information entry in userLogins table when app installed and open by any user
  public async setDeviceInformation(deviceDetails: Json): Promise<ResponseBuilder> {
    const newDevice = await mysql.insert(Tables.DEVICE, deviceDetails);
    return ResponseBuilder.data({ id: newDevice.insertId });
  }

  // Update device related information entry in devices table when device changed or on logout or something
  public async updateDeviceInformation(deviceDetails: Json, id: number) {
     const result =await mysql.updateFirst(Tables.DEVICE, deviceDetails, `${DeviceTable.ID} = ?`, [id]);
      if(result.affectedRows>0){
          return ResponseBuilder.data({ status:true});
      }else{
          return ResponseBuilder.data({ status:false});
      }
  }

  // Get User devices
  public async checkDeviceRegistered(id: number) {
    return await mysql.first(Tables.DEVICE, [DeviceTable.ID], `${DeviceTable.ID} = ?`, [id]);
  }

}
