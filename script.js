import moment from 'moment'
import request from 'superagent'
import $ from 'jquery'

const apiUrl = `https://notes-api.glitch.me/api/notes`
let noteHist = []
let responseArray = []
/* {
  "username": "miniraccoondog",
  "password": "wordp@ss",
  "_id": "pFi48qNwYBtC6Cut"
} */
const addField = document.querySelector('.window__add')
const newNote = document.getElementById('toggleadd')

newNote.addEventListener('click', function () {
  addField.classList.remove('hidden')
  newNote.classList.add('invisible')
})
document.getElementById('cancel-note').addEventListener('click', function () {
  addField.classList.add('hidden')
  newNote.classList.remove('invisible')
})

$('#notemaker').submit(function (event) {
  event.preventDefault()
  const note = $(this).serializeArray()
  this.reset()
  const noteNew = formatNote(note)
  addNote(noteNew)
  $(addField).addClass('hidden')
  $(newNote).removeClass('invisible')
  // getUpdateNotes()
})

function formatNote (note) {
  console.log('made note')
  const textfield = note[0].value
  const tagsarray = Array.from(note[1].value.split(','))
  const trimmedtags = tagsarray.map(x => x.trim())
  const titlefield = note[2].value
  const notePost = {
    'text': textfield,
    'title': titlefield,
    'tags': trimmedtags
  }
  return notePost
}

function addNote (postMsg) {
  console.log('add note')
  request.post(apiUrl)
    .auth('miniraccoondog', 'wordp@ss')
    .send(postMsg)
    .then(response => {
      if (noteHist.length === 0) {
        getUpdateNotes()
      } else {
        responseArray.push(response.body)
        const theNewNote = displayNote(response.body)
        noteHist.push(theNewNote)
        localUpdateNotes()
      }
    })
}

const noteField = document.getElementById('allnotes')
$('#update').click(function () {
  getUpdateNotes()
})

function getUpdateNotes () {
  console.log('get update notes')
  request
    .get(apiUrl)
    .auth('miniraccoondog', 'wordp@ss')
    .then(response => {
      responseArray = []
      responseArray = Array.from(response.body.notes)
      for (var element in responseArray) {
        if (noteHist.indexOf(displayNote(responseArray[element], element)) === -1) {
          noteHist.push(displayNote(responseArray[element], element))
        }
      }
      const newHTML = noteHist.join('')
      addToPage(newHTML)
      resetButtons()
    })
}

function localUpdateNotes () {
  console.log('ran local update note')
  const newHTML = noteHist.join('')
  addToPage(newHTML)
  resetButtons()
}

function displayNote (note, position) {
  const title = convertCase(note.title)
  const text = note.text
  const tagsarray = note.tags
  const id = note._id
  const posttime = moment(note.updated).format('MMM Do YYYY, h:mm a')
  const divtags = tagsarray.map(x => `<a href="#" data-id=${id} class="badge">${x.toLowerCase()}</a>`).join('')
  return `<div class="note">
    <h3>${title}</h3>
    <div class="tags__bar">
        ${divtags}
    </div>
    <h5 class="date">${posttime}</h5>
    <p>${text}</p>
    <button type="button" name=${position} class="button button-block edit" data-id=${id}>Edit</button>
    <button class="button-sm button-light button-block delete" data-id=${id}>Delete Note</button>
  </div>`
}

function addToPage (newhtml) {
  noteField.innerHTML = newhtml
}

function deleteNote (noteId) {
  noteHist = []
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
const editForm = document.getElementById('notechanger')
const editField = document.querySelector('.window__edit')

document.getElementById('cancel-edit').addEventListener('click', function () {
  editField.classList.add('hidden')
})

function editWindow (index) {
  const editingNote = responseArray[index]
  const title = convertCase(editingNote.title)
  const text = editingNote.text
  const tagsarray = editingNote.tags
  const id = editingNote._id
  const divtags = tagsarray.map(x => x.toLowerCase()).join()
  const editHTML = `<textarea class="textarea" name="text" rows="6" cols="36" placeholder="Textarea">${text}</textarea>
        <input type="text" name="tags" placeholder="Optional Tags" value="${divtags}">
        <div class="input-group">
          <input type="text" name="title" placeholder="Title of Note" value="${title}">
          <button type="submit" id="addnew" class="button" name=${id}>Edit Note</button>
        </div>`
  addToEditor(editHTML)
  editForm.name = id
  editField.classList.remove('hidden')
}

function addToEditor (edithtml) {
  editForm.innerHTML = edithtml
}

$('#notechanger').submit(function (event) {
  event.preventDefault()
  const note = $(this).serializeArray()
  const noteID = this.name
  const noteNew = formatNote(note)
  editNote(noteNew, noteID)
  this.reset()
  editField.classList.add('hidden')
})

function editNote (noteMsg, noteID) {
  console.log('edit note')
  request.put(apiUrl + '/' + noteID)
    .auth('miniraccoondog', 'wordp@ss')
    .send(noteMsg)
    .then(response => {
      console.log(response)
      getUpdateNotes()
    })
}

function getTaggedNotes (tag) {
  console.log('get notes tagged with:', tag)
  request
    .get(apiUrl + '/tagged/' + tag)
    .auth('miniraccoondog', 'wordp@ss')
    .then(response => {
      noteHist = []
      responseArray = Array.from(response.body.notes)
      for (var element in responseArray) {
        if (noteHist.indexOf(displayNote(responseArray[element], element)) === -1) {
          noteHist.push(displayNote(responseArray[element], element))
        }
      }
      const newHTML = noteHist.join('')
      addToPage(newHTML)
      resetButtons()
    })
}

function resetButtons () {
  $('.delete').click(function (event) {
    deleteNote(this.dataset.id)
  })
  $('.edit').click(function () {
    let index = this.name
    editWindow(index)
  })
  $('.badge').click(function () {
    event.preventDefault()
    getTaggedNotes(this.innerHTML)
    console.log('?', this)
  })
}

document.addEventListener('DOMContentLoaded', function () {
  getUpdateNotes()
  resetButtons()
})
