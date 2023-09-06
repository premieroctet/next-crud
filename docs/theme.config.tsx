import { ThemeConfig } from 'nextra'
import Logo from './components/Logo'

const config: ThemeConfig = {
  search: {},
  darkMode: true,
  project: {
    link: 'https://github.com/premieroctet/next-crud',
  },
  docsRepositoryBase:
    'https://github.com/premieroctet/next-crud/tree/master/docs',
  footer: {
    text: 'MIT 2023 © Premier Octet.',
  },
  logo: (
    <div className="logo">
      <Logo width={45} />
      <span className="name">Next Crud</span>
      <span className="description">Full-featured CRUD routes for Next.js</span>
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
        content="https://next-crud-pi.vercel.app/oggraph.png"
      />
      <meta
        name="og:title"
        content="Next Crud: Full-featured CRUD routes for Next.js"
      />
      <meta name="og:url" content="https://next-crud-pi.vercel.app/" />
      <meta
        name="og:image"
        content="https://next-crud-pi.vercel.app/oggraph.png"
      />
      <meta name="apple-mobile-web-app-title" content="Next Crud" />
      <link rel="icon" href="/icon.svg" />
      <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
    </>
  ),
}

export default config
