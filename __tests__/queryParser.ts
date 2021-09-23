import { parseQuery } from '../src/queryParser'
import { IParsedQueryParams } from '../src/types'

describe('Parse select', () => {
  it('should parse simple select', () => {
    const query = 'select=user,post'
    const { originalQuery, ...result } = parseQuery(query)

    expect(result).toEqual<IParsedQueryParams>({
      select: {
        user: true,
        post: true,
      },
    })
  })

  it('should parse nested select 2', () => {
    const query = 'select=user,post.user,post.title'
    const { originalQuery, ...result } = parseQuery(query)

    expect(result).toEqual<IParsedQueryParams>({
      select: {
        user: true,
        post: {
          user: true,
          title: true,
        },
      },
    })
  })

  it('should parse nested select 2', () => {
    const query = 'select=user,post.user,post.user.post'
    const { originalQuery, ...result } = parseQuery(query)

    expect(result).toEqual<IParsedQueryParams>({
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

  it('should fail if select is an array', () => {
    const query = 'select[]=user&select[]=post.user'

    expect(() => parseQuery(query)).toThrowError(
      new Error('select query param must be a string')
    )
  })
})

describe('Parse include', () => {
  it('should parse simple include', () => {
    const query = 'include=user,post'
    const { originalQuery, ...result } = parseQuery(query)

    expect(result).toEqual<IParsedQueryParams>({
      include: {
        user: true,
        post: true,
      },
    })
  })

  it('should parse nested include 1', () => {
    const query = 'include=user,post.user,post.title'
    const { originalQuery, ...result } = parseQuery(query)

    expect(result).toEqual<IParsedQueryParams>({
      include: {
        user: true,
        post: {
          user: true,
          title: true,
        },
      },
    })
  })

  it('should parse nested include 12', () => {
    const query = 'include=user,post.user,post.user.post'
    const { originalQuery, ...result } = parseQuery(query)

    expect(result).toEqual<IParsedQueryParams>({
      include: {
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
    const { originalQuery, ...result } = parseQuery(query)

    expect(result).toEqual<IParsedQueryParams>({
      where: {
        username: 'foo',
      },
    })
  })

  it('should parse where condition with operators', () => {
    const query = 'where={"age": {"$gt": 18}}'
    const { originalQuery, ...result } = parseQuery(query)

    expect(result).toEqual<IParsedQueryParams>({
      where: {
        age: { $gt: 18 },
      },
    })
  })

  it('should parse where nested field', () => {
    const query = 'where={"user.age": {"$gt": 18}}'
    const { originalQuery, ...result } = parseQuery(query)

    expect(result).toEqual<IParsedQueryParams>({
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

describe('Parse orderBy', () => {
  it('should parse a correct orderBy', () => {
    const query = 'orderBy={"username": "$asc"}'
    const { originalQuery, ...result } = parseQuery(query)

    expect(result).toEqual<IParsedQueryParams>({
      orderBy: {
        username: '$asc',
      },
    })
  })

  it('should throw an error with invalid property', () => {
    const query = 'orderBy={"id": "foo"}'

    expect(() => parseQuery(query)).toThrow()
  })

  it('should throw an error with an empty object value', () => {
    const query = 'orderBy={}'

    expect(() => parseQuery(query)).toThrow()
  })
})

describe('Parse limit', () => {
  it('should parse valid number', () => {
    const query = 'limit=2'
    const { originalQuery, ...result } = parseQuery(query)

    expect(result).toEqual<IParsedQueryParams>({
      limit: 2,
    })
  })

  it('should parse invalid number', () => {
    const query = 'limit=foobar'
    const { originalQuery, ...result } = parseQuery(query)

    expect(result).toEqual<IParsedQueryParams>({
      limit: undefined,
    })
  })
})

describe('Parse skip', () => {
  it('should parse valid number', () => {
    const query = 'skip=2'
    const { originalQuery, ...result } = parseQuery(query)

    expect(result).toEqual<IParsedQueryParams>({
      skip: 2,
    })
  })

  it('should parse invalid number', () => {
    const query = 'skip=foobar'
    const { originalQuery, ...result } = parseQuery(query)

    expect(result).toEqual<IParsedQueryParams>({
      skip: undefined,
    })
  })
})

describe('Parse distinct', () => {
  it('should parse distinct', () => {
    const query = 'distinct=id'
    const { originalQuery, ...result } = parseQuery(query)

    expect(result).toEqual<IParsedQueryParams>({
      distinct: 'id',
    })
  })
})
