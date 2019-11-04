module.exports = {
  ga: 'UA-141652960-3',
  base: '/vue2-daterange-picker/',
  title: 'Vue2 date range picker',
  description: 'Vue2 date range picker forked from Innologica',
  themeConfig: {
    nav: [
      { text: 'Github', link: 'https://github.com/it-xtech-dev/vue2-daterange-picker' }
    ],
    sidebar: 'auto'
  },
  markdown: {
    config: md => {
      md.use(require('markdown-it-footnote'))
    }
  }
}