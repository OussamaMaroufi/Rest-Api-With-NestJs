import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, EditPostDto } from './dto';

@Injectable()
export class postService {
  constructor(private prisma: PrismaService) {}

  getPosts(authorId: number) {
    return this.prisma.post.findMany({
      where: {
        authorId,
      },
    });
  }

  getPostById(authorId: number, postId: number) {
    return this.prisma.post.findFirst({
      where: {
        id: postId,
        authorId,
      },
    });
  }

  async createPost(authorId: number, dto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: {
        authorId,
        ...dto,
      },
    });
    return post;
  }

  async editPostById(
    userId: number,
    postId: number,
    dto: EditPostDto,
  ) {
    // get the bookmark by id
    const post = await this.prisma.post.findUnique({
        where:{
            id:postId
        }
    })
    // check if the user owns the bookmarks
    if(!post || post.authorId !== userId){
        throw new ForbiddenException("Acccess to ressource denied ! ")
    }

    return this.prisma.post.update({
        where:{
            id:postId
        },
        data:{
            ...dto
        }
    })



  }

  async deletePostById(userId: number, postId: number) {

    const post = await this.prisma.post.findUnique({
        where:{
            id:postId
        }
    })
    // check if the user owns the bookmarks
    if(!post || post.authorId !== userId){
        throw new ForbiddenException("Acccess to ressource denied ! ")
    }

    await this.prisma.post.delete({
        where:{

            id:postId
        }
    })

  }
}
