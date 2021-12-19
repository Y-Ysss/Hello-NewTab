class BookmarkContents {
    constructor(settings) {
        this.settings = settings
        this.fragment = document.createDocumentFragment()
    }
    async append() {
        await this.generateContents()
        this.applyMacy()
        document.getElementById('body-main').appendChild(this.fragment)
        this.fragment = null
    }
    async reload() {
        document.getElementById('body-main').innerHTML = null
        await this.append()
    }
    async generateContents() {
        const data = await getStorage('jsonBookmarks')
        for(let i in data.jsonBookmarks) {
            this.generate(data.jsonBookmarks[i].title, true, data.jsonBookmarks[i].children)
        }
    }
    generate(folderName, visible, items) {
        const contentModule = document.createElement('div')
        contentModule.className = 'content-module'
        const header = document.createElement('div')
        header.className = 'content-header'
        header.innerText = folderName
        contentModule.appendChild(header)
        let folderFragment = document.createDocumentFragment()
        if(!visible) {
            contentModule.classList.add('hide-module', 'hide')
        }
        let liBase = document.createElement('li')
        let aBase = document.createElement('a')
        let imgBase = document.createElement('img')
        imgBase.className = 'favicon'
        items.forEach((item) => {
            if("url" in item) {
                const li = liBase.cloneNode()
                const a = aBase.cloneNode()
                const img = imgBase.cloneNode()
                img.src = `chrome://favicon/${item.url}`
                a.appendChild(img)
                a.title = item.title
                a.appendChild(document.createTextNode(item.title))
                a.href = item.url
                li.appendChild(a)
                folderFragment.appendChild(li)
            }
        })
        const count = folderFragment.childElementCount
        if(count > 0) {
            let span = document.createElement('span')
            span.className = "bookmark-count"
            span.textContent = `${count} ${count === 1 ? 'bookmark' : 'bookmarks'}`
            folderFragment.appendChild(span)
            const ul = document.createElement('ul')
            ul.appendChild(folderFragment)
            contentModule.appendChild(ul)
            this.fragment.appendChild(contentModule)
        }
        items.forEach((item) => {
            if("children" in item) {
                this.generate(item.title, item.visible, item.children)
            }
        })
    }
    applyMacy() {
        let conf = {
            container: '#body-main',
            trueOrder: false,
            waitForImages: true,
            columns: 8,
            margin: { x: 30, y: 15 },
            breakAt: { 1400: 6, 1200: 5, 990: 4, 780: 3, 620: 2, 430: 1 }
        }
        const data = this.settings.text
        conf.columns = this.checkValue(data.txtMacyColumns, conf.columns, 'number')
        conf.margin.x = this.checkValue(data.txtMacyMarginX, conf.margin.x, 'number')
        conf.margin.y = this.checkValue(data.txtMacyMarginY, conf.margin.y, 'number')
        conf.breakAt = this.checkValue(data.txtMacyBreak, conf.breakAt, 'object')
        let macy = Macy(conf)
    }
    checkValue(a, b, datatype=null) {
        let val = a !== "" ? a : b
        switch (datatype) {
            case 'number':
                return Number(val)
            case 'object':
                return JSON.parse(JSON.stringify(val))
            default:
                return val
        }
    }
}

const NOW_OPEN = true
const NOW_CLOSE = false
const TO_OPEN = false
const TO_CLOSE = true

class ExpandMenu {
    constructor() {
        // document.getElementById('overray').addEventListener('click', (event) => {
        // 	this.on(TO_CLOSE)
        // })
    }
    on(state = this.state) {
        const sla = document.getElementById('system-link-area')
            // const mF = document.getElementById('overray')
        if(state) {
            sla.style.width = '2.6rem'
                // mF.classList.remove('filter')
        } else {
            sla.style.width = '14rem'
                // mF.classList.add('filter')
        }
        this.state = !state
    }
}

