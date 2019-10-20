import { debounce } from 'debounce';
import tippy, { hideAll } from 'tippy.js'
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

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

    loadJS(embedlyScript, null, document.body);
    loadJS(ramdaScript, null, document.body)
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

    // const {service, source, embed, width, height, caption = ''} = data;

    // TODO:  check valid
    this._data = {
      type: 'embedly', // embedly or iframe
      provider: this.addrInput ? this.addrInput.value : '',
      // TODO:  maybe iframe
      value: this.addrInput ? this.addrInput.value : '',
    };

    // const oldView = this.element;

    // if (oldView) {
    //   oldView.parentNode.replaceChild(this.render(), oldView);
    // }
  }

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

  /**
   * set saved data by type
   */
  setData(type='embedly') {
    // embedly or iframe
    this._data = {
      type,
      provider: this.addrInput ? this.addrInput.value : '',
      value: this.addrInput ? this.addrInput.value : '',
    };
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
         provider.domain === 'infoq' ||
         provider.domain === 'producthunt' ||
         provider.domain === 'ted') {
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
    this.addrInput.style.width = 'calc(100% - 75px)'

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
      // lighten all the icons
      this.lightenAllProviderIcons()
      return false
    }

    // if is unsupported domain, just hide the confirmbtn
    providerKeys.indexOf(domain) > -1 ? this.showConfirmBtn() : this.hideConfirmBtn()
    this.highlightCurrentProviderIcon()
  }

  // highlight the current provider icon for current domain
  highlightCurrentProviderIcon() {
    const { value } = this.addrInput
    if (R.isEmpty(value.trim())) return false

    const providerKeys = R.pluck('domain', PROVIDERS)
    const domain = parseDomain(value)

    // highlight the current provider icon for current domain
    for(let i = 0; i < providerKeys.length; i++ ) {
      const curKey = providerKeys[i]
      const icon = document.querySelector('.icon-' + curKey)

      domain === curKey ? this.setIcon(icon, "on") : this.setIcon(icon, "off")
    }
  }

  /**
   * handle link embed after user confirm url in current input
   *
   */
  addrInputConfirmHandler() {
    const { value } = this.addrInput
    const domain = parseDomain(value)

    const embedHTML = this._make('div', '')

    this.element.innerHTML = null
    this.element.classList.add(this.CSS.container)
    this.element.appendChild(this.containerLoading)

    if(R.contains(domain, CUSTOM_PROVIDERS)) {
      const { html } = customIframeFragment(value)
      embedHTML.innerHTML =  html

      console.log('addrInputConfirmHandler this.element: ', this.element)
      this.element.appendChild(embedHTML);

      this.setTopBorder('success')
      this.setData('iframe')
      return false
    }

    return this.embedDefaultContent(value)
  }

  /**
   * embed default content using embed.ly service
   * turn into a tag: <a href="http://embed.ly" class="embedly-card">Embedly</a>
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
      this.setData()

      this.setTopBorder('success')
    });
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

    this.lightenAllProviderIcons()
    this.highlightCurrentProviderIcon()
    this.showProvidersDetail = !this.showProvidersDetail
  }

  /**
   * Render Embed tool content
   *
   * @return {HTMLElement}
   */
  render() {
    this.element = this.renderAdderView();

    return this.element;
  }

  renderAdderView() {
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

    return container
  }

  /**
   * editor or go to origin site when edit
   * @public
   *
   * @return {Element}
   */
  renderSettings() {
    if(R.isEmpty(this.data.provider)) return this._make('DIV', '')

    // this.data.value
    const Wrapper = this._make('DIV', ['custom-setting-wrapper'])

    const editIcon = this._make('DIV', ['cdx-settings-button'], {
      title: '编辑',
    })
    editIcon.innerHTML = '<svg width="20" height="20" t="1571574221393" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3197" width="200" height="200"><path d="M690.086957 178.086957 333.913043 534.26087 489.73913 690.086957 845.913043 333.913043 690.086957 178.086957" p-id="3198"></path><path d="M734.608696 133.565217 890.434783 289.391304 948.001391 231.824696C965.38713 214.438957 965.38713 186.256696 948.001391 168.870957L855.129043 75.998609C837.743304 58.61287 809.561043 58.61287 792.175304 75.998609L734.608696 133.565217" p-id="3199"></path><path d="M289.391304 578.782609 244.869565 779.130435 445.217391 734.608696 289.391304 578.782609" p-id="3200"></path><path d="M823.652174 512 823.652174 868.173913 155.826087 868.173913 155.826087 200.347826 512 200.347826 601.043478 111.304348 111.304348 111.304348C89.043478 111.304348 68.518957 133.565217 68.518957 155.826087L66.782609 155.826087 66.782609 908.354783C66.782609 935.201391 92.115478 957.217391 119.05113 957.217391L863.899826 957.217391C890.835478 957.217391 912.695652 935.468522 912.695652 908.354783L912.695652 422.956522 823.652174 512" p-id="3201"></path></svg>'

    editIcon.addEventListener("click", () => {
      this.element.innerHTML = null
      console.log('this.element.classList: ', this.element.classList)
      this.element.classList = ''
      console.log('before this.element: ', this.element)

      this.element.appendChild(this.renderAdderView())
      // this.element.replaceWith(this.renderAdderView())
      // this.element = this.renderAdderView()
      this.addrInput.value = this.data.provider
      this.addrInputHandler()
    })

    const gotoIcon = this._make('a', ['cdx-settings-button'], {
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
   * set top border color for card
   * @param type, string, default | success | error
   */
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
   * lighten all the provider icons
   * @param providerKeys, array of string
   */
  lightenAllProviderIcons() {
    const providerKeys = R.pluck('domain', PROVIDERS)

    for(let i = 0; i < providerKeys.length; i++ ) {
      const curKey = providerKeys[i]
      const icon = document.querySelector('.icon-' + curKey)

      this.setIcon(icon, "on")
    }
  }

  /**
   * Helper method for elements creation
   * @param icon, HTMLElement
   * @param type, string, on | off
   */
  setIcon(icon, type="on") {
    if(!icon) return false

    if(type === "on") {
      icon.style.opacity = 1
      icon.style.filter = "grayscale(0)"
    } else {
      icon.style.opacity = 0.5
      icon.style.filter = "grayscale(1)"
    }
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
