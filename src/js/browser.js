export const asyncFunc = callbackFunc => (...args) => new Promise((resolve, reject) => {
    callbackFunc(...args, result => {
        if(chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
        }
        resolve(result);
    });
});

export const getStorage = asyncFunc((keys, callback) => {
    chrome.storage.local.get(keys, callback);
});

export const setStorage = asyncFunc((keys, callback) => {
    chrome.storage.local.set(keys, callback);
});

export const getBookmarksTree = asyncFunc((callback) => {
    chrome.bookmarks.getTree(callback);
});

export const getBookmarkItems = asyncFunc((keys, callback) => {
    chrome.bookmarks.get(keys, callback);
});
