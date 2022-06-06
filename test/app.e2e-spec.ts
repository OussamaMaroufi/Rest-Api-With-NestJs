import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';

import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from '../src/user/dto/edit-user.dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  //Hook provided by jest to run that script before all test
  //STARTING LOGIC
  beforeAll(async () => {
    //simulate our server
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    //Our testing Application
    app = moduleRef.createNestApplication();
    //use validation pipe to make the app like the real app
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    //cmd to launch the test server
    await app.init();
    //Launch the app
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDB();
    pactum.request.setBaseUrl('http://localhost:3333');
  });
  //After all the test runed we close the appp
  //TEARDOWN LOGIC
  afterAll(() => {
    app.close();
  });

  //make it globally to use it in all test case
  const dto: AuthDto = {
    email: 'oussama@gmail.com',
    password: 'testingpass',
  };

  describe('Auth', () => {

    describe('Signup', () => {

      test('Should throw an exception if email is empty ', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password:dto.password
          })
          .expectStatus(400);
        // .inspect();
      });

      test('Should throw an exception if password is empty ', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email:dto.email
          })
          .expectStatus(400);
        // .inspect();
      });

      test('Should throw an exception if no body body provided ', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400);
        // .inspect();
      });

      test('Should Signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
        // .inspect();
      });
    });

    describe('Signin', () => {

      test('Should throw an exception if email is empty ', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password:dto.password
          })
          .expectStatus(400);
        // .inspect();
      });
      test('Should throw an exception if password is empty ', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email:dto.email
          })
          .expectStatus(400);
        // .inspect();
      });
      test('Should throw an exception if no body body provided ', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400);
        // .inspect();
      });

      test('Should Signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          // .inspect();
          //store the access token(extracted from the body) in a var 
          .stores("userAt","access_token")
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      test("Should get the current user",()=>{
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization:'Bearer $S{userAt}'
          })
          .expectStatus(200)
          .inspect();
      })
    });

    describe('Edit user', () => {
      test("Should edit user",()=>{

        const dto:EditUserDto = {
          firstName:"Oussama",
          email:"oussamamaaroufi@gmail.com"
        }
        return pactum
          .spec()
          .patch('/users/')
          .withHeaders({
            Authorization:'Bearer $S{userAt}'
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.email)
          .expectBodyContains(dto.firstName)

          // .inspect();
      })
    });
  });

  describe('Bookmark', () => {
    describe('Get empty bookmarks', () => {
      test("Should get bookmarks",()=>{
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization:'Bearer $S{userAt}'
          })
          .expectStatus(200)
          .expectBody([])
          .inspect();
      })
    });

    describe('Create bookmark', () => {

      const dto:CreateBookmarkDto = {
        title:'First Bookmark',
        link:'https://www.youtube.com/watch?v=GHTA143_b-s&t=9726s'

      }
      test("Should create a bookmark",()=>{
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization:'Bearer $S{userAt}'
          })
          .withBody(dto)
          .expectStatus(201)
          .stores("bookmarkId",'id')
          .inspect();
      })
    });
    describe('Get bookmarks', () => {
      test("Should get a bookmarks",()=>{
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization:'Bearer $S{userAt}'
          })
          .expectStatus(200)
          .expectJsonLength(1)
          .inspect();
      })
    });
    describe('Get bookmark by id', () => {
      test("Should get a bookmark by id ",()=>{
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id','$S{bookmarkId}')
          .withHeaders({
            Authorization:'Bearer $S{userAt}'
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')
          .inspect();
      })
    });
    describe('Edit bookmark by id', () => {

      const dto :EditBookmarkDto = {
          title:"Nest js course ",
          description:"Learn How to build a rest api with nest js framework"
      }
      test("Should edit a bookmark  ",()=>{
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id','$S{bookmarkId}')
          .withBody(dto)
          .withHeaders({
            Authorization:'Bearer $S{userAt}'
          })
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description)
      })

    });
    describe('Delete bookmark by id', () => {
      test("Should delete a bookmark  ",()=>{
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id','$S{bookmarkId}')
          .withHeaders({
            Authorization:'Bearer $S{userAt}'
          })
          .expectStatus(204)

      })
    });
  });

  test("Should get bookmarks",()=>{
    return pactum
      .spec()
      .get('/bookmarks')
      .withHeaders({
        Authorization:'Bearer $S{userAt}'
      })
      .expectStatus(200)
      .expectJsonLength(0)
      .inspect();
  })

  
});
