import * as jwt from 'jsonwebtoken';

export class Jwt {
  /*
   * getAuthToken
   * expiresIn : 60*60*48 //48 hrs
   */
  public static getAuthToken(data: { userId: string; deviceId: number }) {
    return jwt.sign(data,process.env.JWT_SECRET,{ expiresIn: 60*60*48 });
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
