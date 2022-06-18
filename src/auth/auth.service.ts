import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";

import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import {  ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    //generate password hash
    const hash = await argon.hash(dto.password);
    //save the new user in db

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      //the best way is to work with tranformers
      // delete user.hash;

      //return the saved user
      return this.signToken(user.id, user.email,user.roles);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        //DUPLICATE FIELD
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken !');
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    //find the user by email

    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    //if the user does not exist throw an exception
    if (!user)
      throw new ForbiddenException('Credentials incorrect !');
    //compare a password
    const pwMatches = await argon.verify(
      user.hash,
      dto.password,
    );
    //if password incorrect throw an exception
    if (!pwMatches)
      throw new ForbiddenException('Credentials incorrect !');

    //send back the token
    return this.signToken(user.id, user.email,user.roles);
  }

  //This fct to sing the token

  async signToken(userId: number, email: string,roles:string[]):Promise<{access_token:string}> {
    const payload = {
      sub: userId,
      email,
      roles
    };

    const secret = this.config.get('JWT_SECRET');

    const token =  await this.jwt.signAsync(payload, {
      expiresIn: '25m',
      secret: secret,
    });

    return {
      access_token : token,
    };
  }
}
