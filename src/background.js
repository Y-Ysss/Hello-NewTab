import { DefaultSettings } from './js/defaultSettings.js';
import { getBookmarksTree, getStorage, setStorage } from './js/browser.js';

class ContentsController extends DefaultSettings {
  constructor() {
    super();
  }
  init() {
    this.queueSaveBookmarks();
  }
  queueSaveBookmarks() {
    this.saveBookmarksDirty = true;
    if (this.saveBookmarksTimer !== null) {
      clearTimeout(this.saveBookmarksTimer);
    }
    this.saveBookmarksTimer = setTimeout(() => {
      this.saveBookmarksTimer = null;
      this.runSaveBookmarks();
    }, 100);
  }
  async runSaveBookmarks() {
    if (this.saveBookmarksRunning) {
      return;
    }
    this.saveBookmarksRunning = true;
    this.saveBookmarksDirty = false;
    try {
      await this.saveBookmarks();
    } finally {
      this.saveBookmarksRunning = false;
      if (this.saveBookmarksDirty) {
        this.queueSaveBookmarks();
      }
    }
  }
  async saveBookmarks() {
    const data = await getStorage('settings');
    this.hideFolderPattern = data.settings.text.txtRegexpPattern || null;
    this.disableFolderPattern = data.settings.text.txtDisableFolderPattern || null;
    const itemTree = await getBookmarksTree();
    itemTree.forEach((items) => {
      if ('children' in items) {
        items.children.forEach((bookmark) => {
          this.FormatBookmarks(bookmark);
        });
      }
    });
    await setStorage({ jsonBookmarks: itemTree[0].children });
  }
  FormatBookmarks(item) {
    const el = ['children', 'id', 'parentId', 'title', 'url'];
    this.OrganizeElementsKey(el, item);
  }

  OrganizeElementsKey(el, item) {
    for (let key in item) {
      if (el.indexOf(key) < 0) {
        delete item[key];
      }
      // if(item.title.match(new RegExp('^En'))){
      //     console.log(item.title)
      //     continue
      // }
      if (new RegExp(this.disableFolderPattern).test(item.title) && 'children' in item) {
        delete item['children'];
        continue;
      }
      if ('children' in item && item.children.length > 0) {
        item['visible'] = !new RegExp(this.hideFolderPattern).test(item.title);
        item.children.forEach((sub) => {
          this.OrganizeElementsKey(el, sub);
        });
      }
    }
  }
}
const con = new ContentsController();
chrome.bookmarks.onCreated.addListener(() => {
  con.queueSaveBookmarks();
});
chrome.bookmarks.onChanged.addListener(() => {
  con.queueSaveBookmarks();
});
chrome.bookmarks.onMoved.addListener(() => {
  con.queueSaveBookmarks();
});
chrome.bookmarks.onChildrenReordered.addListener(() => {
  con.queueSaveBookmarks();
});
chrome.bookmarks.onRemoved.addListener(() => {
  con.queueSaveBookmarks();
});
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  // chrome.tabs.create({url: 'option.html' }) // ------------------------Debug
});
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local' || !changes.settings) {
    return;
  }
  const oldText = changes.settings.oldValue?.text ?? {};
  const newText = changes.settings.newValue?.text ?? {};
  if (
    oldText.txtRegexpPattern !== newText.txtRegexpPattern ||
    oldText.txtDisableFolderPattern !== newText.txtDisableFolderPattern
  ) {
    con.queueSaveBookmarks();
  }
});
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log(alarm.name, ':', new Date());
  if (alarm.name === 'adjustment') {
    con.autoTheme();
    chrome.alarms.create('interval', { periodInMinutes: 1 });
  } else if (alarm.name === 'interval') {
    con.autoTheme();
  }
});
