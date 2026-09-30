import { DefaultSettings } from './defaultSettings.js';
import { PREVIEW_FRAME_SRCDOC } from './previewFrameSrcdoc.js';
import { OptionI18n } from './option-i18n.js';

const i18n = new OptionI18n();

class Reflector {
  static toggle(key, value) {
    document.getElementById(key).classList.toggle('toggle-on', Boolean(value));
  }
  static text(key, value) {
    document.getElementById(key).value = value;
  }
  static range(key, value) {
    for (const item of document.querySelectorAll(`.${key}`)) {
      item.value = value;
    }
    document.getElementById(`${key}Range`).value = value;
  }
  static radio(key, value) {
    const radio = document.getElementById(value);
    if (radio !== null) {
      radio.checked = true;
    }
  }
  static select(key, value) {
    for (const item of document.querySelectorAll(`select[name="${key}"]`)) {
      item.value = value;
    }
  }
}

class ReflectSettings extends DefaultSettings {
  constructor() {
    super();
    this.isReady = false;
  }
  init() {
    this.regenerate = false;
    this.addThemeOptions();
    this.reflect();
    this.initializeAppearancePreview();
    this.addElementsEventListener();
    this.isReady = true;
  }
  addThemeOptions() {
    const styles = this.themes.styles;
    const themes = this.themes.themes;
    const colors = this.themes.colors;
    const backgrounds = this.themes.backgrounds;
    document
      .getElementById('theme-styles')
      .appendChild(this.generateRadio(styles, 'tmStyle', 'style'));
    document
      .getElementById('theme-themes')
      .appendChild(this.generateRadio(themes, 'tmTheme', 'theme'));
    document
      .getElementById('theme-colors')
      .appendChild(this.generateRadio(colors, 'tmColor', 'color'));
    document
      .getElementById('bg-patterns')
      .appendChild(this.generateRadio(backgrounds, 'bgPattern', 'background'));
    document
      .getElementById('theme-primary-style')
      .appendChild(this.generateOption(styles, 'style'));
    document
      .getElementById('theme-primary-theme')
      .appendChild(this.generateOption(themes, 'theme'));
    document
      .getElementById('theme-primary-color')
      .appendChild(this.generateOption(colors, 'color'));
    document
      .getElementById('theme-secondary-style')
      .appendChild(this.generateOption(styles, 'style'));
    document
      .getElementById('theme-secondary-theme')
      .appendChild(this.generateOption(themes, 'theme'));
    document
      .getElementById('theme-secondary-color')
      .appendChild(this.generateOption(colors, 'color'));
  }
  generateRadio(items, name, category) {
    const fragment = document.createDocumentFragment();
    const inputBase = document.createElement('input');
    const labelBase = document.createElement('label');
    for (const item of items) {
      const inpt = inputBase.cloneNode();
      const labl = labelBase.cloneNode();
      inpt.type = 'radio';
      inpt.name = name;
      inpt.id = inpt.value = labl.htmlFor = item.id;
      labl.dataset.optionCategory = category;
      labl.dataset.optionId = item.id;
      labl.dataset.optionFallback = item.label;
      labl.textContent = i18n.optionLabel(category, item.id, item.label);
      fragment.appendChild(inpt);
      fragment.appendChild(labl);
    }
    return fragment;
  }
  generateOption(items, category) {
    const fragment = document.createDocumentFragment();
    const optionBase = document.createElement('option');
    for (const item of items) {
      const optn = optionBase.cloneNode();
      optn.value = item.id;
      optn.dataset.optionCategory = category;
      optn.dataset.optionId = item.id;
      optn.dataset.optionFallback = item.label;
      optn.textContent = i18n.optionLabel(category, item.id, item.label);
      fragment.appendChild(optn);
    }
    return fragment;
  }
  reflect() {
    const data = this.settings;
    for (const type in data) {
      if (typeof data[type] === 'object') {
        this.setState(type, data[type]);
      }
    }
    // Show/hide background image and color input based on initial pattern
    const pattern = this.settings.radio.bgPattern;
    document.getElementById('bgImageInputSection').style.display =
      pattern === 'Image' ? 'flex' : 'none';
    document.getElementById('bgColorInputSection').style.display =
      pattern === 'SingleColor' || pattern === 'Grid' || pattern === 'Dots' ? 'flex' : 'none';
    document.getElementById('bgPatternColorInputSection').style.display =
      pattern === 'Grid' || pattern === 'Dots' ? 'flex' : 'none';
    document.getElementById('bgGridLineWidthInputSection').style.display =
      pattern === 'Grid' ? 'flex' : 'none';
    document.getElementById('bgGridSpacingInputSection').style.display =
      pattern === 'Grid' ? 'flex' : 'none';
    document.getElementById('bgGridOpacityInputSection').style.display =
      pattern === 'Grid' ? 'flex' : 'none';
    document.getElementById('bgDotsLineWidthInputSection').style.display =
      pattern === 'Dots' ? 'flex' : 'none';
    document.getElementById('bgDotsSpacingInputSection').style.display =
      pattern === 'Dots' ? 'flex' : 'none';
    document.getElementById('bgDotsOpacityInputSection').style.display =
      pattern === 'Dots' ? 'flex' : 'none';
    document.getElementById('bgGradientColor1InputSection').style.display =
      pattern === 'Gradient' ? 'flex' : 'none';
    document.getElementById('bgGradientColor2InputSection').style.display =
      pattern === 'Gradient' ? 'flex' : 'none';
    this.updateAppearancePreview();
  }
  setState(type, data) {
    for (const key in data) {
      Reflector[type](key, data[key]);
    }
  }
  wrapper(key, action, func) {
    const all = document.querySelectorAll(key);
    for (const item of all) {
      item.addEventListener(action, (event) => {
        func(event);
      });
    }
  }

