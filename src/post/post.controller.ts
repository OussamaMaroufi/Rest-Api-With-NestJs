import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { postService } from './post.service';
import { CreatePostDto, EditPostDto } from './dto';


@UseGuards(JwtGuard)
@Controller('posts')
export class postController {
  constructor(private postService: postService) {}
  @Get()
  getBookmarks(@GetUser('id') userId: number) {
    return this.postService.getPosts(userId);
  }

  @Get(':id')
  getBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.postService.getPostById(
      userId,
      bookmarkId,
    );
  }

  @Post()
  createBookmark(
    @GetUser('id') userId: number,
    @Body() dto: CreatePostDto,
  ) {
    return this.postService.createPost(userId, dto);
  }

  @Patch(':id')
  editBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
    @Body() dto: EditPostDto,
  ) {
    return this.postService.editPostById(
      userId,
      bookmarkId,
      dto,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.postService.deletePostById(
      userId,
      bookmarkId,
    );
  }
}
