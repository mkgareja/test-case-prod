import * as jwt from 'jsonwebtoken';

export class Jwt {
  /*
   * getAuthToken
   */
  public static getAuthToken(data: { userId: string; deviceId: number }) {
    return jwt.sign(data, process.env.JWT_SECRET);
  }

  /*
   * decodeAuthToken
   */
  public static decodeAuthToken(token: string) {
    if (token) {
      try {
        return jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        return false;
      }
    }
    return false;
  }
}
