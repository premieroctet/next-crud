import { User, UserInclude } from '@prisma/client'
import NextCrud, { PrismaAdapter } from '@premieroctet/next-crud'

const handler = NextCrud({
  resourceName: 'users',
  adapter: new PrismaAdapter<User, UserInclude>({
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
      methods: ['GET', 'POST'],
      handler: async ({ res }) => {
        // @ts-ignore
        res.status(200).send('Hello world')
      },
    },
  ],
})

export default handler
