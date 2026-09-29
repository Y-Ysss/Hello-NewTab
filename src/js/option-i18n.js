const MESSAGES = {
    ja: {
        language: '言語 (Optionページのみ)',
        general: '一般',
        numberPlaceholder: '数値',
        save: '保存する',
        saved: '設定を保存しました',
        openInNewTab: '新しいタブで開く',
        openBookmarksInNewTab: 'ブックマークを新しいタブで開く',
        webSearchBar: 'ウェブ検索バー',
        showWebSearchBar: '検索バーを表示する（非推奨）',
        page: 'ページ',
        useDefaultFavicon: 'デフォルトのファビコン（ウェブページのアイコン）を使用する',
        pageScale: 'ページの拡大／縮小（初期値：100%）',
        pageStyle: 'ページのスタイル',
        pageTheme: 'ページテーマ',
        pageColor: 'ページカラー',
        backgroundPattern: '背景パターン',
        backgroundImageUrl: '背景画像 URL',
        backgroundColor: '背景色',
        patternColor: 'パターン色',
        gridLineWidth: 'グリッド線の幅 [px]',
        gridSpacing: 'グリッド間隔 X/Y [px]',
        gridOpacity: 'グリッドの不透明度 [%]',
        dotsSize: 'ドットのサイズ [px]',
        dotsSpacing: 'ドットの間隔 X/Y [px]',
        dotsOpacity: 'ドットの不透明度 [%]',
        gradientColor1: 'グラデーション色 1',
        gradientColor2: 'グラデーション色 2',
        appearancePreview: '外観プレビュー',
        previewStyle: 'スタイル',
        previewTheme: 'テーマ',
        previewColor: 'カラー',
        previewPattern: 'パターン',
        experimental: '実験的機能',
        autoTheme: 'オートテーマ（非推奨）',
        enableAutoTheme: 'オートテーマを有効にする（ページのスタイルより優先）',
        theme1: 'テーマ 1',
        theme2: 'テーマ 2',
        timeRangeSeparator: ' ～ ',
        timeRangeEnd: '時まで',
        timeSettings: '時間設定',
        masonryLayout: 'メイソンリーレイアウト',
        columnsDefault: '列数（初期値：8）',
        marginXDefault: 'X方向の余白（初期値：30）',
        breakpointsDefault: 'ブレークポイント（初期値：{ 1200:5, 990:4, 780:3, 620:2, 430:1 }）',
        hiddenExcludedFolders: 'フォルダーの非表示・除外（正規表現を使用できます）',
        hiddenFolders: '非表示にするフォルダー',
        excludedFolders: '除外するフォルダー',
        regexpPattern: '正規表現パターン',
        pattern: 'パターン',
        description: '説明',
        regexStart: '直後の文字が文字列の先頭にある場合に一致',
        regexEnd: '直前の文字が文字列の末尾にある場合に一致',
        regexAnyChar: '任意の1文字に一致',
        regexZeroMoreGreedy: '直前の文字の0回以上の繰り返しに最長一致',
        regexOneMoreGreedy: '直前の文字の1回以上の繰り返しに最長一致',
        regexZeroOneGreedy: '直前の文字の0回または1回の出現に最長一致',
        regexOneMoreLazy: '直前の文字の1回以上の繰り返しに最短一致',
        regexZeroMoreLazy: '直前の文字の0回以上の繰り返しに最短一致',
        regexZeroOneLazy: '直前の文字の0回または1回の出現に最短一致',
        regexOr: '左右どちらかの条件に一致（OR）',
        regexClass: '角括弧内のいずれか1文字に一致',
        regexNegatedClass: '角括弧内の文字以外に一致',
        regexGroup: 'パターンをグループ化',
        regexExactCount: '繰り返し回数を指定',
        regexMinCount: '繰り返しの最小回数を指定',
        regexGreedyRange: '最小から最大までの繰り返しに最長一致',
        regexLazyRange: '最小から最大までの繰り返しに最短一致',
        sideMenu: 'サイドメニュー',
        menuExpand: 'メニューを広げる',
        menuExpandDescription: 'メニューを広げてページ名を表示します。',
        bookmarkSearch: 'ブックマークを検索',
        bookmarkSearchDescription: '[Alt] + [L] で検索欄に移動し、[Esc] キーでフォーカスを解除できます。',
        bookmarks: 'ブックマーク',
        history: '履歴',
        downloads: 'ダウンロード',
        extensions: '拡張機能',
        settings: '設定',
        thisExtensionOptions: 'この拡張機能のオプション',
        switchTheme: 'テーマを切り替える',
        toggleHiddenFolders: '隠しフォルダーの表示／非表示',
        reportProblem: '不具合を報告する',
        reportIntro: 'この拡張機能で不具合が発生した場合は、',
        reportOutro: 'からご報告ください。',
        madeBy: '開発者',
        javascriptLibraries: 'JavaScript ライブラリ',
        icons: 'アイコン',
        name: '名前：yuyosy',
        github: 'GitHub：',
        regexInvalid: '正規表現が正しくありません',
        installedExtension: 'インストール済みの拡張機能',
        version: 'バージョン',
        whatsNew: 'このバージョンの変更点',
        releaseList: 'リリース一覧：',
        releaseNoteGlass: 'Glass テーマと背景パターンのカスタマイズを追加',
        releaseNotePreview: 'オプションページに外観プレビューを追加',
        releaseNoteSearch: '検索ボタンのデザインをスタイルごとに調整',
        releaseNoteMigration: '1.1.0 からの設定引き継ぎを改善',
        releaseNoteAutoTheme: '自動テーマの時刻判定と新規タブのレイアウト反映を修正',
        releaseNoteFlash: '新規タブ読み込み時にカードとサイドバーの枠線が一瞬暗く見える問題を修正'
    },
    en: {
        language: 'Language (Options page only)',
        general: 'General',
        numberPlaceholder: 'Number',
        save: 'Save settings',
        saved: 'Settings saved',
        openInNewTab: 'Open in new tab',
        openBookmarksInNewTab: 'Open bookmarks in a new tab',
        webSearchBar: 'Web search bar',
        showWebSearchBar: 'Show the search bar (deprecated)',
        page: 'Page',
        useDefaultFavicon: 'Use the default favicon (web page icon)',
        pageScale: 'Page zoom (default: 100%)',
        pageStyle: 'Page style',
        pageTheme: 'Page theme',
        pageColor: 'Page color',
        backgroundPattern: 'Background pattern',
        backgroundImageUrl: 'Background image URL',
        backgroundColor: 'Background color',
        patternColor: 'Pattern color',
        gridLineWidth: 'Grid line width [px]',
        gridSpacing: 'Grid spacing X/Y [px]',
        gridOpacity: 'Grid opacity [%]',
        dotsSize: 'Dot size [px]',
        dotsSpacing: 'Dot spacing X/Y [px]',
        dotsOpacity: 'Dots opacity [%]',
        gradientColor1: 'Gradient color 1',
        gradientColor2: 'Gradient color 2',
        appearancePreview: 'Appearance preview',
        previewStyle: 'Style',
        previewTheme: 'Theme',
        previewColor: 'Color',
        previewPattern: 'Pattern',
        experimental: 'Experimental',
        autoTheme: 'Automatic theme (Deprecated)',
        enableAutoTheme: 'Enable automatic theme (overrides the page style)',
        theme1: 'Theme 1',
        theme2: 'Theme 2',
        timeRangeSeparator: ' – ',
        timeRangeEnd: '',
        timeSettings: 'Time settings',
        masonryLayout: 'Masonry layout',
        columnsDefault: 'Columns (default: 8)',
        marginXDefault: 'Margin X (default: 30)',
        breakpointsDefault: 'Breakpoints (default: { 1200:5, 990:4, 780:3, 620:2, 430:1 })',
        hiddenExcludedFolders: 'Folder visibility and exclusion (regular expressions supported)',
        hiddenFolders: 'Hidden folders',
        excludedFolders: 'Excluded folders',
        regexpPattern: 'Regular expression patterns',
        pattern: 'Pattern',
        description: 'Description',
        regexStart: 'Match when the following text is at the start of the string',
        regexEnd: 'Match when the preceding text is at the end of the string',
        regexAnyChar: 'Match any single character',
        regexZeroMoreGreedy: 'Greedy match for zero or more repetitions of the preceding character',
        regexOneMoreGreedy: 'Greedy match for one or more repetitions of the preceding character',
        regexZeroOneGreedy: 'Greedy match for zero or one occurrence of the preceding character',
        regexOneMoreLazy: 'Lazy match for one or more repetitions of the preceding character',
        regexZeroMoreLazy: 'Lazy match for zero or more repetitions of the preceding character',
        regexZeroOneLazy: 'Lazy match for zero or one occurrence of the preceding character',
        regexOr: 'Match either the left or right condition (OR)',
        regexClass: 'Match any one character inside the brackets',
        regexNegatedClass: 'Match any character not inside the brackets',
        regexGroup: 'Group the pattern',
        regexExactCount: 'Specify the number of repetitions',
        regexMinCount: 'Specify only the minimum number of repetitions',
        regexGreedyRange: 'Greedy match for repetitions from the minimum to maximum',
        regexLazyRange: 'Lazy match for repetitions from the minimum to maximum',
        sideMenu: 'Side menu',
        menuExpand: 'Expand the menu',
        menuExpandDescription: 'Expand the menu to show page names.',
        bookmarkSearch: 'Search bookmarks',
        bookmarkSearchDescription: 'Press [Alt] + [L] to focus the search field, or [Esc] to clear focus.',
        bookmarks: 'Bookmarks',
        history: 'History',
        downloads: 'Downloads',
        extensions: 'Extensions',
        settings: 'Settings',
        thisExtensionOptions: 'Options for this extension',
        switchTheme: 'Switch theme',
        toggleHiddenFolders: 'Show or hide hidden folders',
        reportProblem: 'Report a problem',
        reportIntro: 'If you find a problem with this extension, please report it on ',
        reportOutro: '.',
        madeBy: 'Made by',
        javascriptLibraries: 'JavaScript libraries',
        icons: 'Icons',
        name: 'Name: yuyosy',
        github: 'GitHub:',
        regexInvalid: 'The regular expression is invalid',
        installedExtension: 'Installed extension',
        version: 'Version',
        whatsNew: 'What’s new in this version',
        releaseList: 'All releases:',
        releaseNoteGlass: 'Added the Glass theme and background pattern customization',
        releaseNotePreview: 'Added an appearance preview to the options page',
        releaseNoteSearch: 'Adjusted the search button design for each style',
        releaseNoteMigration: 'Improved settings migration from version 1.1.0',
        releaseNoteAutoTheme: 'Fixed automatic theme time checks and applying its layout on new tabs',
        releaseNoteFlash: 'Fixed card and sidebar borders briefly appearing dark while a new tab loads'
    }
}

