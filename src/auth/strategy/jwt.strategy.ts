import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

//This class also a provider so it injectable
@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt',
) {
  constructor(
    //we dont use a private in config because super called before any thing else 
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      //Here that mean that is extractred from Header as a Bearer Token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      //Here to ignore a exp
      ignoreExpiration: false,
      //we need a secret to verify the token
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; email: string }) {
    // console.log({ payload });
    //by returning the payload it is going to append the payload to the user object of request object
    //==>req.user  = payload
    const user  = await this.prisma.user.findUnique({
        where:{
            id:payload.sub
        }
    });
    delete user.hash
    return user;
  }
}
