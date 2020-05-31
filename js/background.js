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
		const itemTree = await getBookmarksTree();
		itemTree.forEach((items) => {
			if ('children' in items) {
					items.children.forEach((bookmark) => {this.FormatBookmarks(bookmark)})
			}
		})
		chrome.storage.local.set({'jsonBookmarks': itemTree[0].children});
		chrome.runtime.sendMessage({contents: 'reload'})
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
				item['visible'] = !item.title.match(/^#/);
				item.children.forEach((sub) => {
						this.OrganizeElementsKey(el, sub);
				});
			}
		}
	}

	async autoTheme() {
		const data = await getStorage('settings')
		this.settings.range = data.settings.range
		let t1 = data.settings.range.sliderLower;
		let t2 = data.settings.range.sliderUpper;
		const now = new Date()
		console.log(this.formatTime(now))
		const h = now.getHours()
		let tm
		if(t1 <= t2) {
			if(t1 <= h && h < t2) {
				console.log('theme1')
				tm = data.settings.select.autoThemePrimary
			} else if(h < t1 || t2 <= h) {
				console.log('theme2')
				tm = data.settings.select.autoThemeSecondary
			}
		} else if(t2 < t1) {
			if(t2 <= h && h < t1) {
				console.log('theme2')
				tm = data.settings.select.autoThemeSecondary
			}else if(t1 <= h || h < t2) {
				console.log('theme1')
				tm = data.settings.select.autoThemePrimary
			}
		}
		if(this.settings.radio.theme !== tm) {
			this.settings.radio.theme = tm
			console.log('tm:', tm)
			this.saveData()
			chrome.runtime.sendMessage({newtab: 'reload'})
			chrome.runtime.sendMessage({option: 'reload'})
		}
	}
}
const con = new ContentsController()

chrome.bookmarks.onChanged.addListener(() => {con.saveBookmarks()})
chrome.bookmarks.onMoved.addListener(() => {con.saveBookmarks()})
chrome.bookmarks.onChildrenReordered.addListener(() => {con.saveBookmarks()})
chrome.bookmarks.onRemoved.addListener(() => {con.saveBookmarks()})
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed')
  // chrome.tabs.create({ url: 'option.html' }) // ------------------------Debug
})
chrome.alarms.onAlarm.addListener((alarm)=>{
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