// Get DOM Elements
const popup = document.querySelector('#jsPopup');
const closeBtn = document.querySelector('.close');

const inpTitle = document.querySelector('.title');
const searchField = document.querySelector('#search');
const inpEditor = document.getElementById('editor');
const lsOutput = document.querySelector('.lsOutput');
const navUL = document.querySelector('.navbar-nav');
const mainDIV = document.querySelector('#main');
const favBtn = document.querySelector('.favSecBtn');
const noteListElement = document.querySelector(".note-list");
let showingFavs = false;

favBtn.addEventListener('click', (evt) => {
    showingFavs = !showingFavs;
    noteListElement.style.display = "block";
    if (showingFavs) {
        renderNotes(notes.filter(note => note.favourite))
    } else {
        renderNotes(notes);
    }
})

//Hämta alla notes som finns sparade i local-storage
let notes = JSON.parse(localStorage.getItem("notes"))

//ID på den note som för tillfället används
let currentNoteId = generate_UUID()

//Om inget finns i notes från steget ovan så gör notes till en tom lista/array annars rendera notes
if (!notes) {
    notes = []
} else {
    renderNotes(notes)
}

console.log("currentNoteId: " + currentNoteId) //TODO ta bort

function createNote() {
    console.log("title: " + inpTitle.innerText.length + ", text: " + inpTitle.innerText.length + ", number of notes: " + notes.length) //TODO ta bort
    var x = inpTitle.innerText;
    let y = inpEditor.innerText;
    if (y = '' || x.length >= 15) {
        alert("You need to fill out the name field properly");
        return false;// För att ha en titel med max 15 bokstäver 
    }
    //Skapa upp en Note med hjälp av fält från HTML
    if (inpTitle.innerText.length < 1 && quill.getText.length < 1) return //Detta för att inte kunna skapa en note utan titel eller text

    const noteExists = notes.length > 0 ? isNoteIdInList(notes, currentNoteId) : false;

    console.log("Does note exist: " + noteExists)

    if (noteExists) {
        notes.forEach(note => {
            console.log("searching for note with id: " + currentNoteId + ", currently at note: " + note.id)
            if (note.id == currentNoteId) {
                console.log("Note with searched id found: " + currentNoteId)
                note.date = new Date().toUTCString()
                note.title = inpTitle.innerText
                note.text = quill.getText()
            }
        })
    } else {
        console.log("No Note with searched id: " + currentNoteId + " found, creating a new note")
        currentNoteId = generate_UUID()
        var note = {
            id: currentNoteId,
            date: new Date().toUTCString(),
            title: inpTitle.innerText,
            text: quill.getText(),
            favourite: false
        }
        //Lägg till den precis skapade note'en till listan notes
        console.log("Pushing note to list: " + JSON.stringify(note))
        notes.push(note);
    }
    //Spara den nya notes listan till local-storage
    saveNotesToLocalStorage(notes);
    //Rendera den nya listan
    renderNotes(notes);
}

//Lägg till/Skriv över notes
function saveNotesToLocalStorage(notes) {
    //Omvandlar notes till JSON-format och sparar sedan ner innehållet till local-storage med nyckeln notes
    localStorage.setItem('notes', JSON.stringify(notes))
}

//Rita ut notes i HTML
function renderNotes(notes) {
    //Rensa det som för tillfället visas för användaren
    noteListElement.innerHTML = '';
    //För varje note i listan notes
    notes.forEach(note => {
        //Gör om javascripts note till HTML note, lägg sedan till det som ett child på note-list elemetet i HTML
        noteListElement.appendChild(noteToHTML(note));
    });
}

//Gör om note i javascript till HTML format
function noteToHTML(note) {
    //Skapa ett list-item
    let container = document.createElement('li');
    //Lägg till id från note som data-id attribut
    container.setAttribute('data-id', note.id);
    //Lägg till den skapade html note strukturen som list-items innre presentation
    container.innerHTML = noteHtmlStructure(note)
    container.onclick = function (evt) {
        //let clickedLI = evt.target.closest('li');
        //let clickedID = clickedLI.getAttribute('data-id');
        if (evt.target.classList.contains('fa-star') || evt.target.classList.contains('fa-star-o')) {

            toggleFav(note.id)
        } else {
            currentNoteId = note.id
            inpTitle.innerText = note.title
            quill.setText(note.text)
        }
    }
    return container
}

//Med hjälp av javascript note, returnera strukturerat html för en note
function noteHtmlStructure(note) {
    //Bygger upp en note som ska presenteras för användaren i HTML format
    return `<div class="card"><div class="remove"></div><p class="left"><b>${shortenText(note.title, 15)}</b><span class="right">${note.date}</span></p><i class="fa fa-star${note.favourite ? '' : '-o'}" aria-hidden="true"></i><p>${shortenText(note.text, 200)}</p></div>`
}

