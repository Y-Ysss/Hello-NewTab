
import { DefaultSettings } from './defaultSettings.js';
import { getStorage, getBookmarkItems } from './browser.js';
import { wrapper } from './wrapper.js';

const getFaviconUrl = (url, size = 16) => {
    const faviconUrl = new URL(chrome.runtime.getURL('/_favicon/'));
    faviconUrl.searchParams.set('pageUrl', url); // this encodes the URL as well
    faviconUrl.searchParams.set('size', String(size));
    return faviconUrl.toString();
}

class BookmarkContents {
    constructor(settings) {
        this.settings = settings
        this.fragment = document.createDocumentFragment()
        this.macy = null
    }
    async append() {
        await this.generateContents()
        this.applyMacy()
        document.getElementById('body-main').appendChild(this.fragment)
        this.fragment = null
    }
    async reload() {
        if(this.macy !== null) {
            this.macy.remove()
            this.macy = null
        }
        document.getElementById('body-main').innerHTML = ''
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
                img.src = getFaviconUrl(item.url)
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
        conf.columns = this.checkValue(data.txtMacyColumns, conf.columns)
        conf.margin.x = this.checkValue(data.txtMacyMarginX, conf.margin.x)

        this.macy = Macy(conf)
    }
    checkValue(a, b) {
        return(a !== "" ? a : b)
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
        this.searchToken = 0
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
        this.searchToken += 1
        document.getElementById('bookmark-search').value = ""
        document.getElementById('bookmark-search-reset').classList.remove('search-reset-visible')
        document.getElementById('bookmark-search-result').textContent = ''
    }
    searchView() {
        const searchToken = ++this.searchToken
        const words = document.getElementById('bookmark-search').value.trim()
        const resultArea = document.getElementById('bookmark-search-result')
        if(words == "") {
            document.getElementById('bookmark-search-reset').classList.remove('search-reset-visible')
            resultArea.textContent = ''
            return
        } else {
            document.getElementById('bookmark-search-reset').classList.add('search-reset-visible')
            chrome.bookmarks.search(words, async(results) => {
                if(searchToken !== this.searchToken) {
                    return
                }
                const fragment = document.createDocumentFragment()
                const bookmarkResults = []
                if(results.length !== 0) {
                    for(const item of results) {
                        if(item.url) {
                            const parent = await getBookmarkItems(item.parentId)
                            if(searchToken !== this.searchToken) {
                                return
                            }
                            bookmarkResults.push({
                                url: item.url,
                                title: item.title == "" ? item.url : item.title,
                                parentTitle: parent?.[0]?.title ?? ''
                            })
                        }
                    }
                    if(bookmarkResults.length !== 0) {
                        const count = document.createElement('div')
                        count.id = 'bookmark-result-count'
                        count.textContent = `${bookmarkResults.length} ${bookmarkResults.length === 1 ? 'bookmark' : 'bookmarks'}`
                        fragment.appendChild(count)
                        for(const item of bookmarkResults) {
                            const link = document.createElement('a')
                            link.className = 'bookmark-search-result-items'
                            link.href = item.url
                            link.title = item.title

                            const favicon = document.createElement('img')
                            favicon.className = 'favicon'
                            favicon.src = getFaviconUrl(item.url)

                            const title = document.createTextNode(item.title)
                            const parent = document.createElement('span')
                            parent.textContent = item.parentTitle

                            link.appendChild(favicon)
                            link.appendChild(title)
                            link.appendChild(parent)
                            fragment.appendChild(link)
                        }
                    } else {
                        const noResults = document.createElement('div')
                        noResults.id = 'bookmark-no-results-found'
                        const image = document.createElement('img')
                        image.src = 'img/no-results-found.svg'
                        const paragraph = document.createElement('p')
                        paragraph.textContent = 'No results found'
                        noResults.appendChild(image)
                        noResults.appendChild(paragraph)
                        fragment.appendChild(noResults)
                    }
                } else {
                    const noResults = document.createElement('div')
                    noResults.id = 'bookmark-no-results-found'
                    const image = document.createElement('img')
                    image.src = 'img/no-results-found.svg'
                    const paragraph = document.createElement('p')
                    paragraph.textContent = 'No results found'
                    noResults.appendChild(image)
                    noResults.appendChild(paragraph)
                    fragment.appendChild(noResults)
                }
                if(searchToken === this.searchToken) {
                    resultArea.textContent = ''
                    resultArea.appendChild(fragment)
                }
            })
        }
    }
}

class FloatMenu {
    positionMenu(menu, anchor) {
        const anchorRect = anchor.getBoundingClientRect()
        const menuRect = menu.getBoundingClientRect()
        const gap = 12
        const viewportPadding = 12
        const maxTop = window.innerHeight - menuRect.height - viewportPadding
        const maxLeft = window.innerWidth - menuRect.width - viewportPadding
        const top = Math.max(viewportPadding, Math.min(anchorRect.top, maxTop))
        const preferredLeft = anchorRect.right + gap
        const fallbackLeft = anchorRect.left - menuRect.width - gap
        const left = preferredLeft <= maxLeft
            ? preferredLeft
            : Math.max(viewportPadding, Math.min(fallbackLeft, maxLeft))

        menu.style.top = `${top}px`
        menu.style.left = `${left}px`
    }
    onDisplay(obj, state, anchor) {
        if(state) {
            obj.classList.remove('activeFloatMenu')
        } else {
            this.positionMenu(obj, anchor)
            obj.classList.add('activeFloatMenu')
        }
    }
}

