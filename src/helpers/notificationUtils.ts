import * as dotenv from 'dotenv';
import * as FCM from 'fcm-node';
import { Constants } from '../config/constants';
import { Log } from './logger';
import * as mysql from 'jm-ez-mysql';
import { Tables, DeviceTable } from '../config/tables';
import { SendEmail } from './sendEmail';
dotenv.config();

export class NotificationUtil {
  public static sendNotification = async (
    tokens: JsonArray,
    result: Json,
    payload: Json,
    deviceType: string
  ) => {
    const serverKey = process.env.NOTIFICATION_KEY; // put your server key here
    const fcm = new FCM(serverKey);
    const deviceTypes = [Constants.DEVICE_TYPE.ANDROID, Constants.DEVICE_TYPE.IOS];
    const message: any = {
      registration_ids: tokens,
      collapse_key: '',
      notification: result.notification,
      data: payload,
    };
    if (result && result.sound) {
      message.notification.sound = result.sound;
    }
    if (deviceTypes.includes(deviceType)) {
      const { subject, body, badge, sound } = message.notification;
      message.data.subject = subject;
      message.data.body = body;
      message.data.badge = badge;
      message.data.sound = sound;
      delete message.notification;
      delete message.payload;
    }
    fcm.send(message, (err: any, response: any) => {
      if (err) {
        NotificationUtil.logger.info(`Notification Err: ${err}`);
      } else {
        NotificationUtil.logger.info(`Notification Sent: ${response}`);
      }
    });
  };
  private static logger: any = Log.getLogger();

  // Get User devices
  public static getDevices = async (id: number) => {
    return await mysql.findAll(
      Tables.DEVICE,
      [
        DeviceTable.ID,
        DeviceTable.DEVICE_TOKEN,
        DeviceTable.USER_ID,
        DeviceTable.DEVICE_TYPE,
      ],
      `${DeviceTable.DEVICE_TOKEN} IS NOT NULL AND ${DeviceTable.USER_ID} = ?`,
      [id]
    );
  };

  // proceed push notifications
  public static processPushNotification = async (
    id: number,
    notificationText: string,
    subject: string,
    payload: Json
  ) => {
    const devices = await NotificationUtil.getDevices(id);
    // const tokens = devices.map((device: Json) => device.deviceToken);
    const iOSDevices = devices.filter(
      (device: Json) => device.deviceType === Constants.DEVICE_TYPE.IOS
    );
    const androidDevices = devices.filter(
      (device: Json) => device.deviceType === Constants.DEVICE_TYPE.ANDROID
    );
    const notificationData = {
      to: '',
      content_available: true,
      notification: {
        subject,
        body: notificationText,
        badge: 0,
      },
      data: payload,
      sound: Constants.NOTIFICATION_SOUND,
    };
    if (iOSDevices.length > 0) {
      const iOSTokens = iOSDevices.map((device: Json) => device.fcmToken);
      NotificationUtil.sendNotification(
        iOSTokens,
        notificationData,
        payload,
        Constants.DEVICE_TYPE.IOS
      );
    }
    if (androidDevices.length > 0) {
      const androidTokens = androidDevices.map((device: Json) => device.fcmToken);
      NotificationUtil.sendNotification(
        androidTokens,
        notificationData,
        payload,
        Constants.DEVICE_TYPE.ANDROID
      );
    }
    // tslint:disable-next-line: prefer-for-of
    for (let n = 0; n < devices.length; n++) {
      const detail = {
        subject,
        moduleId: payload.moduleId,
        itemId: payload.itemId,
        body: notificationText,
        deviceId: devices[n].id,
      };
      await NotificationUtil.userNotificationEntry(detail);
    }
  };

  // proceed email notifications
  public async processEmailNotification(
    id: number,
    emailText: string,
    title: string,
    toSend: boolean
  ) {
    if (toSend) {
      const userEmail = await mysql.first(Tables.USER, 'email', 'id = ?', [id]);
      const data = {
        '{TITLE}': title,
        '{TEXT}': emailText,
      };
      SendEmail.sendRawMail('notification', data, [userEmail.email.toString()], title); // sending email
    }
    return;
  }

  // Create notification entry
  public static staffNotificationEntry = async (detail) => {
    return await mysql.insert(Tables.STAFF_NOTIFICATIONS, detail);
  };

  // Create notification entry
  public static userNotificationEntry = async (detail) => {
    return await mysql.insert(Tables.USER_NOTIFICATIONS, detail);
  };
}
