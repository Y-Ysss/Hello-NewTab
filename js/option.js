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
		this.reflect()
		this.addElementsEventListener()
		rippleEffect()
	}
	reflect() {
		const data = this.settings
		console.log(data)
		for(const type in data){
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
	// toast() {
	// }
	wrapper(key, action, func) {
		const all = document.querySelectorAll(key)
		for(const item of all) {
			item.addEventListener(action, (event) => {func(event)})
		}
	}
	addElementsEventListener() {
		this.wrapper('#save-settings', 'click', (event) => {
			console.log(this.settings)
			this.saveData()
			chrome.runtime.sendMessage({newtab: 'reload'})
			chrome.runtime.sendMessage({option: 'reload'})

			let t = document.getElementById('toast')
			t.style.transform  = 'translateY(-6rem)'
			setTimeout((a) => {a.style.transform  = 'translateY(6rem)'}, 2000, t)
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
			const value = event.target.value;
			for(const item of document.querySelectorAll(`.${event.target.name}`)) {
				item.value = value
			}
			for(const item of document.querySelectorAll(`#${event.target.name}Range`)) {
				item.value = event.target.value
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
		// let str = `<div class="cardContents"><b>Installed Version</b><br>${manifestData.version}</div>`
		let str = `<div class="content-section"><div class="section-title">Installed Extension</div><div class="section-items-slim"><div class="section-item-text">バージョン : ${manifestData.version}</div></div></div>`
		document.getElementById('ExtensionInfo').insertAdjacentHTML('beforeend', str);
	}

	gitReleaseInfo(data) {
		const manifestData = chrome.runtime.getManifest();
		if(manifestData.version !== data.name) {
			str += `<div class="content-section"><div class="section-title">Latest Release</div><div class="section-items-slim"><div class="section-item-text">バージョン : ${data.name}</div></div><div class="section-items-slim"><div class="section-item-text">What's New : <br>${data.body}</div></div><div class="section-items-slim"><div class="section-item-text">URL : <a href="${data.html_url}"></a></div></div></div>`
			// str += `<h2>#Latest Release</h2><div class="cardContents"><b>Version</b><br>${data.name}</div><div class="cardContents"><b>What\'s New</b><br>${data.body}</div><div class="cardContents"><b>URL</b><br><a href="${data.html_url}"></a></div>`
			str = str.replace(/\r?\n/g, '<br>')
		}
		document.getElementById('ExtensionInfo').insertAdjacentHTML('beforeend', str);
	}

	gitCommitsInfo(data) {
		let str = ''
		for(let i = 0; i < 5; i++) {
			str += `<div class="content-section"><div class="section-title">${data[i].commit.message}</div><div class="section-items-continuation"><div class="section-item-text">${(data[i].commit.author.date).replace('T', ', ').slice(0, -1)} (UTC)</div></div><div class="section-items"><div class="section-item-text"><a href="${data[i].html_url}"></a></div></div></div>`;
		}
		document.getElementById('gitCommitsInfo').insertAdjacentHTML('beforeend', str);
	}
}

const opt = new ReflectSettings()
const info = new ExtensionInfo()

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.option === 'reload') {
		window.location.reload()
	}
});