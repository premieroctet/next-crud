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
          user: true,
          title: true,
        },
      },
    })

    query = 'select=user,post.user,post.user.post'

    expect(parseQuery(query)).toEqual<IParsedQueryParams>({
      select: {
        user: true,
        post: {
          user: {
            post: true,
          },
        },
      },
    })
  })
})

describe('Parse where', () => {
  it('should parse a simple where condition', () => {
    const query = 'where={"username": "foo"}'

    expect(parseQuery(query)).toEqual<IParsedQueryParams>({
      where: {
        username: 'foo',
      },
    })
  })

  it('should parse where condition with operators', () => {
    const query = 'where={"age": {"$gt": 18}}'

    expect(parseQuery(query)).toEqual<IParsedQueryParams>({
      where: {
        age: { $gt: 18 },
      },
    })
  })

  it('should parse where nested field', () => {
    const query = 'where={"user.age": {"$gt": 18}}'

    expect(parseQuery(query)).toEqual<IParsedQueryParams>({
      where: {
        user: {
          age: {
            $gt: 18,
          },
        },
      },
    })
  })
})
