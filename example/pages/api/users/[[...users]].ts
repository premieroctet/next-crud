import { User } from '@prisma/client'
import NextCrud, { PrismaAdapter } from 'next-crud'

const handler = NextCrud({
  resourceName: 'users',
  adapter: new PrismaAdapter<User>({
    modelName: 'user',
  }),
})

export default handler
