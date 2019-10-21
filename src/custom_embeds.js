
import { parseDomain } from './utils'

// provider not using embedly service
export const CUSTOM_PROVIDERS = ['amap', 'bilibili']

// break points for provider digest view
export const PROVIDER_ANCHORS = ['jsfiddle', 'infoq', 'producthunt', 'ted']

/**
 * the provider that embedly can't parse or parse not right
 * @param url, string
 * @return {object} {valid: bool, iframe: string}
 */
export const  customIframeFragment = (url) => {
  const domain = parseDomain(url)

  switch(domain) {
    case 'amap': {
      // const mapSrc = "https://www.amap.com/search?query=%E5%8D%97%E6%B9%96%E5%85%AC%E5%9B%AD&city=510100&geoobj=104.064056%7C30.629666%7C104.073637%7C30.635279&zoom=17"
      // const mapSrc = "https://ditu.amap.com/search?query=%E5%8D%97%E6%B9%96%E5%85%AC%E5%9B%AD&city=510100&geoobj=104.064056%7C30.629666%7C104.073637%7C30.635279&zoom=17"
      const mapSrc = url
      const html = `<iframe sandbox="allow-scripts allow-same-origin allow-presentation" src="${mapSrc}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen="" style="width: 100%; height: 300px;"></iframe>`
      return { valid: true, html }
    }
    case 'bilibili': {
      // TODO:  try-catch
      // const url = 'https://www.bilibili.com/video/av35398818/'
      const { pathname } = new URL(url)

      const aid = pathname.replace(/\//g, "").split('videoav')[1]
      const src = `https://player.bilibili.com/player.html?aid=${aid}`

      const html = `<iframe sandbox="allow-scripts allow-same-origin allow-popups allow-presentation" src="${src}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen="" style="width: 100%; height: 381.938px; max-width: 730px;
      max-height: 410.625px;"></iframe>`

      return { valid: true, html }
    }
    default: {
      return { valid: false, html: "" }
    }
  }
}
