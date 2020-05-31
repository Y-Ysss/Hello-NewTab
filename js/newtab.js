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
		// if(value){document.head.insertAdjacentHTML('beforeend', '<base target="_blank">')}
	}
	txtScale(value) {
		if(isFinite(value) && value !== '') {document.documentElement.style.zoom = value + '%'}
	}
	theme(value) {
		document.getElementById('head-theme').href = `css/theme/${value}.css`
		// document.head.insertAdjacentHTML('beforeend', `<link id="ssTheme" rel="stylesheet" type="text/css" href="css/theme/${value}.css">`)
		document.getElementById(value).checked = true
	}
	tgglWebSearch(value) {
		document.getElementById('web-search-area').style.display = value ? 'block' : 'none';
		// value ? document.getElementById('web-search-area').classList.remove('displayNone') : document.getElementById('web-search-area').classList.add('displayNone');
	}
}

class ContentsManager extends DefaultSettings {
	constructor(classEventFunctions) {
		super()
		this.eventFunc = classEventFunctions
		this.contentModule = document.getElementById('content-module-template')
		this.contentModuleList = document.getElementById('li-template')
		this.fragment = document.createDocumentFragment()
	}
	init() {
		this.addContents()
		// deSVG('.menu-icon', true);
	}
	async addContents() {
		await this.generateContents()
		this.contentsAppend()
		this.addElementsEventListener()
	}

	async reloadContents() {
		await this.generateContents()
		document.getElementById('body-main').textContent = null;
		this.contentsAppend()
	}

	async generateContents() {
		const data = await getStorage('jsonBookmarks');
		for(let i in data.jsonBookmarks) {
			let folderFragment  = document.createDocumentFragment()
			this.generate(data.jsonBookmarks[i].title, true, data.jsonBookmarks[i].children);
		}
	}

