import { User, Post, Prisma } from '@prisma/client'
import NextCrud, { PrismaAdapter } from '@premieroctet/next-crud'
import { prisma } from '../../../../db'

const handler = async (req: Request) => {
  const nextCrudHandler = await NextCrud({
    adapter: new PrismaAdapter<User | Post, Prisma.ModelName>({
      prismaClient: prisma,
    }),
    swagger: {
      title: 'My API CRUD',
      apiUrl: process.env.API_URL as string,
      config: {
        User: {
          tag: {
            name: 'Users',
          },
        },
        Post: {
          tag: {
            name: 'Posts',
          },
        },
      },
    },
    onError: (req, error) => {
      console.error('Error:', error)
    },
  })

  return nextCrudHandler(req)
}

export { handler as POST, handler as GET, handler as PUT, handler as DELETE }
