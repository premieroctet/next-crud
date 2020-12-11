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
  onSuccess: (req, res) => {
    console.log('request successful')
  },
  onError: (req, res, error) => {
    console.log('error during request', error)
  },
  middlewares: [
    (ctx, next) => {
      console.log('first middleware', ctx.result)
      ctx.result = {
        // @ts-ignore
        myCustomKey: ctx.result,
      }
      next()
    },
    (ctx, next) => {
      console.log('second middleware', ctx.result)
      next()
    },
  ],
  customHandlers: [
    {
      path: '/(.*)/users/custom',
      handler: async ({ res }) => {
        // @ts-ignore
        res.status(200).send('Hello world')
      },
    },
  ],
})

export default handler