const OPTION_LABELS = {
    style: {
        Modern: 'Modern', Flat: 'Flat', FullFlat: 'Full Flat', Glass: 'Glass',
        Stylish: 'Stylish', Neumorphism: 'Neumorphism'
    },
    theme: { Light: 'Light', Dark: 'Dark', Black: 'Black' },
    color: {
        LightBlue: 'Light Blue', DarkBlue: 'Dark Blue', Magenta: 'Magenta',
        Orange: 'Orange', Lime: 'Lime', White: 'White'
    },
    background: {
        StyleDefault: { ja: 'スタイル既定', en: 'Style Default' },
        SingleColor: { ja: '単色（カスタム）', en: 'Single Color (Custom)' },
        Grid: { ja: 'グリッドパターン', en: 'Grid Pattern' },
        Dots: { ja: 'ドットパターン', en: 'Dots Pattern' },
        Gradient: { ja: 'グラデーションパターン', en: 'Gradient Pattern' },
        Image: { ja: '画像（カスタム URL）', en: 'Image (Custom URL)' }
    }
}

export class OptionI18n {
    constructor() {
        const savedLanguage = localStorage.getItem('optionLanguage')
        this.preference = ['auto', 'ja', 'en'].includes(savedLanguage) ? savedLanguage : 'auto'
        this.language = this.resolveLanguage(this.preference)
        this.apply()
        document.getElementById('option-language').value = this.preference
        document.getElementById('option-language').addEventListener('change', event => {
            this.preference = ['auto', 'ja', 'en'].includes(event.currentTarget.value) ? event.currentTarget.value : 'auto'
            this.language = this.resolveLanguage(this.preference)
            localStorage.setItem('optionLanguage', this.preference)
            this.apply()
            document.dispatchEvent(new CustomEvent('option-language-changed'))
        })
        window.addEventListener('languagechange', () => {
            if(this.preference !== 'auto') {
                return
            }
            this.language = this.resolveLanguage('auto')
            this.apply()
            document.dispatchEvent(new CustomEvent('option-language-changed'))
        })
    }

