
export const wrapper = (key, action, func) => {
    const all = document.querySelectorAll(key)
    for(const item of all) {
        item.addEventListener(action, (event) => { func(event) });
    }
};