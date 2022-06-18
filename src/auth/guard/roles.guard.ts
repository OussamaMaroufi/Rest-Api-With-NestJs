import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../role.enum';

import jwt_decode from 'jwt-decode';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    //What is the require role
    //this logic to pull up the metadata
    const requiredRoles = this.reflector.getAllAndOverride<
      Role[]
    >('roles', [context.getHandler(), context.getClass()]);

    if (!requiredRoles) {
      return true;
    }

    // console.log(requiredRoles);

    // does the current user making the request have those required roles
    const reqObj = context.switchToHttp().getRequest();

    const Token = reqObj.headers['authorization'].split(' ')[1]
    const decode = jwt_decode(Token)
    const Roles = decode['roles'];
    
    return requiredRoles.some((role) => Roles.includes(role));

  }
}
