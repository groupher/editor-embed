import { debounce } from 'debounce';

import tippy, { hideAll } from 'tippy.js'
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

import ClipIcon from './icon/clip.svg'

import PROVIDERS from './providers';
import { parseDomain, loadJS, getQueryFromUrl } from './utils'
import { customIframeFragment, CUSTOM_PROVIDERS, PROVIDER_ANCHORS } from './custom_embeds'

const tooltipHideAll = hideAll

export default class Ui {
  constructor({ api, data, config, setData }) {
    this.api = api
    this.i18n = config.i18n || 'en'
    this.config = config

    this.data = data
    this.setData = setData

    this.element = null;
  }

  /**
   * CSS classes
   * @constructor
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
      clip: 'embed-clip',
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
   * handle link embed after user confirm url in current input
   *
   */
  addrInputConfirmHandler() {
    const { value: curUrl } = this.addrInput

    const domain = parseDomain(curUrl)
    const embedHTML = this._make('div', '')

    this.element.innerHTML = null
    this.element.classList.add(this.CSS.container)
    this.element.appendChild(this.containerLoading)

    if (R.contains(domain, CUSTOM_PROVIDERS)) {

      const { valid, html, fid } = customIframeFragment(curUrl)
      if(!valid) return console.log("TODO:  red alert UI")
      embedHTML.innerHTML = html

      setTimeout(() => {
        console.log("custom embeds loaded: ")
      }, 1000)

      this.element.appendChild(embedHTML);

      this.setTopBorder('success')
      this.setData('iframe', curUrl)

      return false
    }

    return this.embedDefaultContent(curUrl)
  }

  /**
   * embed default content using embed.ly service
   * turn into a tag: <a href="http://embed.ly" class="embedly-card">Embedly</a>
   *
   */
  embedDefaultContent(url) {
    const embedHTML = this._make('a', 'embedly-card', {
      href: encodeURI(url),
      "data-card-controls": 0
    })

    // embedHTML.dataset["card-controls"] = 0
    embedHTML.setAttribute("data-card-controls", "0")
    this.element.appendChild(embedHTML);

    this.adder.style.display = 'none'
    this.containerLoading.style.display = "block"
    embedly('on', 'card.rendered', (iframe) => {
      // iframe is the card iframe that we used to render the event.
      setTimeout(() => {
        console.log('loading done: ', iframe.contentWindow)
        const doc = iframe.contentWindow
        // TODO:  有些没有图片，而且只需要解析出视频网站的信息就可以了

        const imgSrc = doc.document.querySelector(".art-bd-img").src
        console.log('got doc: ', imgSrc)
        console.log('NOTE: 图片地址是 embedly 缓存地址')
        console.log('TODO: 上传到云 oss 作为预览图片')
      }, 2000)

      this.containerLoading.style.display = "none"
      this.adder.style.display = 'none'

      const { value } = this.addrInput
      this.setData('embedly', value)

      this.setTopBorder('success')
    });
  }

