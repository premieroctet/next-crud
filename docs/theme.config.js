import Logo from './components/Logo'

export default {
  repository: 'https://github.com/premieroctet/next-crud',
  branch: 'master', // branch of docs
  path: 'docs', // path of docs
  titleSuffix: ' – Next Crud - Full-featured CRUD routes for Next.js',
  nextLinks: true,
  prevLinks: true,
  search: true,
  customSearch: null, // customizable, you can use algolia for example
  darkMode: true,
  footer: true,
  footerText: 'MIT 2020 © Premier Octet.',
  footerEditOnGitHubLink: true, // will link to the docs repo
  logo: (
    <div className="flex items-center">
      <Logo width={45} />
      <span className="text-lg ml-2 font-bold">Next Crud</span>
      <span className="text-gray-500 ml-2 text-sm">
        Full-featured CRUD routes for Next.js
      </span>
    </div>
  ),
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta
        name="description"
        content="Next Crud is a helper library that creates CRUD API routes with one simple function based on a Prisma model for Next.js."
      />
      <meta
        name="og:description"
        content="Next Crud is a helper library that creates CRUD API routes with one simple function based on a Prisma model for Next.js."
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@premieroctet" />
      <meta
        name="twitter:image"
        content="https://next-crud.js.org/oggraph.png"
      />
      <meta
        name="og:title"
        content="Next Crud: Full-featured CRUD routes for Next.js"
      />
      <meta name="og:url" content="https://next-crud.js.org/" />
      <meta name="og:image" content="https://next-crud.js.org/oggraph.png" />
      <meta name="apple-mobile-web-app-title" content="Next Crud" />
    </>
  ),
}
