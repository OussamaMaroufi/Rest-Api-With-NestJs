import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request } from 'express';
import { Roles } from 'src/auth/decorator/role.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Role } from 'src/auth/role.enum';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { EditUserDto } from './dto/edit-user.dto'
import { UserService } from './user.service';

//All Routes now is protetced
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  getMe(@GetUser() user: User) {
    //   console.log({
    //       user:req.user
    //   });

    //, @GetUser('email') email: string : to get a specific data
    // console.log(email);

    return user;
  }

  @Patch()
  editUser(
    @GetUser('id') userId: number,
    @Body() dto: EditUserDto,
  ) {
    return this.userService.editUser(userId, dto);
  }
}