  /**
   * set top border color for card
   * @param type, string, default | success | error
   */
  setTopBorder(type = 'default') {
    this.element.classList.remove('embed-top-success')
    this.element.classList.remove('embed-top-error')
    this.element.classList.remove('embed-top-default')

    switch (type) {
      case 'success': {
        const clipIconEl = this._make('div', [this.CSS.clip], {
          innerHTML: ClipIcon
        })
    
        this.element.appendChild(clipIconEl)
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
   * handle addr input change
   *
   * highlight icon which the icon
   */
  addrInputHandler() {
    const { value } = this.addrInput
    // Object.keys(PROVIDERS)
    const providerKeys = R.pluck('domain', PROVIDERS)
    const domain = parseDomain(value)

    if (value.trim() === "") {
      this.hideConfirmBtn()
      // lighten all the icons
      this.lightenAllProviderIcons()
      return false
    }

    // if is unsupported domain, just hide the confirmbtn
    providerKeys.indexOf(domain) > -1 ? this.showConfirmBtn() : this.hideConfirmBtn()
    this.highlightCurrentProviderIcon()
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


  // highlight the current provider icon for current domain
  highlightCurrentProviderIcon() {
    const { value } = this.addrInput
    if (R.isEmpty(value.trim())) return false

    const providerKeys = R.pluck('domain', PROVIDERS)
    const domain = parseDomain(value)

    // highlight the current provider icon for current domain
    for (let i = 0; i < providerKeys.length; i++) {
      const curKey = providerKeys[i]
      // TODO:  潜在 bug
      const icon = document.querySelector('.icon-' + curKey)

      domain === curKey ? this.setIcon(icon, "on") : this.setIcon(icon, "off")
    }
  }

  /**
   * Helper method for elements creation
   * @param icon, HTMLElement
   * @param type, string, on | off
   */
  setIcon(icon, type = "on") {
    if (!icon) return false

    if (type === "on") {
      icon.style.opacity = 1
      icon.style.filter = "grayscale(0)"
    } else {
      icon.style.opacity = 0.5
      icon.style.filter = "grayscale(1)"
    }
  }

  /**
   * lighten all the provider icons
   * @param providerKeys, array of string
   */
  lightenAllProviderIcons() {
    const providerKeys = R.pluck('domain', PROVIDERS)

    for (let i = 0; i < providerKeys.length; i++) {
      const curKey = providerKeys[i]
      // TODO:  maybe 隐患
      const icon = document.querySelector('.icon-' + curKey)

      this.setIcon(icon, "on")
    }
  }

  /**
   * Render valid service icon list in digest view
   *
   * @return {HTMLElement}
   */
  makeProviderIconList() {
    const addrIconWrapper = this._make("div", this.CSS.addrIconWrapper);
    const providers = R.filter(provider => provider.showInBrief, PROVIDERS)

    providers.forEach(provider => {
      const Icon = this._make("img", [this.CSS.addrIcon, 'icon-' + provider.domain], {
        src: provider.icon,
      })

      tippy(Icon, this.providerPopoverCard(provider))
      addrIconWrapper.appendChild(Icon)

      // add divider if need
      if (R.contains(provider.domain, PROVIDER_ANCHORS)) {
        const Divider = this._make("div", this.CSS.addrIconDivider)
        Divider.innerText = '/'
        addrIconWrapper.appendChild(Divider)
      }
    })

    return addrIconWrapper
  }

  /**
   * Render valid service icon list in details view
   *
   * @return {HTMLElement}
   */
  makeProviderIconListDetails() {
    const typeList = R.keys(R.groupBy((provide) => provide.type, PROVIDERS))
    const ListWrapper = this._make("div", this.CSS.addrDetailWrapper);

    // TODO:  add issue
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
        const Icon = this._make("img", [this.CSS.addrDetailIcon, 'icon-' + provider.domain], {
          src: provider.icon,
        })

        tippy(Icon, this.providerPopoverCard(provider))

        AddrIconWrapper.appendChild(Icon)
      })

      ListWrapper.appendChild(Title)
      ListWrapper.appendChild(AddrIconWrapper)
    })

    ListWrapper.appendChild(FooterLink)
    return ListWrapper
  }

  /**
   * return tippy config for each provider popover card
   * @param {HTMLElement}
   * @return {object}
   */
  providerPopoverCard(provider) {
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
      if (this.isEmbeding()) return false

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
   * check is the card is embeding
   */
  isEmbeding() {
    return this.containerLoading.style.display === "block" ? true : false
  }

  /**
   * toggle providers view type
   *
   */
  handleProviderToggle() {
    if (this.showProvidersDetail) {
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
   * render default adder view, with inputer, site white list staff
   * @return {HTMLElement}
   */
  renderAdderView() {
    const container = this._make('div', this.CSS.container);
    this.adder = this._make('div', this.CSS.addrWrapper);
    const addrInputWrapper = this._make('div', this.CSS.addrInputWrapper);
    this.addrInput = this._make('input', this.CSS.addrInput);
    this.addrInputBtn = this._make('button', this.CSS.addrInputBtn);
    this.addrInputBtn.addEventListener('click', debounce(this.addrInputConfirmHandler.bind(this), 300))
    this.containerLoading = this._make('div', this.CSS.containerLoading);

    this.addrDescWrapper = this._make('div', this.CSS.addrDescWrapper);
    const addrDescHeader = this._make('div', this.CSS.addrDescHeader);
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

    this.element = container
    return container
  }

  // change view to adderView when edit button clicked in settings panel
  // if value passed, it means edit mode
  changeToAdderView(provider) {
    this.element.innerHTML = null
    this.element.classList = ''

    this.element.appendChild(this.renderAdderView())
    // this.element.replaceWith(this.renderAdderView())
    // this.element = this.renderAdderView()
    this.addrInput.value = provider || this.data.provider
    this.addrInputHandler()
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