    resolveLanguage(preference) {
        if(preference === 'ja' || preference === 'en') {
            return preference
        }
        return (navigator.language || '').toLowerCase().startsWith('ja') ? 'ja' : 'en'
    }

    t(key) {
        return MESSAGES[this.language][key] ?? MESSAGES.en[key] ?? key
    }

    optionLabel(category, id, fallback = id) {
        const label = OPTION_LABELS[category]?.[id]
        if(label && typeof label === 'object') {
            return label[this.language] ?? fallback
        }
        return label ?? fallback
    }

    apply() {
        document.documentElement.lang = this.language
        document.querySelectorAll('[data-i18n]').forEach(element => {
            element.textContent = this.t(element.dataset.i18n)
        })
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            element.placeholder = this.t(element.dataset.i18nPlaceholder)
        })
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            element.title = this.t(element.dataset.i18nTitle)
        })
        document.querySelectorAll('[data-i18n-if-set]').forEach(element => {
            if(element.textContent.trim()) {
                element.textContent = this.t(element.dataset.i18nIfSet)
            }
        })
        document.querySelectorAll('[data-option-category][data-option-id]').forEach(element => {
            element.textContent = this.optionLabel(element.dataset.optionCategory, element.dataset.optionId, element.dataset.optionFallback)
        })
    }
}
