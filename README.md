`next-crud` is a helper library that creates CRUD API routes with one simple function based on a Prisma model for Next.js.

# Installation

`yarn add next-crud`

or

`npm i -S next-crud`

# Usage

- Create a file under `pages/api/<modelName>` called `[[...someName]].ts`. You can also have 2 files called `index.ts` and `[id].ts` under that folder, both files will have to contain the same content.

- Import the handler and the adapter you want to use, in that case we will use the prisma adapter but you can use your own one (see [this section](#adapters))

```javascript
import NextCrud from 'next-crud'
import PrismaAdapter from 'next-crud/dist/adapters/prisma'
```

- Then create the handler and export it

```javascript
const handler = NextCrud({
  resourceName: modelName, // the model which corresponds to the folder name
  adapter: new PrismaAdapter('user'),
})

export default handler
```

# Query params

You can add some criteria to your queries using the query params. Here is the list of the supported query params:

- `select`: a list of fields which will be retrieved to the model. You can select nested fields by just separating the fields with a `.`. Example:

```
select=id,username,articles,articles.id
```

will return a response with the following shape

```
{
  id: 'something',
  username: 'something',
  articles: [
    {
      id: 'something'
    }
  ]
}
```

- `include`: a list of fields which corresponds to the model relations to include.

# Adapters

An adapter is a class implementing various methods allowing you to query the data to the database your app uses.

Out of the box, `next-crud` provides an adapter for [Prisma](https://www.prisma.io/), but it is easy to create your own one. Your adapter must follow the following interface:

```typescript
export interface IAdapter<T, Q = IParsedQueryParams> {
  parseQuery(query?: IParsedQueryParams): Q
  getAll(query?: Q): Promise<T> // GET /api/modelName
  getOne(resourceId: string | number, query?: Q): Promise<T> // GET /api/modelname/:id
  create(data: any, query?: Q): Promise<T> // POST /api/modelName
  update(resourceId: string | number, data: any, query?: Q): Promise<T> // PUT/PATCH /api/modelName/:id
  delete(resourceId: string | number, query?: Q): Promise<T> // DELETE /api/modelName/:id
}
```

The `parseQuery` function is used to transform out basic query parsing into a shape that your database would expect. If you don't need that kind of transformation, your function can just return the `query` argument.

### Example

See the example folder