class BookmarkSearch {
    constructor() {
        wrapper('#bookmark-search', 'keyup', (event) => {
            this.searchView()
        })
        wrapper('#bookmark-search-reset', 'click', (event) => {
            this.searchReset()
        })
    }
    on(state = this.state) {
        const bookmarkSearch = document.getElementById('bookmark-search-group')
        const searchMenu = document.getElementById('search-menu')
        const search = document.getElementById('bookmark-search')
        if(state) {
            bookmarkSearch.style.left = '-34rem'
            searchMenu.classList.remove('active-menu')
            search.blur()
            this.searchReset()
        } else {
            bookmarkSearch.style.left = '2.6rem'
            searchMenu.classList.add('active-menu')
            search.focus()
        }
        this.state = !state
    }
    searchReset() {
        document.getElementById('bookmark-search').value = ""
        document.getElementById('bookmark-search-reset').classList.remove('search-reset-visible')
        document.getElementById('bookmark-search-result').innerHTML = ''
    }
    searchView() {
        const words = document.getElementById('bookmark-search').value
        if(words == "") {
            document.getElementById('bookmark-search-reset').classList.remove('search-reset-visible')
        } else {
            document.getElementById('bookmark-search-reset').classList.add('search-reset-visible')
            chrome.bookmarks.search(words, async(results) => {
                let joinResult = ''
                if(results.length !== 0) {
                    for(const item of results) {
                        if(item.url) {
                            const parent = await getBookmarkItems(item.parentId)
                            const title = item.title == "" ? item.url : item.title
                            joinResult += `<a class="bookmark-search-result-items" href="${item.url}" title="${title}"><img class="favicon" src="chrome://favicon/${item.url}">${title}<span>${parent[0].title}</span></a>`
                        }
                    }
                    joinResult = `<div id="bookmark-result-count">${results.length} ${results.length === 1 ? 'bookmark' : 'bookmarks'}</div>${joinResult}`
                } else {
                    joinResult = '<div id="bookmark-no-results-found"><img src="img/no-results-found.svg"><p>No results found</p></div>'
                }
                document.getElementById('bookmark-search-result').innerHTML = joinResult
            })
        }
        document.getElementById('bookmark-search-result').innerHTML = ''
    }
}

class FloatMenu {
    onDisplay(obj, state) {
        if(state) {
            obj.classList.remove('activeFloatMenu')
        } else {
            obj.classList.add('activeFloatMenu')
        }
    }
}

class SelectTheme extends FloatMenu {
    on(state = this.state) {
        const floatMenu = document.getElementById('float-menu-theme')
        const menu = document.getElementById('select-theme-menu')

        if(state) {
            super.onDisplay(floatMenu, TO_CLOSE)
            menu.classList.remove('active-menu')
        } else {
            super.onDisplay(floatMenu, TO_OPEN)
            menu.classList.add('active-menu')
        }
        this.state = !state
    }
}

class SwitchModuleVisible extends FloatMenu {
    constructor() {
        super()
        document.getElementById('tgglVisible').addEventListener('click', (event) => {
            this.action()
        })
    }
    on(state = this.state) {
        const floatMenu = document.getElementById('float-menu-visibility')
        const menu = document.getElementById('module-visible-menu')
        if(state) {
            super.onDisplay(floatMenu, TO_CLOSE)
            menu.classList.remove('active-menu')
        } else {
            super.onDisplay(floatMenu, TO_OPEN)
            menu.classList.add('active-menu')
        }
        this.state = !state
    }
    action() {
        document.getElementById('tgglVisible').classList.toggle('toggle-on')
        const items = document.getElementsByClassName('hide-module')
        for(let i = items.length - 1; i >= 0; i--) {
            items[i].classList.toggle('hide')
        }
    }
}

class Reflector {
    tgglIcon(value) {
        const br = value ? '0%' : '50%'
        for(const item of document.getElementsByClassName('favicon')) {
            item.style.borderRadius = br
        }
    }
    tgglOpenTab(value) {
        const el = document.getElementById("head-target")
        el.setAttribute('target', value ? '_blank' : '')
    }
    txtScale(value) {
        if(isFinite(value) && value !== '') {
            document.documentElement.style.zoom = value + '%'
        }
    }
    tmStyle(value) {
        document.getElementById('head-design-style').href = `css/design/style/st${value}.css`
        document.getElementById(value).checked = true
    }
    tmTheme(value) {
        document.getElementById('head-design-theme').href = `css/design/theme/tm${value}.css`
        document.getElementById(value).checked = true
    }
    tmColor(value) {
        document.getElementById('head-design-color').href = `css/design/color/cl${value}.css`
        document.getElementById(value).checked = true
    }
    tgglWebSearch(value) {
        if(value) {
            document.getElementById('web-search-area').classList.remove('displayNone')
        }
    }
}

class ContentsManager extends DefaultSettings {
    init() {
        this.addContents()
        this.addThemeOptions()
        this.addEventListener()
    }
    async addContents() {
        const cg = new BookmarkContents(this.settings)
        await cg.append()
        this.reflect()
    }
    async reloadContents() {
        const cg = new BookmarkContents(this.settings)
        await cg.reload()
        this.reflect()
    }

