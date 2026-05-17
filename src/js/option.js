
import { DefaultSettings } from './defaultSettings.js';

class Reflector {
    static toggle(key, value) {
        document.getElementById(key).classList.toggle('toggle-on', Boolean(value))
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
        const radio = document.getElementById(value)
        if(radio !== null) {
            radio.checked = true
        }
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
        this.isReady = false
    }
    init() {
        this.regenerate = false
        this.addThemeOptions()
        this.reflect()
        this.addElementsEventListener()
        this.isReady = true
    }
    addThemeOptions() {
        const styles = this.themes.styles
        const themes = this.themes.themes
        const colors = this.themes.colors
        document.getElementById('theme-styles').appendChild(this.generateRadio(styles, 'tmStyle'))
        document.getElementById('theme-themes').appendChild(this.generateRadio(themes, 'tmTheme'))
        document.getElementById('theme-colors').appendChild(this.generateRadio(colors, 'tmColor'))
        document.getElementById('theme-primary-style').appendChild(this.generateOption(styles))
        document.getElementById('theme-primary-theme').appendChild(this.generateOption(themes))
        document.getElementById('theme-primary-color').appendChild(this.generateOption(colors))
        document.getElementById('theme-secondary-style').appendChild(this.generateOption(styles))
        document.getElementById('theme-secondary-theme').appendChild(this.generateOption(themes))
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
            window.scrollTo(0, document.getElementById(event.currentTarget.dataset.anchor).offsetTop - 16)
            // console.log(event.currentTarget.dataset.anchor)
        })
        this.wrapper('#save-settings', 'click', async(event) => {
            await this.saveData()

            if(this.settings.toggle.tgglAutoTheme) {
                await this.autoTheme()
                this.setupAlarms()
            } else {
                chrome.alarms.clear('adjustment', () => { console.log('Alarms.clear adjustment') })
                chrome.alarms.clear('interval', () => { console.log('Alarms.clear interval') })
            }
            const t = document.getElementById('toast')
            t.style.transform = 'translateY(-6rem)'
            setTimeout((a) => { a.style.transform = 'translateY(6rem)' }, 2000, t)
        })
        this.wrapper('.toggle', 'click', (event) => {
            event.currentTarget.classList.toggle('toggle-on')
            this.settings.toggle[event.currentTarget.id] = event.currentTarget.classList.contains('toggle-on')
        })
        this.wrapper('.text-input', 'blur', (event) => {
            this.settings.text[event.currentTarget.id] = event.currentTarget.value
        })
        this.wrapper('.sw-disable', 'click', (event) => {
            const name = event.currentTarget.dataset.targetInput
            document.getElementById('txt' + name).disabled = !event.currentTarget.checked
            this.regenerate = true
        })
        this.wrapper('.regenerate', 'keyup', (event) => {
            const saveBtn = document.getElementById('save-settings')
            const errorMsg = document.getElementById(event.currentTarget.id + 'Error')
            try {
                new RegExp(event.currentTarget.value)
                errorMsg.innerText = ''
                saveBtn.disabled = false
            } catch (error) {
                errorMsg.innerText = '正規表現が正しくありません'
                saveBtn.disabled = true
            }
            this.regenerate = true
        })
        this.wrapper('input[type="radio"]', 'click', (event) => {
            this.settings.radio[event.currentTarget.name] = event.currentTarget.id
        })
        this.wrapper('input[type="range"]', 'change', (event) => {
            this.settings.range[event.currentTarget.name] = event.currentTarget.value
            for(const item of document.querySelectorAll(`.${event.currentTarget.name}`)) {
                item.value = event.currentTarget.value
            }
        })
        this.wrapper('.text-synchronize-slider', 'change', (event) => {
            let val = event.currentTarget.value;
            if(!Number.isInteger(val)) { val = Math.round(val) }
            if(val < 0) { val = 0 } else if(val > 24) { val = 24 }

            const name = event.currentTarget.name
            this.settings.range[name] = val
            for(const item of document.querySelectorAll(`.${name}`)) {
                item.value = val
            }
            for(const item of document.querySelectorAll(`#${name}Range`)) {
                item.value = val
            }
        })
        this.wrapper('select', 'change', (event) => {
            this.settings.select[event.currentTarget.name] = event.currentTarget.value
        })
    }
}

class ExtensionInfo {
    constructor() {
        this.versionInfo()
        this.wrapper('https://api.github.com/repos/Y-Ysss/Hello-NewTab/releases/latest', this.gitReleaseInfo)
    }
    wrapper(url, func) {
        fetch(url).then((response) => response.json()).then((data) => {
            func(data)
        }).catch((error) => {
            console.log(error)
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
}

const opt = new ReflectSettings()
const info = new ExtensionInfo()

chrome.storage.onChanged.addListener((changes, areaName) => {
    if(areaName !== 'local' || !changes.settings || !opt.isReady) {
        return
    }
    opt.settings = changes.settings.newValue
    opt.reflect()
})
