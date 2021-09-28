import { User } from '@prisma/client'
import NextCrud, { PrismaAdapter } from '@premieroctet/next-crud'

const handler = NextCrud({
  resourceName: 'users',
  adapter: new PrismaAdapter<User>({
    modelName: 'user',
    manyRelations: ['posts'],
  }),
  onRequest: (req) => {
    console.log(`request occured on URL ${req.url}`)
  },
  onSuccess: (req, res) => {
    console.log('request successful')
  },
  onError: (req, res, error) => {
    console.log('error during request', error)
  },
  customHandlers: [
    {
      path: '/(.*)/users/custom',
      methods: ['GET', 'POST'],
      handler: async ({ res }) => {
        // @ts-ignore
        res.status(200).send('Hello world')
      },
    },
  ],
  config: {
    pagination: {
      perPage: 2,
    },
  },
})

export default handler
