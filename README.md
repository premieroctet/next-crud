`next-crud` is a helper library that creates CRUD API routes with one simple function based on a Prisma model for Next.js.

# Installation

`yarn add next-crud`

or

`npm i -S next-crud`

# Usage

- Create a file under `pages/api/<modelName>` called `[[...someName]].ts`. You can also have 2 files called `index.ts` and `[id].ts` under that folder, both files will have to contain the same content.

- Import the handler and the adapter you want to use, in that case we will use the prisma adapter but you can use your own one (see [this section](#adapters))

```javascript
import NextCrud, { PrismaAdapter } from 'next-crud'
```

- Then create the handler and export it

```javascript
const handler = NextCrud({
  resourceName: modelName, // the model which corresponds to the folder name
  adapter: new PrismaAdapter({
    modelName: 'user',
  }),
})

export default handler
```

# Query params

You can add some criteria to your queries using the query params. Here is the list of the supported query params:

#### select

A list of fields which will be retrieved to the model. You can select nested fields by just separating the fields with a `.`. Example:

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

#### include

A list of fields which corresponds to the model relations to include. You can aswell include nested fields just like you would do with `select`

#### where

A JSON representation of the search conditions, heavily inspired on what [nest-crud](https://github.com/nestjsx/crud/wiki/Requests#search) does. It supports the following operators:

- `$eq` (`=`, equal)
- `$neq` (`!=`, not equal)
- `$in` (`IN`, in range, must be an array)
- `$nin` (`NOT IN`, not in range, must be an array)
- `$lt` (`<`, lower than, must be a numeric value)
- `$lte` (`<=`, lower than or equal, must be a numeric value)
- `$gt` (`>`, greater than, must be a numeric value)
- `$gte` (`>=`, greater than or equal, must be a numeric value)
- `$cont` (`LIKE %val%`, contains string value)
- `$starts` (`LIKE val%`, field starts with value)
- `$ends` (`LIKE %val`, field ends with value)
- `$isnull`, (`IS NULL`, must be used in a string, e.g: `"myfield": "$isnull"`)

We also provide 3 operators to combine multiple search:

- `$and` (`AND`), should be an object, this is the same thing as just providing an JSON object to the query param
- `$or` (`OR`), should be an object, this will apply an `OR` condition between each properties of the object
- `$not` (`NOT`), should be an object, this should match all the data in the database that do not match those criteria.

#### orderBy

A JSON representation of the field to order by and its direction. This should be an object containing only 1 key (name of the field to order by) with a valid order operator. These are the 2 available operators:

- `$asc` for ascending order
- `$desc` for descending order

#### limit

A number representing the number of element to return

#### skip

The number of element to skip the first n elements from the query

#### distinct

A field name on which the duplicates are removed from the dataset

# Callbacks

You can pass callbacks for request, success and error:

- `onSuccess` and `onRequest` will receive 2 argument: the request object and the response
- `onError` will receive an extra argument which is the thrown error

# Middlewares

With the `middlewares` property, you can pass an array of functions. The functions receives the following arguments:

- context as the first argument. It's an object will the following shape:

```typescript
export type TMiddlewareContext<T> = {
  req: NextApiRequest
  res: NextApiResponse
  result: T | T[]
}
```

- a function as the second argument, which is used to execute the next middleware in the stack. **Every middleware needs to call that function.**

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

## Prisma adapter

### Additional query params

The Prisma adapter provides an additional query param, which is related to a property used by prisma:

#### cursor

A JSON object containing only 1 key and a matching value corresponding to an entry in the database which is the starting point of the result of the query. You can see that as an offset.

### Known issues

Currently the Prisma adapter does not support relations on your `where` search criteria, this will be implemented in a future version.

# Example

See the example folder
