import { Module } from '@nestjs/common';
import { postService } from './post.service';
import { postController } from './post.controller';

@Module({
  providers: [postService],
  controllers: [postController]
})
export class PostModule {}