class SelectTheme extends FloatMenu {
    on(state = this.state) {
        const floatMenu = document.getElementById('float-menu-theme')
        const menu = document.getElementById('select-theme-menu')

        if(state) {
            super.onDisplay(floatMenu, TO_CLOSE, menu)
            menu.classList.remove('active-menu')
        } else {
            super.onDisplay(floatMenu, TO_OPEN, menu)
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
            super.onDisplay(floatMenu, TO_CLOSE, menu)
            menu.classList.remove('active-menu')
        } else {
            super.onDisplay(floatMenu, TO_OPEN, menu)
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
    toPixelValue(value, fallback) {
        const n = Number(value)
        if(Number.isFinite(n) && n > 0) {
            return `${n}px`
        }
        return fallback
    }
    toPercentageValue(value, fallback) {
        const n = Number(value)
        if(Number.isFinite(n)) {
            return `${Math.min(100, Math.max(0, n))}%`
        }
        return fallback
    }
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
        document.getElementById('web-search-area').classList.toggle('displayNone', !value)
    }
    bgPattern(value) {
        // Remove all background pattern classes
        document.body.classList.remove('bg-styledefault', 'bg-singlecolor', 'bg-grid', 'bg-dots', 'bg-gradient', 'bg-image')
        // Add the selected pattern class
        document.body.classList.add(`bg-${value.toLowerCase()}`)
    }
    txtBgImage(value) {
        // Apply custom background image URL
        if(value && value.trim() !== '') {
            document.documentElement.style.setProperty('--bg-image-url', `url("${value}")`)
        } else {
            document.documentElement.style.setProperty('--bg-image-url', 'none')
        }
    }
    txtBgBaseColor(value) {
        document.documentElement.style.setProperty('--bg-base-color', value || '#ffffff')
    }
    txtBgPatternColor(value) {
        document.documentElement.style.setProperty('--bg-pattern-color', value || '#c8c8c8')
    }
    txtBgGradientColor1(value) {
        document.documentElement.style.setProperty('--bg-gradient-color1', value || '#c8dcff')
    }
    txtBgGradientColor2(value) {
        document.documentElement.style.setProperty('--bg-gradient-color2', value || '#dcc8ff')
    }
    txtBgGridLineWidth(value) {
        document.documentElement.style.setProperty('--bg-grid-line-width', this.toPixelValue(value, '2px'))
    }
    txtBgGridSpacingX(value) {
        document.documentElement.style.setProperty('--bg-grid-spacing-x', this.toPixelValue(value, '60px'))
    }
    txtBgGridSpacingY(value) {
        document.documentElement.style.setProperty('--bg-grid-spacing-y', this.toPixelValue(value, '60px'))
    }
    txtBgGridOpacity(value) {
        document.documentElement.style.setProperty('--bg-grid-opacity', this.toPercentageValue(value, '50%'))
    }
    txtBgDotsLineWidth(value) {
        document.documentElement.style.setProperty('--bg-dots-size', this.toPixelValue(value, '1px'))
    }
    txtBgDotsSpacingX(value) {
        document.documentElement.style.setProperty('--bg-dots-spacing-x', this.toPixelValue(value, '20px'))
    }
    txtBgDotsSpacingY(value) {
        document.documentElement.style.setProperty('--bg-dots-spacing-y', this.toPixelValue(value, '20px'))
    }
    txtBgDotsOpacity(value) {
        document.documentElement.style.setProperty('--bg-dots-opacity', this.toPercentageValue(value, '50%'))
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
            optn.value = item.id
            optn.appendChild(document.createTextNode(item.label))
            fragment.appendChild(optn)
        }
        return fragment
    }
    addEventListener() {
        wrapper('input[type=radio]', 'click', async (event) => {
            const target = event.currentTarget
            this.settings.radio[target.name] = target.id
            this.setState(this.settings.radio)
            await this.saveData()
        })
        wrapper('html', 'keydown', (event) => {
            if(event.altKey && event.keyCode === 76 || event.keyCode === 27 && (document.activeElement === document.getElementById('search'))) {
                document.getElementById('search-menu').click();
            }
            // [ L ] : 76
            // [ Esc ] : 27
        })

        wrapper('#web-search-input', 'keyup', (event) => {
            if((event.which && event.which == 13) || (event.keyCode && event.keyCode == 13)) {
                chrome.tabs.create({ url: "https://www.google.com/search?q=" + event.currentTarget.value })
                event.currentTarget.value = ''
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
            if(typeof this.reflector[key] === 'function') {
                this.reflector[key](data[key])
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
            const target = event.currentTarget.id
            this.ev[target].on()
            this.activeItem = this.ev[target].state ? target : null
            this.closeMenu(target)
        })
        wrapper('.create-system-tab', 'click', (event) => {
            this.closeMenu()
            chrome.tabs.create({ url: event.currentTarget.dataset.href })
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

chrome.storage.onChanged.addListener((changes, areaName) => {
    if(areaName !== 'local') {
        return
    }
    if(changes.settings) {
        cm.settings = changes.settings.newValue
        cm.reflect()
    }
    if(changes.jsonBookmarks) {
        void cm.reloadContents()
    }
})
