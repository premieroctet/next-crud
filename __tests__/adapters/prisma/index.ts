import { getMockReq, getMockRes } from '@jest-mock/express'
import NextCrud from '../../../src/handler'
import PrismaAdapter from '../../../src/adapters/prisma'
import { User } from '@prisma/client'
import prisma from './client'
import { NextApiHandler } from 'next'
import { createSeedData } from './seed'

describe('Prisma interraction', () => {
  beforeAll(async () => {
    await createSeedData()
  })
  let adapter: PrismaAdapter<User>
  let handler: NextApiHandler<User>

  beforeEach(() => {
    adapter = new PrismaAdapter<User>({
      modelName: 'user',
      manyRelations: ['post.author', 'comment.post', 'comment.author'],
    })

    handler = NextCrud({
      adapter,
      resourceName: 'users',
    })
  })

  it('should get the list of users', async () => {
    const { res } = getMockRes()
    const req = getMockReq({
      url: '/api/users',
      method: 'GET',
    })

    const expectedResult = await prisma.user.findMany()

    await handler(req, res)

    expect(res.send).toHaveBeenCalledWith(expectedResult)
  })

  it('should get a page based paginated users list', async () => {
    const { res } = getMockRes()
    const req = getMockReq({
      url: '/api/users?page=2&limit=2',
      method: 'GET',
    })

    const expectedResult = await prisma.user.findMany({
      skip: 2,
      take: 2,
    })

    await handler(req, res)

    expect(res.send).toHaveBeenCalledWith({
      data: expectedResult,
      pagination: {
        total: 4,
        pageCount: 2,
        page: 2,
      },
    })
  })

  it('should get the user with first id', async () => {
    const user = await prisma.user.findFirst()

    const { res } = getMockRes()
    const req = getMockReq({
      url: `/api/users/${user.id}`,
      method: 'GET',
    })

    await handler(req, res)

    expect(res.send).toHaveBeenCalledWith(user)
  })

  it('should get the list of users with only their email', async () => {
    const { res } = getMockRes()
    const req = getMockReq({
      url: '/api/users?select=email',
      method: 'GET',
    })

    const expectedResult = await prisma.user.findMany({
      select: {
        email: true,
      },
    })

    await handler(req, res)

    expect(res.send).toHaveBeenCalledWith(expectedResult)
  })

  it('should get the list of users with only their email and posts', async () => {
    const { res } = getMockRes()
    const req = getMockReq({
      url: '/api/users?select=email,posts',
      method: 'GET',
    })

    const expectedResult = await prisma.user.findMany({
      select: {
        email: true,
        posts: true,
      },
    })

    await handler(req, res)

    expect(res.send).toHaveBeenCalledWith(expectedResult)
  })

  it('should get the list of users with only their email and posts ids', async () => {
    const { res } = getMockRes()
    const req = getMockReq({
      url: '/api/users?select=email,posts,posts.id',
      method: 'GET',
    })

    const expectedResult = await prisma.user.findMany({
      select: {
        email: true,
        posts: {
          select: {
            id: true,
          },
        },
      },
    })

    await handler(req, res)

    expect(res.send).toHaveBeenCalledWith(expectedResult)
  })

  it('should get the list of users with only their email, posts ids, comments and comments users', async () => {
    const { res } = getMockRes()
    const req = getMockReq({
      url: '/api/users?select=email,posts,posts.id,posts.comment,posts.comment.author',
      method: 'GET',
    })

    const expectedResult = await prisma.user.findMany({
      select: {
        email: true,
        posts: {
          select: {
            id: true,
            comment: {
              select: {
                author: true,
              },
            },
          },
        },
      },
    })

    await handler(req, res)

    expect(res.send).toHaveBeenCalledWith(expectedResult)
  })

  it('should return the first 2 users', async () => {
    const { res } = getMockRes()
    const req = getMockReq({
      url: '/api/users?limit=2',
      method: 'GET',
    })

    const expectedResult = await prisma.user.findMany({
      take: 2,
    })

    await handler(req, res)

    expect(res.send).toHaveBeenCalledWith(expectedResult)
  })

  it('should return 2 users after the first 2 ones', async () => {
    const { res } = getMockRes()
    const req = getMockReq({
      url: '/api/users?skip=2&limit=2',
      method: 'GET',
    })

    const expectedResult = await prisma.user.findMany({
      take: 2,
      skip: 2,
    })

    await handler(req, res)

    expect(res.send).toHaveBeenCalledWith(expectedResult)
  })

  it('should return 2 users based on a cursor', async () => {
    const firstUser = await prisma.user.findFirst()

    const { res } = getMockRes()
    const req = getMockReq({
      url: `/api/users?limit=2&cursor={"id":${firstUser.id}}`,
      method: 'GET',
    })

    const expectedResult = await prisma.user.findMany({
      take: 2,
      cursor: {
        id: firstUser.id,
      },
    })

    await handler(req, res)

    expect(res.send).toHaveBeenCalledWith(expectedResult)
  })

  it('should filter user by its email', async () => {
    const { res } = getMockRes()
    const req = getMockReq({
      url: `/api/users?where={"email":{"$eq":"johndoe1@gmail.com"}}`,
      method: 'GET',
    })

    const expectedResult = await prisma.user.findMany({
      where: {
        email: {
          equals: 'johndoe1@gmail.com',
        },
      },
    })

    await handler(req, res)

    expect(res.send).toHaveBeenCalledWith(expectedResult)
  })

  it('should filter users where email does not match', async () => {
    const { res } = getMockRes()
    const req = getMockReq({
      url: `/api/users?where={"email":{"$neq":"johndoe1@gmail.com"}}`,
      method: 'GET',
    })

    const expectedResult = await prisma.user.findMany({
      where: {
        email: {
          not: 'johndoe1@gmail.com',
        },
      },
    })

    await handler(req, res)

    expect(res.send).toHaveBeenCalledWith(expectedResult)
  })

  it('should filter users where email starts with john and ends with .com', async () => {
    const { res } = getMockRes()
    const req = getMockReq({
      url: `/api/users?where={"email":{"$and":{"$starts":"john", "$ends":".com"}}}`,
      method: 'GET',
    })

    const expectedResult = await prisma.user.findMany({
      where: {
        AND: [
          { email: { startsWith: 'john' } },
          { email: { endsWith: '.com' } },
        ],
      },
    })

    await handler(req, res)

    expect(res.send).toHaveBeenCalledWith(expectedResult)
  })

  it('should create a user', async () => {
    const { res } = getMockRes()
    const req = getMockReq({
      url: `/api/users`,
      method: 'POST',
      body: {
        email: 'createdjohn@gmail.com',
      },
    })

    await handler(req, res)

    const expectedResult = await prisma.user.findFirst({
      where: {
        email: 'createdjohn@gmail.com',
      },
    })

    expect(res.send).toHaveBeenCalledWith(expectedResult)
  })

  it('should update a user', async () => {
    const user = await prisma.user.findFirst({
      where: {
        email: 'createdjohn@gmail.com',
      },
    })
    const { res } = getMockRes()
    const req = getMockReq({
      url: `/api/users/${user.id}`,
      method: 'PATCH',
      body: {
        email: 'updated@gmail.com',
      },
    })

    await handler(req, res)

    const expectedResult = await prisma.user.findFirst({
      where: {
        email: 'updated@gmail.com',
      },
    })

    expect(res.send).toHaveBeenCalledWith(expectedResult)
  })

  it('should update a user and respond with only its email', async () => {
    const user = await prisma.user.findFirst({
      where: {
        email: 'updated@gmail.com',
      },
    })
    const { res } = getMockRes()
    const req = getMockReq({
      url: `/api/users/${user.id}?select=email`,
      method: 'PATCH',
      body: {
        email: 'updated1@gmail.com',
      },
    })

    await handler(req, res)

    const expectedResult = await prisma.user.findFirst({
      where: {
        email: 'updated1@gmail.com',
      },
      select: {
        email: true,
      },
    })

    expect(res.send).toHaveBeenCalledWith(expectedResult)
  })

  it('should delete the previously created user', async () => {
    const user = await prisma.user.findFirst({
      where: {
        email: 'updated1@gmail.com',
      },
    })
    const { res } = getMockRes()
    const req = getMockReq({
      url: `/api/users/${user.id}`,
      method: 'DELETE',
    })

    await handler(req, res)

    expect(res.send).toHaveBeenCalledWith(user)
  })

  afterAll(async () => {
    await prisma.comment.deleteMany()
    await prisma.post.deleteMany()
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })
})
