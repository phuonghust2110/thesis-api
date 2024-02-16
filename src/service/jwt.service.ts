import * as jwt from 'jsonwebtoken';

// export const EXP_TOKEN = 3600;
export const EXP_TOKEN = 3600;


export class JwtService {
  static generate(payload: object, secretKey: string) {
    return jwt.sign(
      { ...payload, exp: Math.floor(Date.now() / 1000) + EXP_TOKEN },
      secretKey,
    );
  }

  static verify(token: string, secretKey: string) {
    return jwt.verify(token.replace('Bearer ', ''), secretKey);
  }
  static decode(headers) {
    return jwt.decode(headers['authorization'].replace('Bearer ', ''));
  }

  static decodeToken(token: string) {
    return jwt.decode(token.replace('Bearer ', ''));
  }
}