//Om text behöver kortas ner så gör det och lägg till "..." på slutet för att indikera att det finns mer text 
function shortenText(text, characters) {
    if (text.length > characters) {
        text = text.substring(0, characters) + '...';
    }
    return text
}

//Funktion för att generera ett unikt id som används vi skapande av note.
function generate_UUID() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

//Kolla om currentNoteId finns i listan av notes
function isNoteIdInList(notes, id) {
    let exists = false
    notes.forEach(note => {
        console.log("noteId: " + note.id + " - currentNodeId: " + id)
        if (note.id == id) {
            exists = true
        }
    })
    return exists;
}

//Rensa title, text och generera ett nytt currentNoteId
function clearEditor() {
    currentNoteId = generate_UUID()
    inpTitle.innerText = ""
    quill.setText("")
}

function removeNote(id) {
    console.log(id)
}

//Lägg till en on click på knappen bara som kör createNote
function saveNote() {
    createNote()
    clearEditor()
}

function removeNote() {
    let noteExists = isNoteIdInList(notes, currentNoteId);
    if (noteExists) {
        for (let i = 0; i < notes.length; i++) {
            if (notes[i].id == currentNoteId) {
                notes.splice(i, 1);
            }
        }
        saveNotesToLocalStorage(notes);
        renderNotes(notes);
        clearEditor()
    } else {
        clearEditor()
    }
}

noteListElement.addEventListener('click', function (sideBar) {
    if (sideBar.target && sideBar.target.id == 'brnPrepend') {
        inpTitle.innerText = notesArr.find(note => note.id == id).title
        let noteObj = inpTitle.innerText;
        noteObj.favourite = !noteObj.favourite;
    }
});
// collapsible
let savedNotes = document.getElementsByClassName("savedNotes");
let i;

for (i = 0; i < savedNotes.length; i++) {
    savedNotes[i].addEventListener("click", function () {
        let content = this.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });

}
// collapsible slut
function toggleFav(id) {
    let noteObj = notes.find(note => note.id == id)
    noteObj.favourite = !noteObj.favourite;
    saveNotesToLocalStorage(notes);
    renderNotes(notes)
}

//POPUP Funktioner 
// Events

closeBtn.addEventListener('click', closePopup);
window.addEventListener('click', outsideClick);

// Open
function openPopup() {
    popup.style.display = 'block';
}

// Close
function closePopup() {
    popup.style.display = 'none';
}

// Close If Outside Click
function outsideClick(e) {
    if (e.target == popup) {
        popup.style.display = 'none';
    }
}
// POPUP FUNKTIONER SLUT

// NAV FUNKTIONER 
function myFunction() {
    let x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}

/* Close/hide the sidenav */
function closeNav() {
    document.getElementById("sideNav").style.display = "none";
}

navUL.addEventListener('mouseenter', function (evt) {
    //console.log("MOUSE is on nav!")
    if (window.innerWidth >= 900) {
        mainDIV.style = "margin-left: 200px;"
    }
    //console.log(window.innerWidth);
})
navUL.addEventListener('mouseleave', function (evt) {
    //console.log("MOUSE is off nav!")
    mainDIV.style = "";
})


let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
// add class 'fav' to each favorite
favorites.forEach(function (favorite) {
    document.getElementById(favorite).className = 'fav';
});
// register click event listener
document.querySelector('.note-list').addEventListener('click', function (e) {
    var id = e.target.id,
        item = e.target,
        index = favorites.indexOf(id);
    // return if target doesn't have an id (shouldn't happen)
    if (!id) return;
    // item is not favorite
    if (index == -1) {
        favorites.push(id);
        item.className = 'fav';
        // item is already favorite
    } else {
        favorites.splice(index, 1);
        item.className = '';
    }
    // store array in local storage
    localStorage.setItem('favorites', JSON.stringify(favorites));
});

function searchNotes() {
    let filteredList = []
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].title.toLowerCase().includes(searchField.value.toLowerCase())) {
            filteredList.push(notes[i])
        }
    }
    renderNotes(filteredList)
}

// QUILL FUNKTIONER 
let toolbarOptions = [
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],
    [{ "header": [1, 2, 3, 4, 5, 6, false] }],
    [{ "list": "ordered" }, { "list": "bullet" }],
];
let quill = new Quill('#editor', {
    modules: {
        toolbar: toolbarOptions
    },
    theme: 'snow'
});
// QUILL FUNKTIONER SLUT

// PRINT FUNKTIONER 
function printDiv() {
    var editorContent = quill.container.firstChild.innerHTML
    var content = window.open('', 'PRINT', 'height=500,width=500');
    content.document.write(editorContent);
    content.document.close();
    content.print();
}
// PRINT FUNKTIONER SLUT

var checkbox = document.querySelector('input[name=chk]');

checkbox.addEventListener('change', function () {
    if (this.checked) {

        document.documentElement.setAttribute('data-theme', 'dark')
    } else {

        document.documentElement.setAttribute('data-theme', 'light')
    }
})