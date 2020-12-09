import { User } from '@prisma/client'
import NextCrud from 'next-crud'
import PrismaAdapter from 'next-crud/dist/adapters/prisma'

const handler = NextCrud({
  resourceName: 'users',
  adapter: new PrismaAdapter<User>({
    modelName: 'user',
  }),
})

export default handler
