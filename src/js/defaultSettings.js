import { getStorage, setStorage } from "./browser.js";

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value)

const mergeSettings = (defaults, storedValue) => {
    const stored = isRecord(storedValue) ? storedValue : {}
    const hasAllDefaults = Object.entries(defaults).every(([key, defaultValue]) => {
        if(isRecord(defaultValue)) {
            const storedGroup = stored[key]
            return isRecord(storedGroup) && Object.keys(defaultValue).every(item => Object.prototype.hasOwnProperty.call(storedGroup, item))
        }
        return Object.prototype.hasOwnProperty.call(stored, key)
    })

    const settings = { ...defaults, ...stored }
    for(const [key, defaultValue] of Object.entries(defaults)) {
        if(isRecord(defaultValue)) {
            settings[key] = {
                ...defaultValue,
                ...(isRecord(stored[key]) ? stored[key] : {})
            }
        }
    }
    settings.format_version = defaults.format_version

    return {
        settings,
        needsSave: !hasAllDefaults || stored.format_version !== defaults.format_version
    }
}

export class DefaultSettings {
    constructor() {
        this.settings = {
            "toggle": { "tgglIcon": false, "tgglOpenTab": true, "tgglWebSearch": false, "tgglAutoTheme": false },
            "radio": { "tmStyle": "Stylish", "tmTheme": "Light" , "tmColor": "LightBlue", "bgPattern": "StyleDefault" },
            "text": { "txtScale": "", "txtRegexpPattern": "^'", "txtDisableFolderPattern": "", "txtMacyColumns": "", "txtMacyMarginX": "", "txtMacyBreak": "", "txtBgImage": "", "txtBgBaseColor": "#ffffff", "txtBgPatternColor": "#c8c8c8", "txtBgGradientColor1": "#c8dcff", "txtBgGradientColor2": "#dcc8ff", "txtBgGridLineWidth": "2", "txtBgGridSpacingX": "60", "txtBgGridSpacingY": "60", "txtBgGridOpacity": "50", "txtBgDotsLineWidth": "1", "txtBgDotsSpacingX": "20", "txtBgDotsSpacingY": "20", "txtBgDotsOpacity": "50" },
            "range": { "sliderLower": "7", "sliderUpper": "17" },
            "select": {
                "autoThemePrimaryStyle": "Flat", "autoThemePrimaryTheme": "Light","autoThemePrimaryColor": "LightBlue",
                "autoThemeSecondaryStyle": "Flat", "autoThemeSecondaryTheme": "Dark", "autoThemeSecondaryColor": "LightBlue"
            },
            "format_version": "0.8"
        }
        this.themes = {
            "styles": [
                { "id": "Modern", "label": "Modern" },
                { "id": "Flat", "label": "Flat" },
                { "id": "FullFlat", "label": "Full Flat" },
                { "id": "Glass", "label": "Glass" },
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
            ],
            "backgrounds": [
                { "id": "StyleDefault", "label": "Style Default" },
                { "id": "SingleColor", "label": "Single Color (Custom)" },
                { "id": "Grid", "label": "Grid Pattern" },
                { "id": "Dots", "label": "Dots Pattern" },
                { "id": "Gradient", "label": "Gradient Pattern" },
                { "id": "Image", "label": "Image (Custom URL)" }
            ]
        }
        this.defaultSettings = this.settings
        this.loadData()
    }
    async loadData() {
        const data = await getStorage(null)
        const merged = mergeSettings(this.defaultSettings, data.settings)
        this.settings = merged.settings

        if(merged.needsSave) {
            await this.saveData()
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
        if(!isRecord(data.settings)) {
            return
        }
        const latestSettings = mergeSettings(this.defaultSettings, data.settings).settings
        const t1 = Number(latestSettings.range?.sliderLower)
        const t2 = Number(latestSettings.range?.sliderUpper)
        if(!Number.isFinite(t1) || !Number.isFinite(t2)) {
            return
        }
        const now = new Date()
        console.log(this.formatTime(now))
        const h = now.getHours()
        let usePrimary
        if(t1 <= t2) {
            usePrimary = t1 <= h && h < t2
        } else {
            usePrimary = h >= t1 || h < t2
        }

        const prefix = usePrimary ? 'autoThemePrimary' : 'autoThemeSecondary'
        console.log(usePrimary ? 'theme1' : 'theme2')
        const select = latestSettings.select ?? {}
        const latestRadio = latestSettings.radio ?? {}
        const st = select[`${prefix}Style`]
        const tm = select[`${prefix}Theme`]
        const cl = select[`${prefix}Color`]
        this.settings = latestSettings

        if(latestRadio.tmStyle !== st || latestRadio.tmTheme !== tm || latestRadio.tmColor !== cl) {
            this.settings = {
                ...latestSettings,
                radio: { ...latestRadio, tmStyle: st, tmTheme: tm, tmColor: cl }
            }
            await this.saveData()
        }
    }
}
