import { debounce } from 'debounce';

import { loadJS } from './utils'
import './index.css';

import Ui from './ui'
import EmbedIcon from './icon/embed.svg';

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
  constructor({data, api}) {
    this.api = api;
    this._data = {};
    this.element = null;
    this.config = {}

    // this.data = data;
    this.addrInput = null

    this.addrDescWrapper = null
    this.showProvidersDetail = false
    this.addrProviderList = null
    this.addrProviderToggler = null

    loadJS(embedlyScript, null, document.body);
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
   * CSS classes
   * @constructor
   */
  get CSS() {
    return {
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
    return this.ui.data;
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

    return this._data;
  }
 
  /**
   * Render Embed tool content
   *
   * @return {HTMLElement}
   */
  render() {
    return this.ui.renderAdderView()
  }

  /**
   * editor or go to origin site when edit
   * @public
   *
   * @return {Element}
   */
  renderSettings() {
    console.log('renderSettings: ', this.data)
    console.log('renderSettings _data: ', this._data)
    
    if(R.isEmpty(this.data.provider)) return this._make('DIV', '')

    const Wrapper = this._make('DIV', [this.CSS.customSettingWrapper])

    const editIcon = this._make('DIV', [this.CSS.cdxSettingsButton], {
      title: '编辑',
    })
    editIcon.innerHTML = '<svg width="20" height="20" t="1571574221393" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3197" width="200" height="200"><path d="M690.086957 178.086957 333.913043 534.26087 489.73913 690.086957 845.913043 333.913043 690.086957 178.086957" p-id="3198"></path><path d="M734.608696 133.565217 890.434783 289.391304 948.001391 231.824696C965.38713 214.438957 965.38713 186.256696 948.001391 168.870957L855.129043 75.998609C837.743304 58.61287 809.561043 58.61287 792.175304 75.998609L734.608696 133.565217" p-id="3199"></path><path d="M289.391304 578.782609 244.869565 779.130435 445.217391 734.608696 289.391304 578.782609" p-id="3200"></path><path d="M823.652174 512 823.652174 868.173913 155.826087 868.173913 155.826087 200.347826 512 200.347826 601.043478 111.304348 111.304348 111.304348C89.043478 111.304348 68.518957 133.565217 68.518957 155.826087L66.782609 155.826087 66.782609 908.354783C66.782609 935.201391 92.115478 957.217391 119.05113 957.217391L863.899826 957.217391C890.835478 957.217391 912.695652 935.468522 912.695652 908.354783L912.695652 422.956522 823.652174 512" p-id="3201"></path></svg>'

    editIcon.addEventListener("click", () => this.ui.changeToAdderViewer())

    const gotoIcon = this._make('a', [this.CSS.cdxSettingsButton], {
      title: '跳转到原站点',
      target: '_blank',
      href: this.data.provider,
    })
    gotoIcon.innerHTML = '<svg width="22" height="22" t="1571575411513" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="31370" width="200" height="200"><path d="M925.6 337.9c-22.6-53.3-54.8-101.2-96-142.3-41.1-41.1-89-73.4-142.3-96C632.1 76.2 573.5 64.4 513 64.4S393.9 76.2 338.7 99.6c-53.3 22.6-101.2 54.8-142.3 96-41.1 41.1-73.4 89-96 142.3C77 393.1 65.2 451.8 65.2 512.2c0 60.4 11.8 119.1 35.2 174.3 22.6 53.3 54.8 101.2 96 142.3 41.1 41.1 89 73.4 142.3 96C393.9 948.2 452.6 960 513 960s119.1-11.8 174.3-35.2c53.3-22.6 101.2-54.8 142.3-96 41.1-41.1 73.4-89 96-142.3 23.4-55.2 35.2-113.9 35.2-174.3 0-60.4-11.8-119.1-35.2-174.3zM513 879.1c-202.3 0-366.9-164.6-366.9-366.9S310.7 145.3 513 145.3c202.3 0 366.9 164.6 366.9 366.9S715.4 879.1 513 879.1z" p-id="31371"></path><path d="M736.4 508.9c0-0.3-0.1-0.6-0.1-0.8 0-0.4-0.1-0.8-0.2-1.2 0-0.3-0.1-0.5-0.1-0.8-0.1-0.4-0.1-0.8-0.2-1.2-0.1-0.3-0.1-0.6-0.2-0.8-0.1-0.4-0.2-0.8-0.3-1.1s-0.1-0.6-0.2-0.9c-0.1-0.3-0.2-0.7-0.3-1s-0.2-0.7-0.3-1-0.2-0.6-0.3-0.8c-0.1-0.4-0.3-0.8-0.4-1.2-0.1-0.2-0.2-0.4-0.2-0.6l-0.6-1.5c0-0.1-0.1-0.2-0.1-0.3-2.4-5.3-5.9-10.3-10.6-14.4L582.9 358c-17.6-16-44.8-14.3-60.3 3.3-15.6 17.6-13.9 44.7 3.7 60.3l55.7 49.2H370.3c-1.3 0-2.7 0.1-4 0.2-1.4-0.1-2.9-0.2-4.4-0.2h-30.3c-23.2 0-42.2 19-42.2 42.2 0 23.2 19 42.2 42.2 42.2H362c1.6 0 3.1-0.1 4.7-0.3 1.2 0.1 2.4 0.2 3.7 0.2H582l-55.6 49.2c-17.6 15.6-19.3 42.7-3.7 60.3 15.6 17.6 42.7 19.3 60.3 3.7L722.4 545c4.7-4.1 8.2-9 10.6-14.4 0-0.1 0.1-0.2 0.1-0.3l0.6-1.5c0.1-0.2 0.2-0.4 0.2-0.6 0.2-0.4 0.3-0.8 0.4-1.2 0.1-0.3 0.2-0.6 0.3-0.8 0.1-0.3 0.2-0.7 0.3-1s0.2-0.7 0.3-1 0.2-0.6 0.2-0.9c0.1-0.4 0.2-0.8 0.3-1.1 0.1-0.3 0.1-0.6 0.2-0.8 0.1-0.4 0.2-0.8 0.2-1.2 0-0.3 0.1-0.5 0.1-0.8 0.1-0.4 0.1-0.8 0.2-1.2 0-0.3 0.1-0.6 0.1-0.8 0-0.4 0.1-0.8 0.1-1.2 0-0.3 0-0.6 0.1-0.9v-1.1-1-1-1.1c0-0.3 0-0.6-0.1-0.9-0.1-0.5-0.2-0.9-0.2-1.3z" p-id="31372"></path></svg>'

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
