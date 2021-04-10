const { ipcRenderer } = require('electron')
const $ = require('./vendor/jquery.min')

window.db = {
  query (query) {
    return new Promise((resolve, reject) => {
      let responded = false
      ipcRenderer.once('query-rows', (event, arg) => {
        if (responded) return
        responded = true
        resolve(arg)
      })

      ipcRenderer.once('query-error', (event, arg) => {
        if (responded) return
        responded = true
        reject(arg)
      })

      ipcRenderer.send('query', query)
    })
  }
}

const sections = [
  require('./sections/task-status'),
  require('./sections/tasks-due'),
  require('./sections/tasks-tags'),
  require('./sections/tasks-oldest'),
  require('./sections/tasks-calendar'),
  require('./sections/tasks-completed'),
  require('./sections/tasks-weekday'),
]

const $nav = $('nav ul')
const $body = $('.inner')

const renderSection = async (sectionIndex) => {
  const section = sections[sectionIndex]

  $body.html('<div class="graph-outer"><canvas id="myChart" width="400" height="300"></canvas></div>')
  $nav.find('.active').removeClass('active')
  const $item = $nav.find('li:nth-child(' + (sectionIndex + 1) + ')')
  $item.addClass('active')

  $nav.scrollLeft($item.offset().left - 300)

  const data = await section.render()

  if (typeof data === 'object') {
    const ctx = document.getElementById('myChart').getContext('2d')
    new Chart(ctx, data)
  } else {
    $body.html(data)
  }
}

sections.forEach((section, index) => {
  $nav.append(
    '<li' + (!index ? ' class="active"' : '') + ' onclick="renderSection(' + index + ')">' +
    section.title +
    '</li>'
  )
})

$nav.append('<span>&nbsp;&nbsp;&nbsp;</span>')

renderSection(0)