	contentsAppend() {
		this.funcMacy();
		document.getElementById('body-main').appendChild(this.fragment);
		this.reflect()
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


	reflect() {
		const data = this.settings
		for(const type in data){
			if(typeof data[type] === "object") {
				this.setState(data[type])
			}
		}
	}
	setState(data) {
		const reflector = new Reflector()
		for(const key in data) {
			const func = reflector[key]
			if(typeof func === 'function') {
				func(data[key])
			}
		}
	}

	wrapper(key, action, func) {
		const all = document.querySelectorAll(key)
		for(const item of all) {
			item.addEventListener(action, (event) => {func(event), this.saveData()})
		}
	}

	addElementsEventListener() {
		this.wrapper('.action-item', 'click', (event) => {
			this.eventFunc[event.target.id]()
		})
		this.wrapper('input[type=radio]', 'click', (event) => {
			this.settings.radio.theme = event.target.id
			this.setState(this.settings.radio)
			chrome.runtime.sendMessage({contents: 'theme'})
			chrome.runtime.sendMessage({option: 'reload'})
		})
		this.wrapper('.crate-system-tab', 'click', (event) => {
			chrome.tabs.create({ url: event.target.dataset.href });
  // ev.expandMenu(1);
  			document.getElementById('mFilter').classList.remove('filter');
		})
		// this.wrapper('#tgglVisible', 'click', (event) => {
		// 	console.log(event)
		// 	const element = event.target;
		// 	element.classList.toggle('toggle-on');
		// 	const items = document.getElementsByClassName('hide-module');
		// 	for (let i = items.length - 1 ; i >= 0; i--) {
		// 		items[i].classList.toggle('hide');
		// 	}
		// })
		this.wrapper('#search', 'keyup', (event) => {
			this.eventFunc.searchView()
		})
		this.wrapper('html', 'click', (event) => {

		})
		this.wrapper('html', 'keydown', (event) => {
			if (event.altKey && event.keyCode === 66 || event.keyCode === 27 && (document.activeElement === document.getElementById('search'))) {
				this.eventFunc.searchMenu()
				console.log('Alt + B')
			}
			 // [ B ] : 66
			 // [ Esc ] : 27
		})

		this.wrapper('#web-search-input', 'keyup', (event) => {
			if ((event.which && event.which == 13) || (event.keyCode && event.keyCode == 13)) {
				chrome.tabs.create({ url: "https://www.google.com/search?q=" + event.target.value});
				event.target.value = ''
			}
		})

		this.wrapper('#web-search-submit', 'click', (event) => {
				let val = document.getElementById('web-search-input').value
				chrome.tabs.create({ url: "https://www.google.com/search?q=" + val});
				val = ''
		})

	}

	checkValue(a, b) {
		return (a !== "" ? a : b)
	}

	funcMacy() {
		let conf = {
			container: '#body-main',
			trueOrder: false,
			waitForImages: true,
			columns: 8,
			margin: { x: 30, y: 15 },
			breakAt: { 1200: 5, 990: 4, 780: 3, 620: 2, 430: 1 }
		}
		const data = this.settings.text
		conf.columns =  this.checkValue(data.txtMacyColumns, conf.columns)
		conf.margin.x =  this.checkValue(data.txtMacyMarginX, conf.margin.x)

		let macy = Macy(conf);
	}
}
const NOW_OPEN = true
const NOW_CLOSE = false
const TO_OPEN = false
const TO_CLOSE = true
class EventFunctions {
  constructor() {
    this.linkArea = NOW_CLOSE
    this.searchArea = NOW_CLOSE
    this.filter = NOW_CLOSE
    this.themePopup = NOW_CLOSE
    this.fmVsblty = NOW_CLOSE
  }
  expandMenu(state = this.linkArea) {
  	this.filtering(state);
    const sla = document.getElementById('system-link-area');
    if(state) {
      sla.style.width = '2.6rem';
    } else {
      sla.style.width = '14rem';
      this.searchMenu(TO_CLOSE);
      this.selectThemeMenu(TO_CLOSE);
      this.vsbltyMenu(TO_CLOSE);
    }
    this.linkArea = !state
  }
  filtering(state = this.filter) {
    const mF = document.getElementById('mFilter');
    if (state) {
      mF.classList.remove('filter');
    } else {
      mF.classList.add('filter');
    }
    this.filter = !state
  }
  searchMenu(state = this.searchArea) {
    const bookmarkSearch = document.getElementById('bookmark-search-group');
    const searchMenu = document.getElementById('searchMenu');
    const search = document.getElementById('search');
    if(state) {
      bookmarkSearch.style.left = '-34rem';
      searchMenu.classList.remove('bg-searchMenu');
      search.blur();
      this.searchReset();
    } else {
      this.expandMenu(TO_CLOSE);
      this.selectThemeMenu(TO_CLOSE);
      this.vsbltyMenu(TO_CLOSE);
      bookmarkSearch.style.left = '2.6rem';
      searchMenu.classList.add('bg-searchMenu');
      search.focus();
    }
    this.searchArea = !state;
  }
  searchReset() {
    document.getElementById('search').value = "";
    document.getElementById('searchReset').classList.remove('searchResetView');
    document.getElementById('bookmark-search-result').innerHTML = '';
  }
  searchView() {
    const words = document.getElementById('search').value;
    if(words == "") {
      document.getElementById('searchReset').classList.remove('searchResetView');
    }
    else{
      document.getElementById('searchReset').classList.add('searchResetView');
      chrome.bookmarks.search(words, async (results) => {
        let joinResult = '';
        for(const item of results) {
          if(item.url) {
          	const parent = await getBookmarkItems(item.parentId);
            const title = item.title == "" ? item.url : item.title;
            joinResult += `<a class="search-result-items" href="${item.url}" title="${title}"><img class="favicon" src="chrome://favicon/${item.url}">${title}<span>${parent[0].title}</span></a>`;
          }
        }
        document.getElementById('bookmark-search-result').innerHTML = `<div id="bookmark-result-count">${results.length} ${results.length === 1 ? 'bookmark' : 'bookmarks'}</div>${joinResult}`;
      });
    }
    document.getElementById('bookmark-search-result').innerHTML = '';
  }
  cssFloatMenu(obj, state) {
    obj.style.margin = state ? '-2.8rem 0 0 1rem' : '-2.8rem 0 0 3.8rem';
    obj.style.visibility = state ? 'hidden' : 'visible';
    obj.style.opacity = state ? 0 : 1;
  }
  selectThemeMenu(state = this.themePopup) {
    const fmTheme = document.getElementById('fmTheme');

    if (state) {
      this.cssFloatMenu(fmTheme, TO_CLOSE);
      // $('#fmTheme').css({ margin: '-3rem 0 0 3rem', visibility: 'hidden', opacity: '0' });   
    } else {
      this.expandMenu(TO_CLOSE);
      this.vsbltyMenu(TO_CLOSE);
      this.cssFloatMenu(fmTheme, TO_OPEN);
      // $('#fmTheme').css({ margin: '-3rem 0 0 4rem', visibility: 'visible', opacity: '1' });
    }
      this.themePopup = !state;
  }
  vsbltyMenu(state = this.fmVsblty) {
  	const fmVsblty = document.getElementById('fmVsblty');
  	if (state) {
      this.cssFloatMenu(fmVsblty, TO_CLOSE);
    } else {
    	this.expandMenu(TO_CLOSE);
      this.selectThemeMenu(TO_CLOSE);
      this.cssFloatMenu(fmVsblty, TO_OPEN);
    }
      this.fmVsblty = !state;
  }
  tgglVisible(state) {
  		const tgVsblty = document.getElementById('tgglVisible');
		tgVsblty.classList.toggle('toggle-on');
		const items = document.getElementsByClassName('hide-module');
		for (let i = items.length - 1 ; i >= 0; i--) {
			items[i].classList.toggle('hide');
		}
  }
}

const cm = new ContentsManager(new EventFunctions())

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if(request.newtab === 'reload') {
		// chrome.tabs.reload()
		window.onbeforeunload = () => { window.scrollTo(0,0)}
		window.location.reload()
	} else if(request.contents === 'reload') {
		cm.reloadContents()
	} else if(request.contents === 'theme') {
		cm.setState(cm.settings.radio)
	}
});

// chrome.storage.onChanged.addListener((changes) => {
// 	console.log(changes)
// 	if(changes.hasOwnProperty('settings')) {
// 		// window.onbeforeunload = () => { window.scrollTo(0,0)}
// 		// window.location.reload()
// 		cm.reflect()
// 	} else if(changes.hasOwnProperty('jsonBookmarks')) {
// 		cm.reloadContents()
// 	}
// })