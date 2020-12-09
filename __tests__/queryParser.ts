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

describe('Parse include', () => {
  it('should parse simple include', () => {
    const query = 'include=user,post'

    expect(parseQuery(query)).toEqual<IParsedQueryParams>({
      include: {
        user: true,
        post: true,
      },
    })
  })

  it('should parse nested select', () => {
    let query = 'include=user,post.user,post.title'

    expect(parseQuery(query)).toEqual<IParsedQueryParams>({
      include: {
        user: true,
        post: {
          user: true,
          title: true,
        },
      },
    })

    query = 'include=user,post.user,post.user.post'

    expect(parseQuery(query)).toEqual<IParsedQueryParams>({
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

describe('Parse orderBy', () => {
  it('should parse a correct orderBy', () => {
    const query = 'orderBy={"username": "$asc"}'

    expect(parseQuery(query)).toEqual<IParsedQueryParams>({
      orderBy: {
        username: '$asc',
      },
    })
  })

  it('should throw an error with invalid property', () => {
    const query = 'orderBy={"id": "foo"}'

    expect(() => parseQuery(query)).toThrow()
  })
})

describe('Parse limit', () => {
  it('should parse valid number', () => {
    const query = 'limit=2'

    expect(parseQuery(query)).toEqual<IParsedQueryParams>({
      limit: 2,
    })
  })

  it('should parse invalid number', () => {
    const query = 'limit=foobar'

    expect(parseQuery(query)).toEqual<IParsedQueryParams>({
      limit: undefined,
    })
  })
})

describe('Parse skip', () => {
  it('should parse valid number', () => {
    const query = 'skip=2'

    expect(parseQuery(query)).toEqual<IParsedQueryParams>({
      skip: 2,
    })
  })

  it('should parse invalid number', () => {
    const query = 'skip=foobar'

    expect(parseQuery(query)).toEqual<IParsedQueryParams>({
      skip: undefined,
    })
  })
})

describe('Parse distinct', () => {
  it('should parse distinct', () => {
    const query = 'distinct=id'

    expect(parseQuery(query)).toEqual<IParsedQueryParams>({
      distinct: 'id',
    })
  })
})
