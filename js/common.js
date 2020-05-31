const asyncFunc = callbackFunc => (...args) => new Promise((resolve, reject) => {
  callbackFunc(...args, result => {
    if (chrome.runtime.lastError) {
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

class DefaultSettings {
  constructor() {
    this.settings = {
      "toggle": {"tgglIcon": false, "tgglOpenTab": true, "tgglWebSearch":false},
      "radio": {"theme": "tmFlatLight"},
      "text": { "txtScale": "", "txtRegexpPattern":"", "txtMacyColumns":"", "txtMacyMarginX":"", "txtMacyBreak":""},
      "range":{ "sliderLower": "", "sliderUpper": ""},
      "select": {"autoThemePrimary": "tmFlatLight", "autoThemeSecondary": "tmFlatDark"},
      "format_version": "0.1"
    }
    this.loadData()
  }
  async loadData() {
    const data = await getStorage(null)
    data.settings !== undefined ? this.settings = data.settings : this.saveData()
    this.init()
  }
  saveData() {
    setStorage({'settings': this.settings})
  }
  init(){}
}