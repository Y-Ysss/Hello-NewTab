const asyncFunc = callbackFunc => (...args) => new Promise((resolve, reject) => {
    callbackFunc(...args, result => {
        if(chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
        }
        resolve(result);
    });
});

const getStorage = asyncFunc((keys, callback) => {
    chrome.storage.local.get(keys, callback);
});
const setStorage = asyncFunc((keys, callback) => {
    chrome.storage.local.set(keys, callback);
});
const getBookmarksTree = asyncFunc((callback) => {
    chrome.bookmarks.getTree(callback);
});
const getBookmarkItems = asyncFunc((keys, callback) => {
    chrome.bookmarks.get(keys, callback)
})
const wrapper = (key, action, func) => {
    const all = document.querySelectorAll(key)
    for(const item of all) {
        item.addEventListener(action, (event) => { func(event) })
    }
}

class DefaultSettings {
    constructor() {
        this.settings = {
            "toggle": { "tgglIcon": false, "tgglOpenTab": true, "tgglWebSearch": false, "tgglAutoTheme": false },
            "radio": { "tmStyle": "Stylish", "tmTheme": "Light" , "tmColor": "LightBlue" },
            "text": { "txtScale": "", "txtRegexpPattern": "^'", "txtDisableFolderPattern": "", "txtMacyColumns": "", "txtMacyMarginX": "", "txtMacyMarginY": "", "txtMacyBreak": "" },
            "range": { "sliderLower": "7", "sliderUpper": "17" },
            "select": {
                "autoThemePrimaryStyle": "Flat", "autoThemePrimaryTheme": "Light","autoThemePrimaryColor": "LightBlue",
                "autoThemeSecondaryStyle": "Flat", "autoThemeSecondaryTheme": "Dark", "autoThemeSecondaryColor": "LightBlue"
            },
            "format_version": "0.7"
        }
        this.themes = {
            "styles": [
                { "id": "Modern", "label": "Modern" },
                { "id": "Flat", "label": "Flat" },
                { "id": "FullFlat", "label": "Full Flat" },
                { "id": "Stylish", "label": "Stylish" },
                { "id": "Neumorphism", "label": "Neumorphism" },
            ],
            "themes": [
                { "id": "Light", "label": "Light" },
                { "id": "Dark", "label": "Dark" },
                { "id": "Black", "label": "Black" }
            ],
            "colors": [
                { "id": "LightBlue", "label": "Light Blue" },
                { "id": "DarkBlue", "label": "Dark Blue" },
                { "id": "Magenta", "label": "Magenta" },
                { "id": "Orange", "label": "Orange" },
                { "id": "Lime", "label": "Lime" },
                { "id": "White", "label": "White" }
            ]
        }
        this.loadData()
    }
    async loadData() {
        const data = await getStorage(null)
        if(data.settings !== undefined && data.settings.format_version === this.settings.format_version) {
            this.settings = data.settings
        } else {
            this.saveData()
        }
        this.init()
    }
    async saveData() {
        await setStorage({ 'settings': this.settings })
    }
    init() {}

    // ------------------------Debug
    formatTime(date) {
        const year_str = date.getFullYear();
        const month_str = 1 + date.getMonth();
        const day_str = date.getDate();
        const hour_str = date.getHours();
        const minute_str = date.getMinutes();
        const second_str = date.getSeconds();
        let format_str = 'YYYY-MM-DD hh:mm:ss';
        format_str = format_str.replace(/YYYY/g, year_str);
        format_str = format_str.replace(/MM/g, month_str);
        format_str = format_str.replace(/DD/g, day_str);
        format_str = format_str.replace(/hh/g, hour_str);
        format_str = format_str.replace(/mm/g, ('0' + minute_str).slice(-2));
        format_str = format_str.replace(/ss/g, ('0' + second_str).slice(-2));
        return format_str;
    }

    async autoTheme() {
        const data = await getStorage('settings')
        this.settings.range = data.settings.range
        let t1 = data.settings.range.sliderLower;
        let t2 = data.settings.range.sliderUpper;
        const now = new Date()
        console.log(this.formatTime(now))
        const h = now.getHours()
        let st, tm, cl
        if(t1 <= t2) {
            if(t1 <= h && h < t2) {
                console.log('theme1')
                st = data.settings.select.autoThemePrimaryStyle
                tm = data.settings.select.autoThemePrimaryTheme
                cl = data.settings.select.autoThemePrimaryColor
            } else if(h < t1 || t2 <= h) {
                console.log('theme2')
                st = data.settings.select.autoThemeSecondaryStyle
                tm = data.settings.select.autoThemeSecondaryTheme
                cl = data.settings.select.autoThemeSecondaryColor
            }
        } else if(t2 < t1) {
            if(t2 <= h && h < t1) {
                console.log('theme2')
                st = data.settings.select.autoThemeSecondaryStyle
                tm = data.settings.select.autoThemeSecondaryTheme
                cl = data.settings.select.autoThemeSecondaryColor
            } else if(t1 <= h || h < t2) {
                console.log('theme1')
                st = data.settings.select.autoThemePrimaryStyle
                tm = data.settings.select.autoThemePrimaryTheme
                cl = data.settings.select.autoThemePrimaryColor
            }
        }
        if(this.settings.radio.tmStyle !== st || this.settings.radio.tmTheme !== tm || this.settings.radio.tmColor !== cl) {
            this.settings.radio.tmStyle = st
            this.settings.radio.tmTheme = tm
            this.settings.radio.tmColor = cl
            this.saveData()
            chrome.runtime.sendMessage({ newtab: 'reload' })
            chrome.runtime.sendMessage({ option: 'reload' })
        }
    }
}