import { User } from '@prisma/client'
import NextCrud, { PrismaAdapter } from 'next-crud'

const handler = NextCrud({
  resourceName: 'users',
  adapter: new PrismaAdapter<User>({
    modelName: 'user',
  }),
  onRequest: (req) => {
    console.log(`request occured on URL ${req.url}`)
  },
  onSuccess: () => {
    console.log('request successful')
  },
  onError: (req, res, error) => {
    console.log('error during request', error)
  },
})

export default handler