  toPixelValue(value, fallback) {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) {
      return `${n}px`;
    }
    return fallback;
  }

  toPercentageValue(value, fallback) {
    const n = Number(value);
    if (Number.isFinite(n)) {
      return `${Math.min(100, Math.max(0, n))}%`;
    }
    return fallback;
  }

  getCurrentBackgroundValue(id, fallback) {
    const input = document.getElementById(id);
    const v = input && input.value !== '' ? input.value : this.settings.text[id];
    return v === undefined || v === '' ? fallback : v;
  }

  initializeAppearancePreview() {
    this.preview = document.getElementById('appearance-preview');
    this.previewFrame = document.getElementById('appearance-preview-frame');
    if (!this.preview || !this.previewFrame) {
      return;
    }
    this.previewFrameLoaded = false;
    this.previewFrame.addEventListener('load', () => {
      this.previewFrameLoaded = true;
      this.updateAppearancePreview();
    });
    this.previewFrame.srcdoc = PREVIEW_FRAME_SRCDOC;
  }

  updateAppearancePreview() {
    if (!this.preview || !this.previewFrameLoaded || !this.previewFrame.contentDocument) {
      return;
    }

    const frameDocument = this.previewFrame.contentDocument;
    const frameRoot = frameDocument.documentElement;
    const frameBody = frameDocument.body;
    const style = this.settings.radio.tmStyle;
    const theme = this.settings.radio.tmTheme;
    const color = this.settings.radio.tmColor;
    const pattern = this.settings.radio.bgPattern;

    frameDocument.getElementById('head-design-style').href = `css/design/style/st${style}.css`;
    frameDocument.getElementById('head-design-theme').href = `css/design/theme/tm${theme}.css`;
    frameDocument.getElementById('head-design-color').href = `css/design/color/cl${color}.css`;

    frameRoot.style.setProperty(
      '--bg-image-url',
      this.getCurrentBackgroundValue('txtBgImage', '').trim() !== ''
        ? `url("${this.getCurrentBackgroundValue('txtBgImage', '')}")`
        : 'none',
    );
    frameRoot.style.setProperty(
      '--bg-base-color',
      this.getCurrentBackgroundValue('txtBgBaseColor', '#ffffff'),
    );
    frameRoot.style.setProperty(
      '--bg-pattern-color',
      this.getCurrentBackgroundValue('txtBgPatternColor', '#c8c8c8'),
    );
    frameRoot.style.setProperty(
      '--bg-gradient-color1',
      this.getCurrentBackgroundValue('txtBgGradientColor1', '#c8dcff'),
    );
    frameRoot.style.setProperty(
      '--bg-gradient-color2',
      this.getCurrentBackgroundValue('txtBgGradientColor2', '#dcc8ff'),
    );
    frameRoot.style.setProperty(
      '--bg-grid-line-width',
      this.toPixelValue(this.getCurrentBackgroundValue('txtBgGridLineWidth', '2'), '2px'),
    );
    frameRoot.style.setProperty(
      '--bg-grid-spacing-x',
      this.toPixelValue(this.getCurrentBackgroundValue('txtBgGridSpacingX', '60'), '60px'),
    );
    frameRoot.style.setProperty(
      '--bg-grid-spacing-y',
      this.toPixelValue(this.getCurrentBackgroundValue('txtBgGridSpacingY', '60'), '60px'),
    );
    frameRoot.style.setProperty(
      '--bg-grid-opacity',
      this.toPercentageValue(this.getCurrentBackgroundValue('txtBgGridOpacity', '50'), '50%'),
    );
    frameRoot.style.setProperty(
      '--bg-dots-size',
      this.toPixelValue(this.getCurrentBackgroundValue('txtBgDotsLineWidth', '1'), '1px'),
    );
    frameRoot.style.setProperty(
      '--bg-dots-spacing-x',
      this.toPixelValue(this.getCurrentBackgroundValue('txtBgDotsSpacingX', '20'), '20px'),
    );
    frameRoot.style.setProperty(
      '--bg-dots-spacing-y',
      this.toPixelValue(this.getCurrentBackgroundValue('txtBgDotsSpacingY', '20'), '20px'),
    );
    frameRoot.style.setProperty(
      '--bg-dots-opacity',
      this.toPercentageValue(this.getCurrentBackgroundValue('txtBgDotsOpacity', '50'), '50%'),
    );

    frameBody.classList.remove(
      'bg-styledefault',
      'bg-singlecolor',
      'bg-grid',
      'bg-dots',
      'bg-gradient',
      'bg-image',
    );
    frameBody.classList.add(`bg-${pattern.toLowerCase()}`);

    document.getElementById('previewStyleLabel').textContent =
      `${i18n.t('previewStyle')}: ${i18n.optionLabel('style', style)}`;
    document.getElementById('previewThemeLabel').textContent =
      `${i18n.t('previewTheme')}: ${i18n.optionLabel('theme', theme)}`;
    document.getElementById('previewColorLabel').textContent =
      `${i18n.t('previewColor')}: ${i18n.optionLabel('color', color)}`;
    document.getElementById('previewPatternLabel').textContent =
      `${i18n.t('previewPattern')}: ${i18n.optionLabel('background', pattern)}`;
  }

  async setupAlarms() {
    console.log(this.settings);
    const now = new Date();
    console.log(this.formatTime(now));
    let t = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1);
    console.log(this.formatTime(t));
    chrome.alarms.create('adjustment', { when: t.getTime() });
  }

  addElementsEventListener() {
    this.wrapper('#side-menu a', 'click', (event) => {
      window.scrollTo(
        0,
        document.getElementById(event.currentTarget.dataset.anchor).offsetTop - 16,
      );
      // console.log(event.currentTarget.dataset.anchor)
    });
    this.wrapper('#save-settings', 'click', async (_event) => {
      await this.saveData();

      if (this.settings.toggle.tgglAutoTheme) {
        await this.autoTheme();
        this.setupAlarms();
      } else {
        chrome.alarms.clear('adjustment', () => {
          console.log('Alarms.clear adjustment');
        });
        chrome.alarms.clear('interval', () => {
          console.log('Alarms.clear interval');
        });
      }
      const t = document.getElementById('toast');
      t.style.transform = 'translateY(-6rem)';
      setTimeout(
        (a) => {
          a.style.transform = 'translateY(6rem)';
        },
        2000,
        t,
      );
    });
    this.wrapper('.toggle', 'click', (event) => {
      event.currentTarget.classList.toggle('toggle-on');
      this.settings.toggle[event.currentTarget.id] =
        event.currentTarget.classList.contains('toggle-on');
    });
    this.wrapper('.text-input', 'blur', (event) => {
      this.settings.text[event.currentTarget.id] = event.currentTarget.value;
      this.updateAppearancePreview();
    });
    this.wrapper('.sw-disable', 'click', (event) => {
      const name = event.currentTarget.dataset.targetInput;
      document.getElementById('txt' + name).disabled = !event.currentTarget.checked;
      this.regenerate = true;
    });
    this.wrapper('.regenerate', 'keyup', (event) => {
      const saveBtn = document.getElementById('save-settings');
      const errorMsg = document.getElementById(event.currentTarget.id + 'Error');
      try {
        new RegExp(event.currentTarget.value);
        errorMsg.innerText = '';
        saveBtn.disabled = false;
      } catch {
        errorMsg.innerText = i18n.t('regexInvalid');
        saveBtn.disabled = true;
      }
      this.regenerate = true;
    });
    this.wrapper('input[type="radio"]', 'click', (event) => {
      this.settings.radio[event.currentTarget.name] = event.currentTarget.id;
      // Show/hide background image and color input fields based on pattern selection
      if (event.currentTarget.name === 'bgPattern') {
        const pattern = event.currentTarget.id;
        // Image field visibility
        document.getElementById('bgImageInputSection').style.display =
          pattern === 'Image' ? 'flex' : 'none';
        // Color field visibility based on pattern
        document.getElementById('bgColorInputSection').style.display =
          pattern === 'SingleColor' || pattern === 'Grid' || pattern === 'Dots' ? 'flex' : 'none';
        document.getElementById('bgPatternColorInputSection').style.display =
          pattern === 'Grid' || pattern === 'Dots' ? 'flex' : 'none';
        document.getElementById('bgGridLineWidthInputSection').style.display =
          pattern === 'Grid' ? 'flex' : 'none';
        document.getElementById('bgGridSpacingInputSection').style.display =
          pattern === 'Grid' ? 'flex' : 'none';
        document.getElementById('bgGridOpacityInputSection').style.display =
          pattern === 'Grid' ? 'flex' : 'none';
        document.getElementById('bgDotsLineWidthInputSection').style.display =
          pattern === 'Dots' ? 'flex' : 'none';
        document.getElementById('bgDotsSpacingInputSection').style.display =
          pattern === 'Dots' ? 'flex' : 'none';
        document.getElementById('bgDotsOpacityInputSection').style.display =
          pattern === 'Dots' ? 'flex' : 'none';
        document.getElementById('bgGradientColor1InputSection').style.display =
          pattern === 'Gradient' ? 'flex' : 'none';
        document.getElementById('bgGradientColor2InputSection').style.display =
          pattern === 'Gradient' ? 'flex' : 'none';
      }
      this.updateAppearancePreview();
    });
    this.wrapper('input[type="range"]', 'change', (event) => {
      this.settings.range[event.currentTarget.name] = event.currentTarget.value;
      for (const item of document.querySelectorAll(`.${event.currentTarget.name}`)) {
        item.value = event.currentTarget.value;
      }
    });
    this.wrapper('.text-synchronize-slider', 'change', (event) => {
      let val = event.currentTarget.value;
      if (!Number.isInteger(val)) {
        val = Math.round(val);
      }
      if (val < 0) {
        val = 0;
      } else if (val > 24) {
        val = 24;
      }

      const name = event.currentTarget.name;
      this.settings.range[name] = val;
      for (const item of document.querySelectorAll(`.${name}`)) {
        item.value = val;
      }
      for (const item of document.querySelectorAll(`#${name}Range`)) {
        item.value = val;
      }
    });
    this.wrapper('select:not(#option-language)', 'change', (event) => {
      this.settings.select[event.currentTarget.name] = event.currentTarget.value;
    });

    this.wrapper(
      '#txtBgImage, #txtBgBaseColor, #txtBgPatternColor, #txtBgGridLineWidth, #txtBgGridSpacingX, #txtBgGridSpacingY, #txtBgGridOpacity, #txtBgDotsLineWidth, #txtBgDotsSpacingX, #txtBgDotsSpacingY, #txtBgDotsOpacity, #txtBgGradientColor1, #txtBgGradientColor2',
      'input',
      () => {
        this.updateAppearancePreview();
      },
    );
  }
}

