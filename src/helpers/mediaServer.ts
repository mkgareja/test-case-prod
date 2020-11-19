import * as request from 'request';
import { Log } from './logger';

export class MediaServer {
  public static upload(file, type) {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        url: process.env.MEDIA_SERVER,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        formData: {
          file: {
            value: file.data,
            options: {
              filename: file.name,
              contentType: file.mimetype,
            },
          },
          type,
        },
      };

      request(options, async (error: any, response: any, body: any) => {
        if (response) {
          Log.getLogger().info(`Media SErver ${response.body}`);
          resolve({
            statusCode: response.statusCode,
            data: JSON.parse(response.body),
          });
        } else {
          Log.getLogger().error(`Media SErver ${error}`);
          reject(error);
        }
      });
    });
  }

  public static getURL(attachment, attachmentThumb) {
    return {
      original: attachment ? `${process.env.MEDIA_SERVER_PATH}/${attachment.name}` : null,
      thumb: attachmentThumb ? `${process.env.MEDIA_SERVER_PATH}/${attachmentThumb.name}` : null,
    };
  }
}
