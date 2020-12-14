export default {
  repository: 'https://github.com/premieroctet/next-crud',
  branch: 'master', // branch of docs
  path: 'docs', // path of docs
  titleSuffix: ' – next-crud',
  nextLinks: true,
  prevLinks: true,
  search: true,
  customSearch: null, // customizable, you can use algolia for example
  darkMode: true,
  footer: true,
  footerText: 'MIT 2020 © Premier Octet.',
  footerEditOnGitHubLink: true, // will link to the docs repo
  logo: (
    <>
      <img src="/icon.svg" width="32" />
      <span style={{ fontWeight: 'bold', marginLeft: 10 }}>Next Crud</span>
    </>
  ),
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="next-crud: a next.js API CRUD helper" />
      <meta name="og:title" content="next-crud: a next.js API CRUD helper" />
    </>
  ),
}
