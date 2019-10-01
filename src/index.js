import { debounce } from 'debounce';
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

import SERVICES from './services';
import PROVIDERS from './providers';
import './index.css';

// import { loadJS } from './utils';

import EmbedIcon from './icon/embed.svg';

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
 * @typedef {Object} Service
 * @description Service configuration object
 * @property {RegExp} regex - pattern of source URLs
 * @property {string} embedUrl - URL scheme to embedded page. Use '<%= remote_id %>' to define a place to insert resource id
 * @property {string} html - iframe which contains embedded content
 * @property {number} [height] - iframe height
 * @property {number} [width] - iframe width
 * @property {Function} [id] - function to get resource id from RegExp groups
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

    this.data = data;
  }

  // initTooltip() {
  //   console.log("initTooltip: ", tippy)
  // }

  static get toolbox() {
    return {
      icon: EmbedIcon,
      title: 'Embed'
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
  set data(data) {
    if (!(data instanceof Object)) {
      throw Error('Embed Tool data should be object');
    }

    const {service, source, embed, width, height, caption = ''} = data;

    this._data = {
      service: service || this.data.service,
      source: source || this.data.source,
      embed: embed || this.data.embed,
      width: width || this.data.width,
      height: height || this.data.height,
      caption: caption || this.data.caption || '',
    };

    const oldView = this.element;

    if (oldView) {
      oldView.parentNode.replaceChild(this.render(), oldView);
    }
  }

  /**
   * @return {EmbedData}
   */
  get data() {
    if (this.element) {
      const caption = this.element.querySelector(`.${this.api.styles.input}`);

      this._data.caption = caption ? caption.innerHTML : '';
    }

    return this._data;
  }

  /**
   * Get plugin styles
   * @return {Object}
   */
  get CSS() {
    return {
      baseClass: this.api.styles.block,
      input: this.api.styles.input,
      container: 'embed-tool',
      containerLoading: 'embed-tool--loading',
      preloader: 'embed-tool__preloader',
      caption: 'embed-tool__caption',
      url: 'embed-tool__url',
      content: 'embed-tool__content',
      // add
      addrWrapper: 'embed-tool__addrwrapper',
      addrInputWrapper: 'embed-tool__addrwrapper-inputwrapper',
      addrInput: 'embed-tool__addrwrapper-inputwrapper-input',
      addrDescWrapper: 'embed-tool__addrwrapper-descwrapper',
      addrDesc: 'embed-tool__addrwrapper-descwrapper-desc',
      addrIconWrapper: 'embed-tool__addrwrapper-descwrapper-iconwrapper',
      addrIcon: 'embed-tool__addrwrapper-descwrapper-iconwrapper-icon',
      addrIconDivider: 'embed-tool__addrwrapper-descwrapper-iconwrapper-divider',

      providerCard: 'provider-wrapper',
      providerCardHeader: 'provider-wrapper-header',
      providerCardCover: 'provider-wrapper-header__cover',
      providerCardIntro: 'provider-wrapper-header__intro',
      providerCardIntroTitle: 'provider-wrapper-header__intro__title',
      providerCardIntroLink: 'provider-wrapper-header__intro__link',
      providerCardDesc: 'provider-wrapper__desc',
      providerCardFooter: 'provider-wrapper__footer',
      providerCardFooterBtn: 'provider-wrapper__footer_btn',
    };
  }

  /**
   * Render valid service icon list
   *
   * @return {HTMLElement}
   */
  makeServiceIconList() {
    const serviceKeys = Object.keys(PROVIDERS)
    const addrIconWrapper = this._make("div", this.CSS.addrIconWrapper);
  
    serviceKeys.forEach(key => {
      const Icon= this._make("img", this.CSS.addrIcon, {
        src: PROVIDERS[key].icon
      })

      tippy(Icon, this.makeProviderCard(PROVIDERS[key]))

      addrIconWrapper.appendChild(Icon)

      if(key === 'jsfiddle' || 
         key === 'shaoshupai' || 
         key === 'producthunt' || 
         key === 'youtube') {
        const Divider= this._make("div", this.CSS.addrIconDivider)
        Divider.innerText = '/'
        addrIconWrapper.appendChild(Divider)
      }
    })
  
    return addrIconWrapper
  }

  /**
   * return tippy config
   * @param {HTMLElement}
   * @return {object}
   */
  makeProviderCard(provider) {
    const Wrapper = this._make("div", this.CSS.providerCard)
    const Header = this._make("div", this.CSS.providerCardHeader)
    const Cover = this._make("img", this.CSS. providerCardCover, {
      src: provider.icon
    })
    const Intro = this._make("div", this.CSS.providerCardIntro)
    const Title = this._make("div", this.CSS.providerCardIntroTitle)
    const Link = this._make("a", this.CSS.providerCardIntroLink)

    const Desc = this._make("div", this.CSS.providerCardDesc)
    const Footer = this._make("div", this.CSS.providerCardFooter)
    const InsertBtn = this._make("div", this.CSS.providerCardFooterBtn)

    Title.innerText = provider.title
    Link.innerText = provider.link

    Desc.innerText = provider.desc
    InsertBtn.innerText = "插入示例"
    
    Intro.appendChild(Title)
    Intro.appendChild(Link)

    Header.appendChild(Cover)
    Header.appendChild(Intro)

    Footer.appendChild(InsertBtn)

    Wrapper.appendChild(Header)
    Wrapper.appendChild(Desc)
    Wrapper.appendChild(Footer)

    // Wrapper.innerText = provider.title

    const content = Wrapper

    return {
      content,
      theme: 'light',
      delay: 200,
      // trigger: "hover",
      placement: 'bottom',
      // allowing you to hover over and click inside them.
      interactive: true,
    }
  }

  /**
   * Render Embed tool content
   *
   * @return {HTMLElement}
   */
  render() {
    const container = this._make('div', this.CSS.addrWrapper);
    const addrInputWrapper = this._make('div', this.CSS.addrInputWrapper);
    const addrInput = this._make('input', this.CSS.addrInput);

    const addrDescWrapper = this._make('div', this.CSS.addrDescWrapper);
    const addrDesc = this._make('div', this.CSS.addrDesc);

    const addrIconList = this.makeServiceIconList()

    addrInput.placeholder = "请输入网页地址"
    addrInputWrapper.appendChild(addrInput);

    addrDesc.innerHTML = "仅支持嵌入以下站点的内容或服务: "
    addrDescWrapper.appendChild(addrDesc);

    addrDescWrapper.appendChild(addrIconList );

    container.appendChild(addrInputWrapper);
    container.appendChild(addrDescWrapper);
    // const container = document.createElement('div');

    this.element = container;

    console.log("container 1: ", container);
    return container;

    // const embedIsReady = this.embedIsReady(container);

    // embedIsReady
    //   .then(() => {
    //     container.classList.remove(this.CSS.containerLoading);
    //   });

    return container;
  }

  /**
   * Creates preloader to append to container while data is loading
   * @return {HTMLElement} preloader
   */
  createPreloader() {
    const preloader = document.createElement('preloader');
    const url = document.createElement('div');

    url.textContent = this.data.source;

    preloader.classList.add(this.CSS.preloader);
    url.classList.add(this.CSS.url);

    preloader.appendChild(url);

    return preloader;
  }

  /**
   * Save current content and return EmbedData object
   *
   * @return {EmbedData}
   */
  save() {
    return this.data;
  }

  /**
   * Handle pasted url and return Service object
   *
   * @param {PasteEvent} event- event with pasted data
   * @return {Service}
   */
  onPaste(event) {
    const {key: service, data: url} = event.detail;

    const {regex, embedUrl, width, height, id = (ids) => ids.shift()} = Embed.services[service];
    const result = regex.exec(url).slice(1);
    const embed = embedUrl.replace(/<\%\= remote\_id \%\>/g, id(result));

    this.data = {
      service,
      source: url,
      embed,
      width,
      height
    };
  }

  /**
   * Analyze provided config and make object with services to use
   *
   * @param {EmbedConfig} config
   */
  static prepare({config = {}}) {
    let {services = {}} = config;

    let entries = Object.entries(SERVICES);

    const enabledServices = Object
      .entries(services)
      .filter(([key, value]) => {
        return typeof value === 'boolean' && value === true;
      })
      .map(([ key ]) => key);

    const userServices = Object
      .entries(services)
      .filter(([key, value]) => {
        return typeof value === 'object';
      })
      .filter(([key, service]) => Embed.checkServiceConfig(service))
      .map(([key, service]) => {
        const {regex, embedUrl, html, height, width, id} = service;

        return [key, {
          regex,
          embedUrl,
          html,
          height,
          width,
          id
        } ];
      });

    if (enabledServices.length) {
      entries = entries.filter(([ key ]) => enabledServices.includes(key));
    }

    entries = entries.concat(userServices);

    Embed.services = entries.reduce((result, [key, service]) => {
      if (!(key in result)) {
        result[key] = service;
        return result;
      }

      result[key] = Object.assign({}, result[key], service);
      return result;
    }, {});

    Embed.patterns = entries
      .reduce((result, [key, item]) => {
        result[key] = item.regex;

        return result;
      }, {});
  }

  /**
   * Check if Service config is valid
   *
   * @param {Service} config
   * @return {boolean}
   */
  static checkServiceConfig(config) {
    const {regex, embedUrl, html, height, width, id} = config;

    let isValid = regex && regex instanceof RegExp
      && embedUrl && typeof embedUrl === 'string'
      && html && typeof html === 'string';

    isValid = isValid && (id !== undefined ? id instanceof Function : true);
    isValid = isValid && (height !== undefined ? Number.isFinite(height) : true);
    isValid = isValid && (width !== undefined ? Number.isFinite(width) : true);

    return isValid;
  }

  /**
   * Paste configuration to enable pasted URLs processing by Editor
   */
  static get pasteConfig() {
    return {
      patterns: Embed.patterns
    };
  }

  /**
   * Checks that mutations in DOM have finished after appending iframe content
   * @param {HTMLElement} targetNode - HTML-element mutations of which to listen
   * @return {Promise<any>} - result that all mutations have finished
   */
  embedIsReady(targetNode) {
    const PRELOADER_DELAY = 450;

    let observer = null;

    return new Promise((resolve, reject) => {
      observer = new MutationObserver(debounce(resolve, PRELOADER_DELAY));
      observer.observe(targetNode, {childList: true, subtree: true});
    }).then(() => {
      observer.disconnect();
    });
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