    addThemeOptions() {
        document.getElementById('theme-style').appendChild(this.generateRadio(this.themes.styles, 'tmStyle'))
        document.getElementById('theme-theme').appendChild(this.generateRadio(this.themes.themes, 'tmTheme'))
        document.getElementById('theme-color').appendChild(this.generateRadio(this.themes.colors, 'tmColor'))
    }
    generateRadio(items, name) {
        const fragment = document.createDocumentFragment()
        const inputBase = document.createElement('input')
        const labelBase = document.createElement('label')
        for(const item of items) {
            const inpt = inputBase.cloneNode()
            const labl = labelBase.cloneNode()
            inpt.type = 'radio'
            inpt.name = name
            inpt.id = inpt.value = labl.htmlFor = item.id
            labl.appendChild(document.createTextNode(item.label))
            fragment.appendChild(inpt)
            fragment.appendChild(labl)
        }
        return fragment
    }
    generateOption(items) {
        const fragment = document.createDocumentFragment()
        const optionBase = document.createElement('option')
        for(const item of items) {
            const optn = optionBase.cloneNode()
            optn.value = styles.id
            optn.appendChild(document.createTextNode(item.label))
            fragment.appendChild(optn)
        }
        return fragment
    }
    addEventListener() {
        wrapper('input[type=radio]', 'click', (event) => {
            const target = event.target
            this.settings.radio[target.name] = target.id
            this.setState(this.settings.radio)
            this.saveData()
            chrome.runtime.sendMessage({ contents: target.name })
            chrome.runtime.sendMessage({ option: 'reload' })
        })
        wrapper('html', 'keydown', (event) => {
            if(event.altKey && event.keyCode === 66 || event.keyCode === 27 && (document.activeElement === document.getElementById('search'))) {
                this.eventFunc.searchMenu()
                console.log('Alt + B')
            }
            // [ B ] : 66
            // [ Esc ] : 27
        })

        wrapper('#web-search-input', 'keyup', (event) => {
            if((event.which && event.which == 13) || (event.keyCode && event.keyCode == 13)) {
                chrome.tabs.create({ url: "https://www.google.com/search?q=" + event.target.value })
                event.target.value = ''
            }
        })

        wrapper('#web-search-submit', 'click', (event) => {
            let val = document.getElementById('web-search-input').value
            chrome.tabs.create({ url: "https://www.google.com/search?q=" + val })
            val = ''
        })
    }

    reflect() {
        this.reflector = new Reflector()
        const data = this.settings
        for(const type in data) {
            if(typeof data[type] === "object") {
                this.setState(data[type])
            }
        }
    }
    setState(data) {
        for(const key in data) {
            const func = this.reflector[key]
            if(typeof func === 'function') {
                func(data[key])
            }
        }
    }
}

class SideBarManager {
    constructor() {
        this.activeItem = null
        this.ev = {
            'expand-menu': new ExpandMenu,
            'search-menu': new BookmarkSearch,
            'select-theme-menu': new SelectTheme,
            'module-visible-menu': new SwitchModuleVisible
        }
        for(const item in this.ev) {
            this.ev[item].state = NOW_CLOSE
        }
        this.addEventListener()
    }
    addEventListener() {
        wrapper('.action-item', 'click', (event) => {
            const target = event.target.id
            this.ev[target].on()
            this.activeItem = this.ev[target].state ? target : null
            this.closeMenu(target)
        })
        wrapper('.create-system-tab', 'click', (event) => {
            this.closeMenu()
            chrome.tabs.create({ url: event.target.dataset.href })
        })
        wrapper('#body-main', 'click', (event) => {
            this.closeMenu()
        })
    }
    closeMenu(activeItem) {
        for(const item in this.ev) {
            if(item != activeItem) {
                this.ev[item].on(TO_CLOSE)
            }
        }
        this.activeItem = null
    }
}

const cm = new ContentsManager()
const ev = new SideBarManager()

chrome.runtime.onMessage.addListener(async(request, sender, sendResponse) => {
    if(request.newtab === 'reload') {
        window.onbeforeunload = () => { window.scrollTo(0, 0) }
        window.location.reload()
    } else if(request.contents === 'reload') {
        cm.reloadContents()
    } else if(request.contents === 'theme') {
        const data = await getStorage('settings')
        cm.setState(data.settings.radio)
    }
})