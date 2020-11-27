import { parseQuery } from '../src/queryParser'
import { IParsedQueryParams } from '../src/types'

describe('Parse select', () => {
  it('should parse simple select', () => {
    const query = 'select=user,post'

    expect(parseQuery(query)).toEqual<IParsedQueryParams>({
      select: {
        user: true,
        post: true,
      },
    })
  })

  it('should parse nested select', () => {
    let query = 'select=user,post.user,post.title'

    expect(parseQuery(query)).toEqual<IParsedQueryParams>({
      select: {
        user: true,
        post: {
          select: {
            user: true,
            title: true,
          },
        },
      },
    })

    query = 'select=user,post.user,post.user.post'

    expect(parseQuery(query)).toEqual<IParsedQueryParams>({
      select: {
        user: true,
        post: {
          select: {
            user: {
              select: {
                post: true,
              },
            },
          },
        },
      },
    })
  })
})
