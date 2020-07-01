class BookmarkContents {
	constructor(settings) {
		this.settings = settings
		this.contentModule = document.getElementById('content-module-template')
		this.contentModuleList = document.getElementById('li-template')
		this.fragment = document.createDocumentFragment()
	}
	async append() {
		await this.generateContents()
		this.applyMacy()
		document.getElementById('body-main').appendChild(this.fragment);
	}
	reload() {
		document.getElementById('body-main').textContent = null;
		this.append()
	}
	async generateContents() {
		const data = await getStorage('jsonBookmarks');
		for(let i in data.jsonBookmarks) {
			this.generate(data.jsonBookmarks[i].title, true, data.jsonBookmarks[i].children);
		}
	}
	generate(folderName, visible, items) {
		let contentModuleClone = document.importNode(this.contentModule.content, true),
		contentModule = contentModuleClone.querySelector('.content-module'),
		header = contentModuleClone.querySelector('.content-header'),
		ul = contentModuleClone.querySelector('ul');
		let folderFragment = document.createDocumentFragment();
		header.textContent = folderName;
		if(!visible) {
			contentModule.classList.add('hide-module', 'hide');
		}
		items.forEach((item) => {
			if("url" in item) {
				let liClone = document.importNode(this.contentModuleList.content, true),
				img = liClone.querySelector('img'),
				a = liClone.querySelector('a');
				a.appendChild(document.createTextNode(item.title));
				a.setAttribute('title', item.title)
				a.href = item.url;
				img.src = `chrome://favicon/${item.url}`;
				folderFragment.appendChild(liClone);
			} 
		})
		const count = folderFragment.childElementCount;
		if(count > 0) {
			let span = document.createElement('span');
			span.className = "bookmark-count"
			span.textContent = `${count} ${count === 1 ? 'bookmark' : 'bookmarks'}`;
			folderFragment.appendChild(span)
			ul.appendChild(folderFragment);
			this.fragment.appendChild(contentModuleClone);
		}
		items.forEach((item) => {
			if("children" in item) {
				this.generate(item.title, item.visible, item.children);
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
			breakAt: { 1200: 5, 990: 4, 780: 3, 620: 2, 430: 1 }
		}
		const data = this.settings.text
		conf.columns = this.checkValue(data.txtMacyColumns, conf.columns)
		conf.margin.x = this.checkValue(data.txtMacyMarginX, conf.margin.x)

		let macy = Macy(conf);
	}
	checkValue(a, b) {
		return (a !== "" ? a : b)
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
		const sla = document.getElementById('system-link-area');
		const mF = document.getElementById('overray');
		if(state) {
			sla.style.width = '2.6rem';
			// mF.classList.remove('filter');
		} else {
			sla.style.width = '14rem';
			// mF.classList.add('filter');
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
		const bookmarkSearch = document.getElementById('bookmark-search-group');
		const searchMenu = document.getElementById('search-menu');
		const search = document.getElementById('bookmark-search');
		if(state) {
			bookmarkSearch.style.left = '-34rem';
			searchMenu.classList.remove('active-menu');
			search.blur();
			this.searchReset()
		} else {
			// this.expandMenu(TO_CLOSE);
			// this.selectThemeMenu(TO_CLOSE);
			// this.vsbltyMenu(TO_CLOSE);
			bookmarkSearch.style.left = '2.6rem';
			searchMenu.classList.add('active-menu');
			search.focus();
		}
		this.state = !state
	}
	searchReset() {
		document.getElementById('bookmark-search').value = "";
		document.getElementById('bookmark-search-reset').classList.remove('search-reset-visible');
		document.getElementById('bookmark-search-result').innerHTML = '';
	}
	searchView() {
		const words = document.getElementById('bookmark-search').value;
		if(words == "") {
			document.getElementById('bookmark-search-reset').classList.remove('search-reset-visible');
		}
		else{
			document.getElementById('bookmark-search-reset').classList.add('search-reset-visible');
			chrome.bookmarks.search(words, async (results) => {
				let joinResult = '';
				for(const item of results) {
					if(item.url) {
						const parent = await getBookmarkItems(item.parentId);
						const title = item.title == "" ? item.url : item.title;
						joinResult += `<a class="bookmark-search-result-items" href="${item.url}" title="${title}"><img class="favicon" src="chrome://favicon/${item.url}">${title}<span>${parent[0].title}</span></a>`;
					}
				}
				document.getElementById('bookmark-search-result').innerHTML = `<div id="bookmark-result-count">${results.length} ${results.length === 1 ? 'bookmark' : 'bookmarks'}</div>${joinResult}`;
			});
		}
		document.getElementById('bookmark-search-result').innerHTML = '';
	}
}

class FloatMenu {
	onDisplay(obj, state) {
		obj.style.margin = state ? '-2.8rem 0 0 1rem' : '-2.8rem 0 0 3.8rem';
		obj.style.visibility = state ? 'hidden' : 'visible';
		obj.style.opacity = state ? 0 : 1;
	}
}

class SelectTheme extends FloatMenu {
	on(state = this.state) {
		const fmTheme = document.getElementById('float-menu-theme');
		const menu = document.getElementById('select-theme-menu')

		if (state) {
			super.onDisplay(fmTheme, TO_CLOSE);
			menu.classList.remove('active-menu');
			// $('#fmTheme').css({ margin: '-3rem 0 0 3rem', visibility: 'hidden', opacity: '0' });	 
		} else {
			// this.expandMenu(TO_CLOSE);
			// this.vsbltyMenu(TO_CLOSE);
			super.onDisplay(fmTheme, TO_OPEN);
			menu.classList.add('active-menu');
			// $('#fmTheme').css({ margin: '-3rem 0 0 4rem', visibility: 'visible', opacity: '1' });
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
		const fmVsblty = document.getElementById('float-menu-visibility')
		const menu = document.getElementById('module-visible-menu')
		if (state) {
			super.onDisplay(fmVsblty, TO_CLOSE);
			menu.classList.remove('active-menu');
		} else {
			// this.expandMenu(TO_CLOSE);
			// this.selectThemeMenu(TO_CLOSE);
			super.onDisplay(fmVsblty, TO_OPEN);
			menu.classList.add('active-menu');
		}
		this.state = !state
	}
	action() {
		const tgVsblty = document.getElementById('tgglVisible');
		tgVsblty.classList.toggle('toggle-on');
		const items = document.getElementsByClassName('hide-module');
		for (let i = items.length - 1 ; i >= 0; i--) {
			items[i].classList.toggle('hide');
		}
	}
}

class Reflector {
	tgglIcon(value) {
		const br = value ? '0%' : '50%';
		for(const item of document.getElementsByClassName('favicon')) {
			item.style.borderRadius = br;
		}
	}
	tgglOpenTab(value) {
		if(value) {
			document.head.insertAdjacentHTML('beforeend', '<base id="head-target" target="_blank">')
		} else {
			const el = document.getElementById("head-target")
			if(el !== null) {
				el.remove()
			}
		}
	}
	txtScale(value) {
		if(isFinite(value) && value !== '') {document.documentElement.style.zoom = value + '%'}
	}
	theme(value) {
		document.getElementById('head-theme').href = `css/theme/${value}.css`
		document.getElementById(value).checked = true
	}
	tgglWebSearch(value) {
		console.log(value)
		if(value) {
			document.getElementById('web-search-area').classList.remove('displayNone')
		}
	}
}

class ContentsManager extends DefaultSettings {
	init() {
		this.addContents()
		this.addEventListener()
	}
	async addContents() {
		const cg = new BookmarkContents(this.settings)
		await cg.append()
		this.reflect()
	}
	reloadContents() {
		const cg = new BookmarkContents(this.settings)
		cg.reload()
	}

	addEventListener() {
		wrapper('input[type=radio]', 'click', (event) => {
			this.settings.radio.theme = event.target.id
			this.setState(this.settings.radio)
			this.saveData()
			chrome.runtime.sendMessage({contents: 'theme'})
			chrome.runtime.sendMessage({option: 'reload'})
		})
		wrapper('html', 'keydown', (event) => {
			if (event.altKey && event.keyCode === 66 || event.keyCode === 27 && (document.activeElement === document.getElementById('search'))) {
				this.eventFunc.searchMenu()
				console.log('Alt + B')
			}
			 // [ B ] : 66
			 // [ Esc ] : 27
		})

		wrapper('#web-search-input', 'keyup', (event) => {
			if ((event.which && event.which == 13) || (event.keyCode && event.keyCode == 13)) {
				chrome.tabs.create({ url: "https://www.google.com/search?q=" + event.target.value});
				event.target.value = ''
			}
		})

		wrapper('#web-search-submit', 'click', (event) => {
				let val = document.getElementById('web-search-input').value
				chrome.tabs.create({ url: "https://www.google.com/search?q=" + val});
				val = ''
		})
	}

	reflect() {
		this.reflector = new Reflector()
		const data = this.settings
		for(const type in data){
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
			chrome.tabs.create({ url: event.target.dataset.href });
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

chrome.runtime.onMessage.addListener(async(request, sender, sendResponse) =>	{
	if(request.newtab === 'reload') {
		window.onbeforeunload = () => { window.scrollTo(0,0)}
		window.location.reload()
	} else if(request.contents === 'reload') {
		cm.reloadContents()
	} else if(request.contents === 'theme') {
		const data = await getStorage('settings')
		cm.setState(data.settings.radio)
	}
});