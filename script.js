import moment from 'moment'
import request from 'superagent'
import $ from 'jquery'

const apiUrl = `https://notes-api.glitch.me/api/notes`
let noteHist = []
/* {
  "username": "miniraccoondog",
  "password": "wordp@ss",
  "_id": "pFi48qNwYBtC6Cut"
} */
const addField = document.querySelector('.add')
const newNote = document.getElementById('toggleadd')

newNote.addEventListener('click', function () {
  addField.classList.remove('hidden')
  newNote.classList.add('invisible')
})

document.getElementById('cancel-note').addEventListener('click', function () {
  addField.classList.add('hidden')
  newNote.classList.remove('invisible')
})

$('form').submit(function (event) {
  event.preventDefault()
  const note = $(this).serializeArray()
  this.reset()
  console.log(note)
  // const noteNew = formatNote(note)
  // addNote(noteNew)
  // $(addField).addClass('hidden')
  // $(newNote).removeClass('invisible')
  // getUpdateNotes()
})

function formatNote (note) {
  console.log('made note')
  const textfield = note[0].value
  const tagsarray = Array.from(note[1].value.split(','))
  const titlefield = note[2].value
  const notePost = {
    'text': textfield,
    'title': titlefield,
    'tags': tagsarray
  }
  // console.log(notePost)
  return notePost
}

function addNote (postMsg) {
  console.log('add note')
  request.post(apiUrl)
    .auth('miniraccoondog', 'wordp@ss')
    .send(postMsg)
    .then(response => {
      // console.log(response.body)
      if (noteHist.length === 0) {
        getUpdateNotes()
      } else {
        const theNewNote = displayNote(response.body)
        noteHist.unshift(theNewNote)
        // noteHist.push(theNewNote)
        localUpdateNotes()
      }
    })
}

const noteField = document.getElementById('allnotes')

function getUpdateNotes () {
  console.log('get update notes')
  let noteHist = []
  request
    .get(apiUrl)
    .auth('miniraccoondog', 'wordp@ss')
    .then(response => {
      const responseArray = Array.from(response.body.notes)
      for (var element in responseArray) {
        // console.log(responseArray[element])
        noteHist.push(displayNote(responseArray[element]))
      }
      const newHTML = noteHist.join()
      addToPage(newHTML)
      $('.delete').click(function (event) {
        deleteNote(this.dataset.id)
      })
    })
}
$('#update').click(function () {
  getUpdateNotes()
})

function localUpdateNotes () {
  console.log('ran local update note')
  const newHTML = noteHist.join()
  addToPage(newHTML)
  $('.delete').click(function (event) {
    deleteNote(this.dataset.id)
  })
}

function displayNote (note) {
  const title = convertCase(note.title)
  const text = note.text
  const tagsarray = note.tags
  const id = note._id
  const posttime = moment(note.updated).format('MMM Do YYYY, h:mm a')
  const divtags = tagsarray.map(x => `<span class="badge">${x.toLowerCase()}</span>`).join('')
  return `<div class="note">
    <h3>${title}</h3>
    <div class="tags__bar">
        ${divtags}
    </div>
    <h5 class="date">${posttime}</h5>
    <p>${text}</p>
    <button type="button right" value='edit' class="button" data-id=${id}>Edit</button>
    <button class="button-sm button-light button-block delete" data-id=${id}>Delete Note</button>
  </div>`
}

function addToPage (newhtml) {
  noteField.innerHTML = newhtml
}

function deleteNote (noteId) {
  console.log('delete note')
  request
    .delete(apiUrl + '/' + noteId)
    .auth('miniraccoondog', 'wordp@ss')
    .then(response => {
      console.log(response)
      getUpdateNotes()
    })
}

function convertCase (string) {
  let stringArray = string.split(' ')
  for (var i of stringArray) {
    var lowercase = i.substr(1)
    var uppercase = i.charAt(0).toUpperCase()
    var newWord = uppercase + lowercase
    var indexnumb = stringArray.indexOf(i)
    stringArray.splice(indexnumb, 1, newWord)
  }
  return stringArray.join(' ')
}
