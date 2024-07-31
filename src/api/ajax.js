import { Body, fetch as client, ResponseType } from '@tauri-apps/api/http'

import { mergeHeaders } from '../common/helper.js'

export const defaultHeaders = {
  'user-agent': 'GetTools/Tauri-fetch-3.0.0', // 添加自定义的 User-Agent 头部
  // 'content-type': 'application/json',
}

// https://tauri.app/zh-cn/v1/api/js/http#fetch
export const http = (opts = {}) => {
  return new Promise((resolve, reject) => {
    const { url, method, params, data, requestType, headers, callback } = opts
    let { contentType, header } = mergeHeaders(headers, requestType)
    console.log({ header, data })
    let body = null
    if (contentType === 'form') {
      body = Body.form(data)
      console.log('contentType', 'form')
    } else {
      body = Body.json(data)
      console.log('contentType', 'json')
    }
    let responseType = ResponseType.Text
    if (requestType === 'download') {
      responseType = ResponseType.Binary
    }
    console.log('响应类型', responseType === 3 ? 'Binary' : 'TEXT')
    console.log({ body })
    client(url, {
      method: method || 'GET',
      headers: header,
      responseType: responseType,
      timeout: 5 * 60 * 1000,
      query: params,
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
    console.log({ contentType, header, data })
    let body = null
    if (!['GET', 'HEAD'].includes(method)) {
      body = JSON.stringify(data || {})
    }
    let query = new URLSearchParams(params)
    let queryStr = query.toString()
    let uri = `${url}${queryStr ? `?${queryStr}` : ''}`
    fetch(uri, {
      method: method || 'GET',
      headers: {
        'content-type': 'application/json',
        ...defaultHeaders,
        ...headers,
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
