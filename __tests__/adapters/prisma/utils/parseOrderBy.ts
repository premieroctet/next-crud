import { TPrismaOrderBy } from '../../../../src/adapters/prisma/types'
import { parsePrismaOrderBy } from '../../../../src/adapters/prisma/utils/parseOrderBy'
import { TOrderByField } from '../../../../src/types'

describe('Parse prisma orderBy', () => {
  it('should map correctly operators', () => {
    const baseQuery: TOrderByField = {
      username: '$asc',
      id: '$desc',
    }

    expect(parsePrismaOrderBy(baseQuery)).toEqual<TPrismaOrderBy>({
      username: 'asc',
      id: 'desc',
    })
  })
})
