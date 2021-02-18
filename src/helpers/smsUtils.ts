import * as request from 'request';
import * as dotenv from 'dotenv';
import { Log } from './logger';
dotenv.config();

import { Constants } from '../config/constants';

export class SMSUtils {
  // getting ready

  private static logger = Log.getLogger();

  public static createOtp = () => {
    return Math.floor(100000 + Math.random() * 900000);
  };

  public static sendOtp = async (otpData, numbers) => {
    const text = `${otpData.otp} ${Constants.OTP_SMS_POSTFIX}`;
    return new Promise((resolve, reject) => {
      let requestURL = `${process.env.BROWSER_URL}`;
      requestURL = requestURL.replace("%username", process.env.BROWSER_USERNAME);
      requestURL = requestURL.replace("%password", process.env.BROWSER_PASSWORD);
      requestURL = requestURL.replace("%sender", process.env.BROWSER_SENDER);
      requestURL = requestURL.replace("%number", numbers);
      requestURL = requestURL.replace("%message", text);
      const options = {
        method: 'GET',
        url: requestURL,
      };

      request(options, async (error: any, response: any, body: any) => {
      if (response.statusCode === 200) {
          resolve({
            statusCode: response.statusCode,
            isSuccess: true,
          });
        } else {
          Log.getLogger().error(`requestToken ${error}`);
          reject();
        }
      });
    });
  };
}
