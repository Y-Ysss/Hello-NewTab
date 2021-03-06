class ContentsController extends DefaultSettings {
    constructor() {
        super()
    }
    init() {
        this.saveBookmarks()
    }
    async saveBookmarks() {
        const data = await getStorage('settings')
        console.log(data.settings)
        this.hideFolderPattern = data.settings.text.txtRegexpPattern
        const itemTree = await getBookmarksTree();
        itemTree.forEach((items) => {
            if('children' in items) {
                items.children.forEach((bookmark) => { this.FormatBookmarks(bookmark) })
            }
        })
        chrome.storage.local.set({ 'jsonBookmarks': itemTree[0].children });
        chrome.runtime.sendMessage({ contents: 'reload' })
    }
    FormatBookmarks(item) {
        const el = ['children', 'id', 'parentId', 'title', 'url']
        this.OrganizeElementsKey(el, item)
    }

    OrganizeElementsKey(el, item) {
        for(let key in item) {
            if(el.indexOf(key) < 0) {
                delete item[key]
            }
            if("children" in item && item.children.length > 0) {
                item['visible'] = !item.title.match(new RegExp(this.hideFolderPattern));
                item.children.forEach((sub) => {
                    this.OrganizeElementsKey(el, sub);
                });
            }
        }
    }

}
const con = new ContentsController()
chrome.bookmarks.onCreated.addListener(() => { con.saveBookmarks() })
chrome.bookmarks.onChanged.addListener(() => { con.saveBookmarks() })
chrome.bookmarks.onMoved.addListener(() => { con.saveBookmarks() })
chrome.bookmarks.onChildrenReordered.addListener(() => { con.saveBookmarks() })
chrome.bookmarks.onRemoved.addListener(() => { con.saveBookmarks() })
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed')
        // chrome.tabs.create({url: 'option.html' }) // ------------------------Debug
})
chrome.alarms.onAlarm.addListener((alarm) => {
        console.log(alarm.name, ':', new Date())
        if(alarm.name === 'adjustment') {
            con.autoTheme()
            chrome.alarms.create("interval", { "delayInMinutes": 1 });
        } else {
            con.autoTheme()
        }
    })
    // chrome.storage.onChanged.addListener((changes) => {
    // 	console.log(changes)
    // 	if(changes.hasOwnProperty('settings')) {
    // 		con.saveBookmarks()
    // 	}
    // })