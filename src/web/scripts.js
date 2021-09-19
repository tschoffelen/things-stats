import TasksSchedule from './sections/tasks-schedule.js'
import TasksStatus from './sections/tasks-status.js'
import TasksDue from './sections/tasks-due.js'
import TasksTags from './sections/tasks-tags.js'
import TasksOldest from './sections/tasks-oldest.js'
import TasksCalendar from './sections/tasks-calendar.js'
import TasksCompleted from './sections/tasks-completed.js'
import TasksWeekday from './sections/tasks-weekday.js'

const sections = [
  TasksSchedule,
  TasksStatus,
  TasksDue,
  TasksTags,
  TasksOldest,
  TasksCalendar,
  TasksCompleted,
  TasksWeekday
]

const $nav = $('nav ul')
const $body = $('.inner')

window.renderSection = async (sectionIndex) => {
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
