/**
 * dynamically load script
 * see https://stackoverflow.com/questions/14521108/dynamically-load-js-inside-js
 * @param {*} url
 * @param {*} func callback function
 * @param {*} location
 */
export const loadJS = function (url, func, location) {
  // url is URL of external file, func is the code
  // to be called from the file, location is the location to
  // insert the <script> element

  let scriptTag = document.createElement('script');

  scriptTag.src = url;

  scriptTag.onload = func;
  scriptTag.onreadystatechange = func;

  location.appendChild(scriptTag);
};

/* eslint-disable */
// see: https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string
export const parseDomain = url => {
  try {
    const parsedUrl = {}

    if (url === null || url.length === 0) return parsedUrl

    const protocolI = url.indexOf('://')
    parsedUrl.protocol = url.substr(0, protocolI)

    const remainingUrl = url.substr(protocolI + 3, url.length)
    let domainI = remainingUrl.indexOf('/')
    domainI = domainI === -1 ? remainingUrl.length - 1 : domainI
    parsedUrl.domain = remainingUrl.substr(0, domainI)
    parsedUrl.path =
      domainI === -1 || domainI + 1 === remainingUrl.length
        ? null
        : remainingUrl.substr(domainI + 1, remainingUrl.length)

    const domainParts = parsedUrl.domain.split('.')
    switch (domainParts.length) {
      case 2:
        parsedUrl.subdomain = null
        parsedUrl.host = domainParts[0]
        parsedUrl.tld = domainParts[1]
        break
      case 3:
        parsedUrl.subdomain = domainParts[0]
        parsedUrl.host = domainParts[1]
        parsedUrl.tld = domainParts[2]
        break
      case 4:
        parsedUrl.subdomain = domainParts[0]
        parsedUrl.host = domainParts[1]
        parsedUrl.tld = domainParts[2] + '.' + domainParts[3]
        break
    }

    parsedUrl.parent_domain = parsedUrl.host + '.' + parsedUrl.tld

    return parsedUrl.host
  } catch (e) {
    return '??'
  }
}