class ExtensionInfo {
  constructor() {
    document.addEventListener('option-language-changed', () => this.versionInfo());
    this.versionInfo();
  }
  createSection(titleText) {
    const section = document.createElement('div');
    section.className = 'content-section';
    const title = document.createElement('div');
    title.className = 'section-title';
    title.textContent = titleText;
    section.appendChild(title);
    return section;
  }
  appendRow(section, content) {
    const row = document.createElement('div');
    row.className = 'section-items-slim';
    const text = document.createElement('div');
    text.className = 'section-item-text';
    text.appendChild(content);
    row.appendChild(text);
    section.appendChild(row);
  }

  versionInfo() {
    const manifestData = chrome.runtime.getManifest();
    const container = document.getElementById('ExtensionInfo');
    container.replaceChildren();
    const versionSection = this.createSection(i18n.t('installedExtension'));
    const version = document.createElement('span');
    version.textContent = `${i18n.t('version')}: ${String(manifestData.version ?? '')}`;
    this.appendRow(versionSection, version);
    container.appendChild(versionSection);

    const releaseSection = this.createSection(i18n.t('whatsNew'));
    const whatsNew = document.createElement('div');
    const releaseNoteKeys = [
      'releaseNoteGlass',
      'releaseNotePreview',
      'releaseNoteSearch',
      'releaseNoteMigration',
      'releaseNoteAutoTheme',
      'releaseNoteFlash',
    ];
    releaseNoteKeys.forEach((key) => {
      const line = document.createElement('div');
      line.textContent = `• ${i18n.t(key)}`;
      whatsNew.appendChild(line);
    });
    this.appendRow(releaseSection, whatsNew);

    const releaseLinkText = document.createElement('span');
    releaseLinkText.appendChild(document.createTextNode(`${i18n.t('releaseList')} `));
    const releaseLink = document.createElement('a');
    releaseLink.className = 'url-text';
    releaseLink.href = 'https://github.com/Y-Ysss/Hello-NewTab/releases';
    releaseLink.target = '_blank';
    releaseLink.rel = 'noopener noreferrer';
    releaseLinkText.appendChild(releaseLink);
    this.appendRow(releaseSection, releaseLinkText);
    container.appendChild(releaseSection);
  }
}

const opt = new ReflectSettings();
const _info = new ExtensionInfo();

document.addEventListener('option-language-changed', () => opt.updateAppearancePreview());

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local' || !changes.settings || !opt.isReady) {
    return;
  }
  opt.settings = changes.settings.newValue;
  opt.reflect();
});
