import { TPrismaRecursive } from '../../../../src/adapters/prisma/types'
import { parsePrismaRecursiveField } from '../../../../src/adapters/prisma/utils/parseRecursive'

describe('Prisma parse recursive', () => {
  it('should parse select to prisma select', () => {
    expect(
      parsePrismaRecursiveField(
        {
          post: true,
          user: {
            post: true,
          },
          session: {
            user: {
              post: true,
            },
          },
        },
        'select'
      )
    ).toEqual<TPrismaRecursive<'select'>>({
      post: true,
      user: {
        select: {
          post: true,
        },
      },
      session: {
        select: {
          user: {
            select: {
              post: true,
            },
          },
        },
      },
    })
  })

  it('should parse include to prisma include', () => {
    expect(
      parsePrismaRecursiveField(
        {
          post: true,
          user: {
            post: true,
          },
          session: {
            user: {
              post: true,
            },
          },
        },
        'include'
      )
    ).toEqual<TPrismaRecursive<'include'>>({
      post: true,
      user: {
        include: {
          post: true,
        },
      },
      session: {
        include: {
          user: {
            include: {
              post: true,
            },
          },
        },
      },
    })
  })
})
