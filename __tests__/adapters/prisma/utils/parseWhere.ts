import { TPrismaWhereField } from '../../../../src/adapters/prisma/types'
import { parsePrismaWhere } from '../../../../src/adapters/prisma/utils/parseWhere'
import { TWhereField } from '../../../../src/types'

describe('Prisma parse where', () => {
  it('should mirror basic primitives', () => {
    const baseQuery = {
      username: 'foobar',
      id: 1,
    }

    expect(parsePrismaWhere(baseQuery, [])).toEqual<TPrismaWhereField>(
      baseQuery
    )
  })

  it('should handle operators', () => {
    const baseQuery: TWhereField = {
      username: {
        $cont: 'foo',
      },
      id: {
        $neq: 1,
      },
    }

    expect(parsePrismaWhere(baseQuery, [])).toEqual<TPrismaWhereField>({
      username: {
        contains: 'foo',
      },
      id: {
        not: 1,
      },
    })
  })

  it('should mirror $isnull value to null', () => {
    const baseQuery: TWhereField = {
      username: '$isnull',
    }

    expect(parsePrismaWhere(baseQuery, [])).toEqual<TPrismaWhereField>({
      username: null,
    })
  })

  it('should parse $and', () => {
    let baseQuery: TWhereField = {
      $and: {
        username: {
          $cont: 'foo',
        },
        id: 1,
      },
    }

    expect(parsePrismaWhere(baseQuery, [])).toEqual<TPrismaWhereField>(
      // @ts-ignore
      {
        AND: {
          username: {
            contains: 'foo',
          },
          id: 1,
        },
      }
    )

    baseQuery = {
      $and: {
        username: {
          $cont: 'foo',
        },
        'posts.author.id': 1,
      },
    }

    expect(
      parsePrismaWhere(baseQuery, ['posts.author'])
    ).toEqual<TPrismaWhereField>(
      // @ts-ignore
      {
        AND: {
          username: {
            contains: 'foo',
          },
          posts: {
            some: {
              author: {
                some: {
                  id: 1,
                },
              },
            },
          },
        },
      }
    )
  })

  it('should parse $or', () => {
    let baseQuery: TWhereField = {
      $or: {
        username: {
          $cont: 'foo',
        },
        id: 1,
      },
    }

    expect(parsePrismaWhere(baseQuery, [])).toEqual<TPrismaWhereField>(
      // @ts-ignore
      {
        OR: {
          username: {
            contains: 'foo',
          },
          id: 1,
        },
      }
    )

    baseQuery = {
      $or: {
        username: {
          $cont: 'foo',
        },
        'posts.author.id': 1,
      },
    }

    expect(
      parsePrismaWhere(baseQuery, ['posts.author'])
    ).toEqual<TPrismaWhereField>(
      // @ts-ignore
      {
        OR: {
          username: {
            contains: 'foo',
          },
          posts: {
            some: {
              author: {
                some: {
                  id: 1,
                },
              },
            },
          },
        },
      }
    )
  })

  it('should parse $not', () => {
    let baseQuery: TWhereField = {
      $not: {
        username: {
          $cont: 'foo',
        },
        id: 1,
      },
    }

    expect(parsePrismaWhere(baseQuery, [])).toEqual<TPrismaWhereField>(
      // @ts-ignore
      {
        NOT: {
          username: {
            contains: 'foo',
          },
          id: 1,
        },
      }
    )

    baseQuery = {
      $not: {
        username: {
          $cont: 'foo',
        },
        'posts.author.id': 1,
      },
    }

    expect(
      parsePrismaWhere(baseQuery, ['posts.author'])
    ).toEqual<TPrismaWhereField>(
      // @ts-ignore
      {
        NOT: {
          username: {
            contains: 'foo',
          },
          posts: {
            some: {
              author: {
                some: {
                  id: 1,
                },
              },
            },
          },
        },
      }
    )
  })

  it('should handle simple relations', () => {
    const baseQuery: TWhereField = {
      'posts.content': {
        $cont: 'Hello',
      },
    }

    expect(parsePrismaWhere(baseQuery, ['posts'])).toEqual<TPrismaWhereField>({
      posts: {
        some: {
          content: {
            contains: 'Hello',
          },
        },
      },
    })
  })

  it('should handle nested relations', () => {
    const baseQuery: TWhereField = {
      'posts.content': {
        $cont: 'Hello',
      },
      'posts.author.id': 1,
      'posts.id': 1,
    }

    expect(
      parsePrismaWhere(baseQuery, ['posts', 'posts.author'])
    ).toEqual<TPrismaWhereField>({
      posts: {
        some: {
          id: 1,
          content: {
            contains: 'Hello',
          },
          author: {
            some: {
              id: 1,
            },
          },
        },
      },
    })
  })
})
