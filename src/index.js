import { debounce } from 'debounce';

import { loadJS } from './utils'
import './index.css';

import Ui from './ui'
import EmbedIcon from './icon/embed.svg';
import EditIcon from './icon/edit.svg'
import GotoIcon from './icon/goto.svg'

const embedlyScript = 'https://cdn.embedly.com/widgets/platform.js'
const ramdaScript = 'https://cdn.jsdelivr.net/npm/ramda@0.25.0/dist/ramda.min.js'

/**
 * @typedef {Object} EmbedData
 * @description Embed Tool data
 * @property {string} service - service name
 * @property {string} url - source URL of embedded content
 * @property {string} embed - URL to source embed page
 * @property {number} [width] - embedded content width
 * @property {number} [height] - embedded content height
 * @property {string} [caption] - content caption
 *
 * @typedef {Object} EmbedConfig
 * @description Embed tool configuration object
 * @property {Object} [services] - additional services provided by user. Each property should contain Service object
 */

/**
 * @class Embed
 * @classdesc Embed Tool for Editor.js 2.0
 *
 * @property {Object} api - Editor.js API
 * @property {EmbedData} _data - private property with Embed data
 * @property {HTMLElement} element - embedded content container
 *
 * @property {Object} services - static property with available services
 * @property {Object} patterns - static property with patterns for paste handling configuration
 */
export default class Embed {
  /**
   * @param {{data: EmbedData, config: EmbedConfig, api: object}}
   *   data — previously saved data
   *   config - user config for Tool
   *   api - Editor.js API
   */
  constructor({ data, api }) {
    this.api = api;

    this._data = {
      type: data.type || 'embedly',
      provider: data.provider || '',
      value: data.value || '',
    };

    this.element = null;
    this.config = {}

    // this.data = data;
    this.addrInput = null

    this.addrDescWrapper = null
    this.showProvidersDetail = false
    this.addrProviderList = null
    this.addrProviderToggler = null

    loadJS(embedlyScript, this.embedlyOnload, document.body);
    loadJS(ramdaScript, null, document.body)

    /**
     * Module for working with UI
     */
    this.ui = new Ui({
      api,
      config: this.config,
      setData: this.setData,
      data: this._data
    });
  }
  
  /**
   * set saved data by type
   */
  setData(type = 'embedly', value) {
    // embedly or iframe
    console.log('setData called type: ', type)
    console.log('setData called value: ', value)

    this._data = {
      type,
      provider: encodeURI(value) || '',
      value: encodeURI(value) || '',
    };
  }

  /**
   * embedly service
   * should set api key in here
   * 
   */
  embedlyOnload() {
    embedly("defaults", {
      cards: {
        key: window.localStorage.getItem("embedlykey"),
      }
    });
  }

  /**
   * CSS classes
   * @constructor
   */
  get CSS() {
    return {
      wrapper: 'embed-tool-wrapper',
      customSettingWrapper: 'custom-setting-wrapper',
      cdxSettingsButton: 'cdx-settings-button'
    };
  }

  /**
   * Save current content and return EmbedData object
   *
   * @return {EmbedData}
   */
  save() {
    // return Object.assign(this.data, {});
    return this._data;
  }

  /**
   * Paste configuration to enable pasted URLs processing by Editor
   */
  static get pasteConfig() {
    return {
      patterns: Embed.patterns
    };
  }

  static get toolbox() {
    return {
      icon: EmbedIcon,
      title: '嵌入'
    };
  }

  /**
   * @param {EmbedData} data
   * @param {RegExp} [data.regex] - pattern of source URLs
   * @param {string} [data.embedUrl] - URL scheme to embedded page. Use '<%= remote_id %>' to define a place to insert resource id
   * @param {string} [data.html] - iframe which contains embedded content
   * @param {number} [data.height] - iframe height
   * @param {number} [data.width] - iframe width
   * @param {string} [data.caption] - caption
   */
  // TODO:  validate with the whitelist
  // set data2(data) {
  //   if (!(data instanceof Object)) {
  //     throw Error('Embed Tool data should be object');
  //   }

  //   this._data = {
  //     type: 'embedly',
  //     provider: this.addrInput ? this.addrInput.value : '',
  //     value: this.addrInput ? this.addrInput.value : '',
  //   };
  // }

  /**
   * @return {EmbedData}
   */
  get data() {
    // if (this.element) {
    //   const caption = this.element.querySelector(`.${this.api.styles.input}`);

    //   this._data.caption = caption ? caption.innerHTML : '';
    // }
    return this.ui.data;
  }

  /**
   * Render Embed tool content
   *
   * @return {HTMLElement}
   */
  render() {
    const wrapper = this._make('div', [this.CSS.wrapper])

    wrapper.appendChild(this.ui.renderAdderView())

    return wrapper
  }

  /**
   * editor or go to origin site when edit
   * @public
   *
   * @return {Element}
   */
  renderSettings() {
    console.log("renderSettings this.data: ", this.data.provider)

    if (R.isEmpty(this.data.provider)) return this._make('DIV', '')

    const Wrapper = this._make('DIV', [this.CSS.customSettingWrapper])
    const editIcon = this._make('DIV', [this.CSS.cdxSettingsButton], {
      title: '编辑',
    })
    editIcon.innerHTML = EditIcon

    editIcon.addEventListener("click", () => this.ui.changeToAdderView())

    const gotoIcon = this._make('a', [this.CSS.cdxSettingsButton], {
      title: '跳转到原站点',
      target: '_blank',
      href: this.data.provider,
    })
    gotoIcon.innerHTML = GotoIcon

    Wrapper.appendChild(editIcon)
    Wrapper.appendChild(gotoIcon)

    return Wrapper
  }

  /**
   * Helper method for elements creation
   * @param tagName
   * @param classNames
   * @param attributes
   * @return {HTMLElement}
   */
  _make(tagName, classNames = null, attributes = {}) {
    const el = document.createElement(tagName);

    if (Array.isArray(classNames)) {
      el.classList.add(...classNames);
    } else if (classNames) {
      el.classList.add(classNames);
    }

    for (const attrName in attributes) {
      el[attrName] = attributes[attrName];
    }

    return el;
  }
}
