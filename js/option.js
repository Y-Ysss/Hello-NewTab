class Reflector {
    static toggle(key, value) {
        if(value) {
            document.getElementById(key).classList.add('toggle-on')
        }
    }
    static text(key, value) {
        document.getElementById(key).value = value
    }
    static range(key, value) {
        for(const item of document.querySelectorAll(`.${key}`)) {
            item.value = value
        }
        document.getElementById(`${key}Range`).value = value
    }
    static radio(key, value) {
        document.getElementById(value).checked = true
    }
    static select(key, value) {
        for(const item of document.querySelectorAll(`select[name="${key}"]`)) {
            item.value = value
        }
    }
}

class ReflectSettings extends DefaultSettings {
    constructor() {
        super()
    }
    init() {
        this.addThemeOptions()
        this.reflect()
        this.addElementsEventListener()
    }
    addThemeOptions() {
        const styles = this.themes.styles
        const colors = this.themes.colors
        document.getElementById('theme-styles').appendChild(this.generateRadio(styles, 'style'))
        document.getElementById('theme-colors').appendChild(this.generateRadio(colors, 'color'))
        document.getElementById('theme-primary-style').appendChild(this.generateOption(styles))
        document.getElementById('theme-primary-color').appendChild(this.generateOption(colors))
        document.getElementById('theme-secondary-style').appendChild(this.generateOption(styles))
        document.getElementById('theme-secondary-color').appendChild(this.generateOption(colors))
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
    reflect() {
        const data = this.settings
        for(const type in data) {
            if(typeof data[type] === "object") {
                this.setState(type, data[type])
            }
        }
    }
    setState(type, data) {
        for(const key in data) {
            Reflector[type](key, data[key])
        }
    }
    wrapper(key, action, func) {
        const all = document.querySelectorAll(key)
        for(const item of all) {
            item.addEventListener(action, (event) => { func(event) })
        }
    }

    async setupAlarms() {
        console.log(this.settings)
        const now = new Date()
        console.log(this.formatTime(now))
        let t = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1)
        console.log(this.formatTime(t))
        chrome.alarms.create('adjustment', { 'when': t.getTime() })
    }

    addElementsEventListener() {
        this.wrapper('#side-menu a', 'click', (event) => {
            window.scrollTo(0, document.getElementById(event.target.dataset.anchor).offsetTop - 16)
            console.log(event.target.dataset.anchor)
        })
        this.wrapper('#save-settings', 'click', (event) => {
            this.saveData()
            chrome.runtime.sendMessage({ newtab: 'reload' })
            chrome.runtime.sendMessage({ option: 'reload' })
            if(this.settings.toggle.tgglAutoTheme) {
                this.autoTheme(), this.setupAlarms()
            } else {
                chrome.alarms.clearAll(() => { console.log('Alarms.clearAll') })
            }
            let t = document.getElementById('toast')
            t.style.transform = 'translateY(-6rem)'
            setTimeout((a) => { a.style.transform = 'translateY(6rem)' }, 2000, t)
        })
        this.wrapper('.toggle', 'click', (event) => {
            event.target.classList.toggle('toggle-on')
            this.settings.toggle[event.target.id] = event.target.classList.contains('toggle-on')
        })
        this.wrapper('.text-input', 'blur', (event) => {
            this.settings.text[event.target.id] = event.target.value
        })
        this.wrapper('input[type="radio"]', 'click', (event) => {
            this.settings.radio[event.target.name] = event.target.id
        })
        this.wrapper('input[type="range"]', 'change', (event) => {
            this.settings.range[event.target.name] = event.target.value
            for(const item of document.querySelectorAll(`.${event.target.name}`)) {
                item.value = event.target.value
            }
        })
        this.wrapper('.text-synchronize-slider', 'change', (event) => {
            let val = event.target.value;
            if(!Number.isInteger(val)) { val = Math.round(val) }
            if(val < 0) { val = 0 } else if(val > 24) { val = 24 }

            const name = event.target.name
            this.settings.range[name] = val
            for(const item of document.querySelectorAll(`.${name}`)) {
                item.value = val
            }
            for(const item of document.querySelectorAll(`#${name}Range`)) {
                item.value = val
            }
        })
        this.wrapper('select', 'change', (event) => {
            this.settings.select[event.target.name] = event.target.value
        })
    }
}

class ExtensionInfo {
    constructor() {
        this.versionInfo()
        this.wrapper('https://api.github.com/repos/Y-Ysss/Hello-NewTab/releases/latest', this.gitReleaseInfo)
        this.wrapper('https://api.github.com/repos/Y-Ysss/Hello-NewTab/commits', this.gitCommitsInfo)
    }
    wrapper(url, func) {
        fetch(url).then((response) => response.json()).then((data) => {
            func(data)
        })
    }

    versionInfo() {
        const manifestData = chrome.runtime.getManifest();
        let str = `<div class="content-section"><div class="section-title">Installed Extension</div><div class="section-items-slim"><div class="section-item-text">バージョン : ${manifestData.version}</div></div></div>`
        document.getElementById('ExtensionInfo').insertAdjacentHTML('beforeend', str);
    }

    gitReleaseInfo(data) {
        const manifestData = chrome.runtime.getManifest();
        let str
        if(data.message !== undefined) { return }
        if(manifestData.version !== data.name) {
            const body = data.body.replace(/#{1,6}(.+?)\r?\n/g, '<span>$1</span><br>')
            str = `<div class="content-section"><div class="section-title">Latest Release</div><div class="section-items-slim"><div class="section-item-text">バージョン : ${data.name}</div></div><div class="section-items-slim"><div class="section-item-text"><b>What's New</b><br>${body}</div></div><div class="section-items-slim"><div class="section-item-text">URL : <a class="url-text" href="${data.html_url}" target="_blank"></a></div></div></div>`
            str = str.replace(/\r?\n/g, '<br>')
            document.getElementById('ExtensionInfo').insertAdjacentHTML('beforeend', str);
        }
    }

    gitCommitsInfo(data) {
        let str = ''
        for(let i = 0; i < 5; i++) {
            str += `<div class="content-section"><div class="section-title">${data[i].commit.message}</div><div class="section-items-continuation"><div class="section-item-text">${(data[i].commit.author.date).replace('T', ', ').slice(0, -1)} (UTC)</div></div><div class="section-items"><div class="section-item-text"><a class="url-text" href="${data[i].html_url}" target="_blank"></a></div></div></div>`;
        }
        document.getElementById('gitCommitsInfo').insertAdjacentHTML('beforeend', str);
    }
}

const opt = new ReflectSettings()
const info = new ExtensionInfo()

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.option === 'reload') {
        window.location.reload()
    }
});

// chrome.storage.onChanged.addListener((changes) => {
// 	console.log(changes)
// 	if(changes.hasOwnProperty('settings')) {
// 		window.location.reload()
// 	}
// })