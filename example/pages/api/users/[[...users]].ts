import NextCrud from 'next-crud'

const handler = NextCrud({
  modelName: 'user',
  resourceName: 'users',
})

export default handler
