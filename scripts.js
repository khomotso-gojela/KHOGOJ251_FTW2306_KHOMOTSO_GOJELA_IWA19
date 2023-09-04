import { BOOKS_PER_PAGE, authors, books, genres } from "./data.js";

const props = {
    search: { 
        searchBtn: document.querySelector('[data-header-search]'),
        overlay: document.querySelector('[data-search-overlay]'),
        cancel: document.querySelector('[data-search-cancel]'),
        searchSubmit: document.querySelector('[data-search-overlay] .overlay__row button:nth-child(2)'),
        genres: document.querySelector('[data-search-genres]'),
        authors: document.querySelector('[data-search-authors]'),

        form: document.querySelector('[data-search-form]'),
        title: document.querySelector('[data-search-title]')
    },

    settings: {
        settingsBtn: document.querySelector('[data-header-settings]'),
        overlay: document.querySelector('[data-settings-overlay]'),
        cancel: document.querySelector('[data-settings-cancel]'),
        save: document.querySelector('[data-settings-overlay] .overlay__button_primary'),
        theme: document.querySelector('[data-settings-theme]'),

        form: document.querySelector('[data-settings-form]')
    },

    showmore: {
        showmoreBtn: document.querySelector('[data-list-button]'),
        listItems: document.querySelector('[data-list-items]'),
        listClose: document.querySelector('[data-list-close]'),
        listMsg: document.querySelector('[data-list-message]')
    }
}

let matches = books
let page = 1;

if (!books && !Array.isArray(books)) throw new Error('Source required')

const day = {
    dark: '10, 10, 20',
    light: '255, 255, 255',
}

const night = {
    dark: '255, 255, 255',
    light: '10, 10, 20',
}

const fragment = document.createDocumentFragment()
const extracted = books.slice(0, BOOKS_PER_PAGE)

/**
 * The following takes a book object and converts it into an element object that can be appended into a parent node.
 * @param {object} book 
 * @returns {node}
 */
function createPreview(book) {
    const prevElement = document.createElement('div');
    prevElement.classList.add('preview');
    prevElement.id = book.id

    const imageElement = document.createElement('img');
    imageElement.classList.add('preview__image')
    imageElement.src = book.image;
    imageElement.alt = book.title;
    prevElement.appendChild(imageElement); 

    const prevInfo = document.createElement('div')
    prevInfo.classList.add('preview__info')

    const titleElement = document.createElement('h3');
    titleElement.classList.add('preview__title')
    titleElement.textContent = book.title;
    prevInfo.appendChild(titleElement);

    const authorElement = document.createElement('p');
    authorElement.classList.add("preview__author")
    authorElement.id = book.author
    authorElement.textContent = `Author: ${authors[book.author]}`;
    prevInfo.appendChild(authorElement);

    prevElement.appendChild(prevInfo);    

    return prevElement;
}
//Getting book info from the books array and appending them in the document fragment.
for (let book of extracted) {
    const preview = createPreview(book)
    fragment.appendChild(preview)
}

props.showmore.listItems.appendChild(fragment)

const genresFrag = document.createDocumentFragment()
const  genOpt = document.createElement('option')
genOpt.value = 'any'
genOpt.innerText = 'All Genres'
genresFrag.appendChild(genOpt)

for (const [id, text] of Object.entries(genres)) {
    const element = document.createElement('option')
    element.value = id
    element.innerText = text
    genresFrag.appendChild(element)
}

props.search.genres.appendChild(genresFrag)

const authorsFrag = document.createDocumentFragment()
const authorOpt = document.createElement('option')
authorOpt.value = 'any'
authorOpt.innerText = 'All Authors'
authorsFrag.appendChild(authorOpt)

for (const [id, text] of Object.entries(authors)) {
    const element = document.createElement('option')
    element.value = id
    element.innerText = text
    authorsFrag.appendChild(element)
}

props.search.authors.appendChild(authorsFrag)

props.settings.theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day'
const theme = window.matchMedia('(prefers-color-scheme: dark)').matches? night : day

document.documentElement.style.setProperty('--color-dark', theme.dark);
document.documentElement.style.setProperty('--color-light', theme.light);

props.showmore.showmoreBtn.innerText = `Show more ${books.length - BOOKS_PER_PAGE}`
props.showmore.showmoreBtn.disabled = !(matches.length - (page * BOOKS_PER_PAGE) > 0)
props.showmore.showmoreBtn.innerHTML = /* html */ `
    <span>Show more</span>
    <span class="list__remaining"> (${matches.length - (page * BOOKS_PER_PAGE) > 0 ? matches.length - (page * BOOKS_PER_PAGE) : 0})</span>
`

