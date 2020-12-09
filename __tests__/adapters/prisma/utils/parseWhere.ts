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
    const baseQuery: TWhereField = {
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
  })

  it('should parse $or', () => {
    const baseQuery: TWhereField = {
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
  })

  it('should parse $not', () => {
    const baseQuery: TWhereField = {
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
  })
})
