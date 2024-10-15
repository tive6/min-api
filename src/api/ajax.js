import {
  Body,
  fetch,
  ResponseType,
} from '@tauri-apps/api/http'

import {
  getCookies,
  getGlobalConfig,
  getUrl,
  mergeHeaders,
} from '../common/helper.js'

export const defaultHeaders = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  // 'user-agent': 'Min-Api/Tauri-fetch-4.0.0', // 添加自定义的 User-Agent 头部
  // 'content-type': 'application/json',
}

export const timeout = 5 * 60 * 1000

// https://tauri.app/zh-cn/v1/api/js/http#fetch
export const http = (opts = {}) => {
  return new Promise((resolve, reject) => {
    const {
      url,
      method,
      params,
      data,
      requestType,
      headers,
      callback,
    } = opts
    console.log('user input headers', headers)
    let { contentType, header } = mergeHeaders(
      {
        ...getGlobalConfig('header'),
        ...headers,
      },
      requestType
    )
    let headerCookie = (header?.cookie || '') + ';'
    let cookie = getCookies(headerCookie)
    console.log('http options header', header)
    console.log('http options cookie', cookie)
    console.log('http options data', data)
    console.log('http options params', params)
    let body = null
    if (contentType === 'form') {
      body = Body.form(data)
      console.log('contentType', 'form')
    } else {
      body = Body.json({
        ...getGlobalConfig('body'),
        ...data,
      })
      console.log('contentType', 'json')
    }
    let responseType = ResponseType.Text
    if (requestType === 'download') {
      responseType = ResponseType.Binary
    }
    console.log(
      'responseType',
      responseType === 3 ? 'Binary' : 'TEXT'
    )
    console.log('http body', body)
    let path = getUrl(url)
    console.log('http options url', path)
    fetch(url, {
      method: method || 'GET',
      headers: {
        ...header,
        cookie,
      },
      query: {
        ...getGlobalConfig('query'),
        ...params,
      },
      body: data && body,
      responseType: responseType,
      timeout,
    })
      .then((res) => {
        callback && callback(res)
        resolve(res)
      })
      .catch((e) => {
        reject(e)
      })
  })
}

// https://developer.mozilla.org/zh-CN/docs/Web/API/fetch
// https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API
export const stream = (opts = {}) => {
  return new Promise((resolve, reject) => {
    const {
      url,
      method,
      params,
      data,
      requestType,
      headers,
      callback,
    } = opts
    let { contentType, header } = mergeHeaders(headers)
    let headerCookie = (header?.cookie || '') + ';'
    let cookie = getCookies(headerCookie)
    console.log('stream options contentType', contentType)
    console.log('stream options header', header)
    console.log('stream options cookie', cookie)
    console.log('stream options data', data)
    let body = null
    if (!['GET', 'HEAD'].includes(method)) {
      body = JSON.stringify({
        ...getGlobalConfig('body'),
        ...(data || {}),
      })
    }
    let query = new URLSearchParams({
      ...getGlobalConfig('query'),
      ...params,
    })
    let queryStr = query.toString()
    let uri = `${url}${queryStr ? `?${queryStr}` : ''}`
    let path = getUrl(uri)
    console.log('http options url', path)
    window
      .fetch(path, {
        method: method || 'GET',
        headers: {
          'content-type': 'application/json',
          ...defaultHeaders,
          ...getGlobalConfig('header'),
          ...headers,
          cookie,
        },
        body: body,
        timeout,
        mode: 'cors',
        cache: 'default',
        credentials: 'same-origin', // include, *same-origin, omit
        redirect: 'follow', // manual, *follow, error
      })
      .then((res) => {
        callback && callback(res)
        resolve(res)
      })
      .catch((e) => {
        reject(e)
      })
  })
}