props.search.cancel.onclick = () => { document.querySelector('[data-search-overlay]').open = false }
props.settings.cancel.onclick = () => { document.querySelector('[data-settings-overlay]').open = false }
props.settings.settingsBtn.onclick = () => { document.querySelector('[data-settings-overlay]').open = true }
props.showmore.listClose.onclick = () => { document.querySelector('[data-list-active]').open = false }

function createPreviewsFragment(allBooks,displayed,nextDisplay){
    const toAppend = allBooks.slice(displayed,nextDisplay)
    const newFrag = document.createDocumentFragment()

    for (const book of toAppend) {
        const prevBook = createPreview(book)
        newFrag.appendChild(prevBook)
    }

    return newFrag
}

function updateRemaining() {
    document.querySelector('[data-list-button]').innerHTML = /* html */ `
    <span>Show more</span>
    <span class="list__remaining"> (${matches.length - (page * BOOKS_PER_PAGE) > 0 ? matches.length - (page * BOOKS_PER_PAGE) : 0})</span>
`
}

props.showmore.showmoreBtn.onclick = () => {
    props.showmore.listItems.appendChild(createPreviewsFragment(matches, page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE))
    page = page + 1
    updateRemaining()
    props.showmore.showmoreBtn.disabled = matches.length - (page * BOOKS_PER_PAGE) <= 0
}

props.search.searchBtn.onclick = () => {
    props.search.overlay.open = true
    props.search.title.focus();
}

props.search.searchSubmit.onclick = (event) => {
    event.preventDefault()
    const formData = new FormData(props.search.form)
    const filters  = Object.fromEntries(formData)

    const result = []

    for (const book of books) {

        filters.title.trim()
        const titleMatch = book.title.toLowerCase().includes(filters.title.toLowerCase())
        const authorMatch = filters.author == 'any' || book.author === filters.author

        
        let genreMatch = filters.genre == 'any'
        for (const genre of book.genres) { 
            if (genre == filters.genre) {genreMatch = true }
        }

        if (titleMatch && authorMatch && genreMatch) {result.push(book)}
    }

    if (result.length < 1){
        props.showmore.listMsg.classList.add('list__message_show')
    }else {
        props.showmore.listMsg.classList.remove('list__message_show')
    }

    props.showmore.listItems.innerHTML = ''
    const docfragment = document.createDocumentFragment()
    const extractedbooks = result.slice(0,BOOKS_PER_PAGE)


    for (const { author, image, title, id } of extractedbooks) {

        const element = document.createElement('div')
        element.classList = 'preview'
        element.id = id

        element.innerHTML = /* html */ `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `

        docfragment.appendChild(element)
    }
    
    props.showmore.listItems.appendChild(docfragment)

    matches = result
    page = 1

    const initial = result.length - (page * BOOKS_PER_PAGE)
    const hasRemaining = result.length > BOOKS_PER_PAGE 
    const remaining = hasRemaining? initial : 0
    props.showmore.showmoreBtn.disabled = initial <= 0

    document.querySelector('[data-list-button]').innerHTML = /* html */ `
        <span>Show more</span>
        <span class="list__remaining"> (${remaining})</span>
    `

    window.scrollTo({ top: 0, behavior: 'smooth' });
    props.search.overlay.open = false
}

props.settings.save.onclick = (event) => {
    event.preventDefault()
    const formData = new FormData(props.settings.form)
    const result = Object.fromEntries(formData)
    const theme = result.theme == 'day'? day : night

    document.documentElement.style.setProperty('--color-dark', theme.dark);
    document.documentElement.style.setProperty('--color-light', theme.light);
    props.settings.overlay.open = false
}

props.showmore.listItems.onclick = (event) => {
    const pathArray = Array.from(event.path || event.composedPath())
    let active;

    for (const node of pathArray) {
        if (active) break;
        const previewId = node.id
            
        for (const singleBook of books) {
            if (singleBook.id === previewId) active = singleBook
        } 
    }
    
    if (!active) return
    document.querySelector('[data-list-active]').open = true
    document.querySelector('[data-list-blur]').setAttribute('src',active.image) 
    document.querySelector('[data-list-image]').setAttribute('src',active.image) 
    document.querySelector('[data-list-title]').innerText = active.title
    
    document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${(new Date(active.published)).getFullYear()})`
    document.querySelector('[data-list-description]').innerText = active.description
}