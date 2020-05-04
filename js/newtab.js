class Reflector {
	tgglIcon(value) {
		const br = value ? '0%' : '50%';
		for(const item of document.getElementsByClassName('favicon')) {
			item.style.borderRadius = br;
		}
	}
	tgglOpenTab(value) {
		if(value){document.head.insertAdjacentHTML('beforeend', '<base target="_blank">')}
	}
	txtScale(value) {
		if(isFinite(value) && value !== '') {document.documentElement.style.zoom = value + '%'}
	}
	theme(value) {
		document.head.insertAdjacentHTML('beforeend', `<link id="ssTheme" rel="stylesheet" type="text/css" href="css/theme/${value}.css">`)
		document.getElementById(value).checked = true
	}
	tgglWebSearch(value) {
		document.getElementById('sArea').style.display = value ? 'block' : 'none';
		// value ? document.getElementById('sArea').classList.remove('displayNone') : document.getElementById('sArea').classList.add('displayNone');
	}
}

class ContentsManager extends DefaultSettings {
	constructor(classEventFunctions) {
		super()
		this.eventFunc = classEventFunctions
		this.contentModule = document.getElementById('content-module-template')
		this.contentModuleList = document.getElementById('liTemplate')
		this.fragment = document.createDocumentFragment()
		this.xx_module
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
			this.generate(data.jsonBookmarks[i].children);
		}
	}

	contentsAppend() {
		this.funcMacy();
		document.getElementById('body-main').appendChild(this.fragment);
		this.reflect()
	}

	generate(items) {
		items.forEach((item) => {
			if("children" in item) {
				let contentModuleClone = document.importNode(this.contentModule.content, true),
				contentModule = contentModuleClone.querySelector('.content-module'),
				header = contentModuleClone.querySelector('.content-header'),
				ul = contentModuleClone.querySelector('ul');
				this.xx_module = document.createDocumentFragment();
				if(!item.visible) {
					contentModule.classList.add('hide-module', 'hide');
				}
				header.textContent = item.title;
				this.generate(item.children);
				const count = this.xx_module.childElementCount;
				if(count > 0) {
					let span = document.createElement('span');
					span.className = "bkmrkNum"
					span.textContent = `${count} bookmarks`;
					this.xx_module.appendChild(span)
					ul.appendChild(this.xx_module);
					this.fragment.appendChild(contentModuleClone);
				}
			} else {
				let liClone = document.importNode(this.contentModuleList.content, true),
				img = liClone.querySelector('img'),
				a = liClone.querySelector('a');
				a.appendChild(document.createTextNode(item.title));
				a.setAttribute('title', item.title)
				a.href = item.url;
				img.src = `chrome://favicon/${item.url}`;
				this.xx_module.appendChild(liClone);
			}
		})
	}


	reflect() {
		const data = this.settings
		for(const type in data){
			if(typeof data[type] === "object") {
				this.setState(type, data[type])
			}
		}
	}
	setState(type, data) {
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
		})
		this.wrapper('.crate-system-tab', 'click', (event) => {
			chrome.tabs.create({ url: event.target.dataset.href });
  // ev.moreMenu(1);
  			document.getElementById('mFilter').classList.remove('filter');
		})
		// this.wrapper('#tgglVisible', 'click', (event) => {
		// 	console.log(event)
		// 	const element = event.target;
		// 	element.classList.toggle('form_tggl_on');
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

		this.wrapper('#s', 'keyup', (event) => {
			if ((event.which && event.which == 13) || (event.keyCode && event.keyCode == 13)) {
				chrome.tabs.create({ url: "https://www.google.com/search?q=" + event.target.value});
				event.target.value = ''
			}
		})

		this.wrapper('#sEnter', 'click', (event) => {
				let val = document.getElementById('s').value
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
  moreMenu(state = this.linkArea) {
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
      this.moreMenu(TO_CLOSE);
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
      chrome.bookmarks.search(words, (results) => {
        let joinResult = '';
        for(const item of results) {
          if(item.url) {
            const title = item.title == "" ? item.url : item.title;
            joinResult += `<a class="searchResultItems" href="${item.url}" title="${title}"><img class="favicon" src="chrome://favicon/${item.url}">${title}</a>`;
          }
        }
        document.getElementById('bookmark-search-result').innerHTML = `<div id="resultNum">${results.length} ${results.length === 1 ? 'bookmark' : 'bookmarks'}</div>${joinResult}`;
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
      this.moreMenu(TO_CLOSE);
      this.vsbltyMenu(TO_CLOSE);
      this.cssFloatMenu(fmTheme, TO_OPEN);
      // $('#fmTheme').css({ margin: '-3rem 0 0 4rem', visibility: 'visible', opacity: '1' });
    }
      this.themePopup = !state;
  }
  applyTheme() {
    location.reload();
  }
  vsbltyMenu(state = this.fmVsblty) {
  	const fmVsblty = document.getElementById('fmVsblty');
  	if (state) {
      this.cssFloatMenu(fmVsblty, TO_CLOSE);
    } else {
    	this.moreMenu(TO_CLOSE);
      this.selectThemeMenu(TO_CLOSE);
      this.cssFloatMenu(fmVsblty, TO_OPEN);
    }
      this.fmVsblty = !state;
  }
  tgglVisible(state) {
  		const tgVsblty = document.getElementById('tgglVisible');
		tgVsblty.classList.toggle('form_tggl_on');
		const items = document.getElementsByClassName('hide-module');
		for (let i = items.length - 1 ; i >= 0; i--) {
			items[i].classList.toggle('hide');
		}
  }
}
// const eventFunc = 
const cm = new ContentsManager(new EventFunctions())

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.newtab === 'reload') {
		// chrome.tabs.reload()
		window.onbeforeunload = () => { window.scrollTo(0,0)}
		window.location.reload()
	} else if(request.contents === 'reload') {
		cm.reloadContents()
	}
});
