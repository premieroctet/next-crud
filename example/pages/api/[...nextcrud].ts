import { PrismaClient, User } from '@prisma/client'
import NextCrud, { PrismaAdapter } from '@premieroctet/next-crud'
import { prisma } from '../../db'

const resourceNameToModelMap: Record<
  string,
  { modelName: keyof PrismaClient; manyRelations: string[] }
> = {
  users: {
    modelName: 'user',
    manyRelations: ['posts'],
  },
}

const handler = NextCrud({
  paths: [
    {
      resourceName: 'users',
      basePath: '/api/users',
    },
  ],
  adapterFactory: (resourceName) => {
    const modelMap = resourceNameToModelMap[resourceName]
    return new PrismaAdapter<User>({
      modelName: modelMap.modelName,
      manyRelations: modelMap.manyRelations,
      prismaClient: prisma,
    })
  },
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
