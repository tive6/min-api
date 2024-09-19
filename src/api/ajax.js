import { Body, fetch as client, ResponseType } from '@tauri-apps/api/http'

import { getCookies, getGlobalConfig, getUrl, mergeHeaders } from '../common/helper.js'

export const defaultHeaders = {
  'user-agent': 'Min-Api/Tauri-fetch-4.0.0', // 添加自定义的 User-Agent 头部
  // 'content-type': 'application/json',
}

// https://tauri.app/zh-cn/v1/api/js/http#fetch
export const http = (opts = {}) => {
  return new Promise((resolve, reject) => {
    const { url, method, params, data, requestType, headers, callback } = opts
    let { contentType, header } = mergeHeaders(
      {
        ...getGlobalConfig('header'),
        ...headers,
      },
      requestType
    )
    let cookie = getCookies()
    console.log('http options header', header)
    console.log('http options cookie', cookie)
    console.log('http options data', data)
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
    console.log('responseType', responseType === 3 ? 'Binary' : 'TEXT')
    console.log('http body', body)
    let path = getUrl(url)
    console.log('http options url', path)
    client(path, {
      method: method || 'GET',
      headers: {
        ...header,
        cookie,
      },
      responseType: responseType,
      timeout: 5 * 60 * 1000,
      query: {
        ...getGlobalConfig('query'),
        ...params,
      },
      body: data && body,
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
    const { url, method, params, data, requestType, headers, callback } = opts
    let { contentType, header } = mergeHeaders(headers)
    let cookie = getCookies()
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
    fetch(path, {
      method: method || 'GET',
      headers: {
        'content-type': 'application/json',
        ...getGlobalConfig('header'),
        ...defaultHeaders,
        ...headers,
        cookie,
      },
      mode: 'cors',
      cache: 'default',
      credentials: 'same-origin', // include, *same-origin, omit
      redirect: 'follow', // manual, *follow, error
      timeout: 5 * 60 * 1000,
      body: body,
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
