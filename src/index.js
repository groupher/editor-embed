import { debounce } from 'debounce';
import tippy, { hideAll } from 'tippy.js'
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

import SERVICES from './services';
import PROVIDERS from './providers';
import { parseDomain, loadJS, getQueryFromUrl } from './utils'
import { customIframeFragment, CUSTOM_PROVIDERS  } from './custom_embeds'

import './index.css';

import EmbedIcon from './icon/embed.svg';

const tooltipHideAll = hideAll

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
    this.addrInput = null

    this.addrDescWrapper = null
    this.showProvidersDetail = false
    this.addrProviderList = null
    this.addrProviderToggler = null

    loadJS(embedlyScript, this.initEmbedly.bind(this), document.body);
    loadJS(ramdaScript, null, document.body)
  }

  initEmbedly() {
    // console.log("embedly: ", embedly)
    // <a href="http://embed.ly" class="embedly-card">Embedly</a>
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
      addrInputBtn: 'embed-tool__addrwrapper-inputwrapper-btn',
      addrDescWrapper: 'embed-tool__addrwrapper-descwrapper',
      addrDescHeader: 'embed-tool__addrwrapper-descwrapper-header',
      addrDesc: 'embed-tool__addrwrapper-descwrapper-desc',
      addrProviderToggler: 'embed-tool__addrwrapper-descwrapper-toggler',
      addrIconWrapper: 'embed-tool__addrwrapper-descwrapper-iconwrapper',
      addrDetailIconWrapper: 'embed-tool__addrwrapper-descwrapper-detail-iconwrapper',
      addrIcon: 'embed-tool__addrwrapper-descwrapper-iconwrapper-icon',
      addrDetailIcon: 'embed-tool__addrwrapper-descwrapper-detail-iconwrapper-icon',
      addrIconDivider: 'embed-tool__addrwrapper-descwrapper-iconwrapper-divider',
      addrDetailWrapper: 'embed-tool__addrwrapper-descwrapper-detail-wrapper',
      addrTypeTitle: 'embed-tool__addrwrapper-descwrapper-type-title',
      addrFooterLink: 'embed-tool__addrwrapper-descwrapper-footer-link',

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


  setTopBorder(type = 'default') {
    this.element.classList.remove('embed-top-success')
    this.element.classList.remove('embed-top-error')
    this.element.classList.remove('embed-top-default')

    switch(type) {
      case 'success': {
        return this.element.classList.add('embed-top-success')
      }
      case 'error': {
        return this.element.classList.add('embed-top-error')
      }

      default: {
        return this.element.classList.add('embed-top-default')
      }
    }
  }

  /**
   * Render valid service icon list
   *
   * @return {HTMLElement}
   */
  makeProviderIconList() {
    const addrIconWrapper = this._make("div", this.CSS.addrIconWrapper);
    const providers = R.filter(provider => provider.showInBrief, PROVIDERS)

    providers.forEach(provider => {
      const Icon= this._make("img", [this.CSS.addrIcon, 'icon-' + provider.domain], {
        src: provider.icon,
      })

      tippy(Icon, this.makeProviderCard(provider))

      addrIconWrapper.appendChild(Icon)

      if(provider.domain === 'jsfiddle' ||
         provider.domain === 'shaoshupai' ||
         provider.domain === 'producthunt' ||
         provider.domain === 'youtube') {
        const Divider= this._make("div", this.CSS.addrIconDivider)
        Divider.innerText = '/'
        addrIconWrapper.appendChild(Divider)
      }
    })

    return addrIconWrapper
  }

  makeProviderIconListDetails() {
    const typeList = R.keys(R.groupBy((provide) => provide.type, PROVIDERS))

    const ListWrapper = this._make("div", this.CSS.addrDetailWrapper);

    const FooterLink = this._make("a", this.CSS.addrFooterLink, {
      href: "https://github.com/",
      target: "_blank"
    });
    FooterLink.innerHTML = "侵权&nbsp;|&nbsp;建议&nbsp;|&nbsp;纠错"

    typeList.forEach(type => {
      const Title = this._make("div", this.CSS.addrTypeTitle, {})
      Title.innerText = type + ":"
      const curProviders = R.filter(R.propEq('type', type))(PROVIDERS)

      const AddrIconWrapper = this._make("div", this.CSS.addrDetailIconWrapper);
      curProviders.forEach(provider => {
        const Icon= this._make("img", [this.CSS.addrDetailIcon, 'icon-' + provider.domain], {
          src: provider.icon,
        })

        tippy(Icon, this.makeProviderCard(provider))

        AddrIconWrapper.appendChild(Icon)
      })

      ListWrapper.appendChild(Title)
      ListWrapper.appendChild(AddrIconWrapper)
    })

    ListWrapper.appendChild(FooterLink)
    return ListWrapper
  }

  /**
   * return tippy config
   * @param {HTMLElement}
   * @return {object}
   */
  makeProviderCard(provider) {
    const Wrapper = this._make("div", this.CSS.providerCard)
    const Header = this._make("div", this.CSS.providerCardHeader)
    const Cover = this._make("img", this.CSS.providerCardCover, {
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

    InsertBtn.addEventListener('click', () => {
      if(this.isEmbeding()) return false

      this.addrInput.value = provider.demoEmbedLink
      this.addrInputHandler()
      this.addrInput.focus()
      tooltipHideAll()
    })

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
      // trigger: "click",
      placement: 'bottom',
      // allowing you to hover over and click inside them.
      interactive: true,
    }
  }

  /**
   * show confirm btn when input addr is supported
   *
   */
  showConfirmBtn() {
    this.addrInput.style.width = 'calc(100% - 80px)'
    setTimeout(() => {
      this.addrInputBtn.style.display = "inline-block"
    }, 500)
  }

  /**
   * hide confirm btn when input addr is unsupported
   *
   */
  hideConfirmBtn() {
    this.addrInputBtn.style.display = "none"
    setTimeout(() => {
      this.addrInput.style.width = '100%'
    }, 500)
  }

  /**
   * handle addr input change
   *
   * highlight icon which the icon
   */
  addrInputHandler() {
    const { value } = this.addrInput
    // Object.keys(PROVIDERS)
    const providerKeys = R.pluck('domain', PROVIDERS)
    const domain = parseDomain(value)

    if(value.trim() === "") {
      this.hideConfirmBtn()
      for(let i = 0; i < providerKeys.length; i++ ) {
        const curKey = providerKeys[i]
        const curIcon = document.querySelector('.icon-' + curKey)
        curIcon.style.opacity = 1
        curIcon.style.filter = "grayscale(0)"
      }
      return false
    }

    // if is unsupported domain, just hide the confirmbtn
    if(providerKeys.indexOf(domain) > -1) {
      this.showConfirmBtn()
    } else {
      this.hideConfirmBtn()
    }

    // highlight the current domain for current provider
    for(let i = 0; i < providerKeys.length; i++ ) {
      const curKey = providerKeys[i]
      const curIcon = document.querySelector('.icon-' + curKey)

      if (domain === curKey) {
        curIcon.style.opacity = 1
        curIcon.style.filter = "grayscale(0)"
      } else {
        curIcon.style.opacity = 0.5
        curIcon.style.filter = "grayscale(1)"
      }
    }
  }

  /**
   * handle link embed after user confirm url in current input
   *
   */
  addrInputConfirmHandler() {
    const { value } = this.addrInput
    const domain = parseDomain(value)

    const container = document.querySelector('.' + this.CSS.container)
    const embedHTML = this._make('div', '')

    if(R.contains(domain, CUSTOM_PROVIDERS)) {
      const { html } = customIframeFragment(value)
      embedHTML.innerHTML =  html

      container.innerHTML = null;
      container.appendChild(embedHTML);

      this.setTopBorder('success')
      return false
    }

    return this.embedDefaultContent(value)
  }

  /**
   * embed default content using embed.ly service
   *
   */
  embedDefaultContent(url) {
    const embedHTML = this._make('a', 'embedly-card', {
      href: url,
      "data-card-controls": 0
    })

    // embedHTML.dataset["card-controls"] = 0
    embedHTML.setAttribute("data-card-controls", "0")
    this.element.appendChild(embedHTML);

    this.adder.style.display = 'none'
    this.containerLoading.style.display = "block"
    embedly('on', 'card.rendered', (iframe) => {
      // iframe is the card iframe that we used to render the event.
      console.log('loading done')
      this.containerLoading.style.display = "none"
      this.adder.style.display = 'none'

      this.setTopBorder('success')
    });
    // <a href="http://embed.ly" class="embedly-card">Embedly</a>
  }

  isEmbeding() {
    return this.containerLoading.style.display === "block" ? true : false
  }

  /**
   * toggle providers view type
   *
   */
  handleProviderToggle() {
    if(this.showProvidersDetail) {
      this.addrProviderToggler.innerText = "展开全部"
      this.addrProviderList.innerHTML = null
      this.addrProviderList.appendChild(this.makeProviderIconList())
    } else {
      this.addrProviderToggler.innerText = "收起列表"
      this.addrProviderList.innerHTML = null
      this.addrProviderList.appendChild(this.makeProviderIconListDetails())
    }

    this.showProvidersDetail = !this.showProvidersDetail
  }

  /**
   * Render Embed tool content
   *
   * @return {HTMLElement}
   */
  render() {
    const container = this._make('div', this.CSS.container);
    this.adder = this._make('div', this.CSS.addrWrapper);
    const addrInputWrapper = this._make('div', this.CSS.addrInputWrapper);
    this.addrInput = this._make('input', this.CSS.addrInput);
    this.addrInputBtn = this._make('button', this.CSS.addrInputBtn);
    this.addrInputBtn.addEventListener('click', debounce(this.addrInputConfirmHandler.bind(this), 300))
    this.containerLoading = this._make('div', this.CSS.containerLoading);

    this.addrDescWrapper = this._make('div', this.CSS.addrDescWrapper);
    const addrDescHeader= this._make('div', this.CSS.addrDescHeader);
    const addrDesc = this._make('div', this.CSS.addrDesc);

    this.addrProviderToggler = this._make('div', this.CSS.addrProviderToggler);
    this.addrProviderList = this.makeProviderIconList()

    this.addrInput.placeholder = "请输入网页地址"
    this.addrInput.addEventListener('input', debounce(this.addrInputHandler.bind(this), 300))

    this.addrInputBtn.innerText = "确定"

    addrInputWrapper.appendChild(this.addrInput);
    addrInputWrapper.appendChild(this.addrInputBtn);

    addrDesc.innerText = "仅支持嵌入以下站点的内容或服务: "
    this.addrProviderToggler.innerText = "展开全部"
    addrDescHeader.appendChild(addrDesc);
    addrDescHeader.appendChild(this.addrProviderToggler);

    this.addrDescWrapper.appendChild(addrDescHeader);
    this.addrDescWrapper.appendChild(this.addrProviderList);

    this.adder.appendChild(addrInputWrapper);
    this.adder.appendChild(this.addrDescWrapper);

    container.appendChild(this.adder);
    container.appendChild(this.containerLoading);
    // const container = document.createElement('div');

    this.addrProviderToggler.addEventListener("click", this.handleProviderToggle.bind(this))

    this.element = container;

    return container;
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
   * Paste configuration to enable pasted URLs processing by Editor
   */
  static get pasteConfig() {
    return {
      patterns: Embed.patterns
    };
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
