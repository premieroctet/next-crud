import { parsePrismaCursor } from '../../../../src/adapters/prisma/utils/parseCursor'
import { TPrismaCursor } from '../../../../src/adapters/prisma/types'

describe('Parse prisma cursor', () => {
  it('should parse valid cursor query', () => {
    const query = {
      id: 1,
    }

    expect(parsePrismaCursor(query)).toEqual<TPrismaCursor>(query)
  })

  it('should not parse valid cursor with array', () => {
    const query = {
      id: 1,
      articles: { id: 1 },
    }

    // @ts-ignore
    expect(parsePrismaCursor(query)).toEqual<TPrismaCursor>({
      id: 1,
    })
  })

  it('should not parse valid cursor with object', () => {
    const query = {
      id: 1,
      article: [{ id: 1 }],
    }

    // @ts-ignore
    expect(parsePrismaCursor(query)).toEqual<TPrismaCursor>({
      id: 1,
    })
  })
})
