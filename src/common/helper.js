import { open, save } from '@tauri-apps/api/dialog'
import {
  readTextFile,
  writeBinaryFile,
  writeTextFile,
} from '@tauri-apps/api/fs'
import { downloadDir } from '@tauri-apps/api/path'
import localforage from 'localforage'
import { cloneDeep } from 'lodash-es'
import { parse } from 'path-browserify'

import { defaultHeaders } from '../api/ajax.js'
import {
  getCurrentEnv,
  getSettingsList,
  getStoreData,
  setStoreData,
} from '../store/index.js'
import { ContentTypeMap } from './config.js'
import { historyKey, httpRegex } from './consts.js'

export const formatFixedDate = (date, fmt) => {
  if (typeof date === 'number') {
    date = new Date(date)
  }
  if (!(date instanceof Date)) {
    return ''
  }
  if (typeof date === 'string') {
    date = date.includes('0+0000')
      ? date.substr(0, 19)
      : date
  }
  let o = {
    'M+': date.getMonth() + 1, //月份
    'd+': date.getDate(), //日
    'h+':
      date.getHours() % 12 === 0
        ? 12
        : date.getHours() % 12, //小时
    'H+': date.getHours(), //小时
    'm+': date.getMinutes(), //分
    's+': date.getSeconds(), //秒
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds(), //毫秒
  }
  let week = {
    0: '日',
    1: '一',
    2: '二',
    3: '三',
    4: '四',
    5: '五',
    6: '六',
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  if (/(E+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (RegExp.$1.length > 1
        ? RegExp.$1.length > 2
          ? '星期'
          : '周'
        : '') + week[date.getDay() + '']
    )
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1
          ? o[k]
          : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return fmt
}

export const queryToObj = (url) => {
  let urlData = []
  let queryObj = {}
  let p = url.match(/\?(\S*)/)
  p = p ? p[1] : ''
  if (p.trim() !== '') {
    let arr = p.split('&')
    arr.map((item) => {
      let [keys, values = ''] = item.split('=')
      queryObj[keys] = values
      urlData.push({
        keys,
        values,
      })
    })
  }
  return {
    queryObj,
    queryArr: urlData,
  }
}

export const objToArr = (obj = {}) => {
  if (JSON.stringify(obj) === '{}') {
    return []
  } else {
    return Object.keys(obj).map((keys) => {
      return {
        keys,
        values: obj[keys],
      }
    })
  }
}

export const arrToObj = (arr) => {
  if (arr.length <= 0) return {}
  let obj = {}
  arr.map((item) => {
    obj[item.keys] = item.values
  })
  return obj
}

export const getRandomKey = () => {
  return Math.random().toString(36).slice(2)
}

export const formContentType = [
  'application/x-www-form-urlencoded',
  'multipart/form-data',
]

export const mergeHeaders = (headers = {}, requestType) => {
  let defaultData = {
    header: defaultHeaders,
  }
  try {
    let keys = Reflect.ownKeys(headers)
    if (keys.length === 0) {
      if (requestType === 'upload') {
        return {
          header: {
            ...defaultHeaders,
            'Content-Type': 'multipart/form-data',
          },
          contentType: 'form',
        }
      } else {
        return defaultData
      }
    }
    let opts = {
      ...defaultHeaders,
    }
    let type = 'json'
    Object.entries(headers).forEach(([k, v]) => {
      let key = k.toLowerCase()
      if (
        key === 'content-type' &&
        formContentType.some((item) => v.includes(item))
      ) {
        type = 'form'
      }
      opts[key] = v
    })
    return {
      contentType: type,
      header: opts,
    }
  } catch (e) {
    console.warn(e)
    return defaultData
  }
}

export const fileToUint8Array = (file) => {
  return new Promise((resolve) => {
    let reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onload = (e) => {
      resolve(new Uint8Array(e.target.result))
    }
  })
}

export const getContentType = (headers) => {
  let value = ''
  Object.entries(headers).forEach(([k, v]) => {
    if (k.toLowerCase() === 'content-type') {
      value = v
    }
  })
  return value
}

export const getFilename = (headers) => {
  let disposition = headers['content-disposition']
  let str = disposition.split('=')[1].replace(/\\"/g, '')
  return str.replace(/^"|"$/g, '')
}

const genUUID = () => {
  return Math.random()
    .toString(36)
    .toLowerCase()
    .substring(2)
}

export const getStaticFileInfo = ({ url, headers }) => {
  let contentType = getContentType(headers)
  let { base, ext, name } = parse(url)
  let arr = Object.entries(ContentTypeMap).find(([k, v]) =>
    contentType.includes(k)
  )
  console.log(arr)
  if (ext) {
    return base
  } else {
    return `${genUUID()}.${arr[1]}`
  }
}

export const OctetStreamType = 'application/octet-stream'

export const isOctetStream = (headers) => {
  let contentType = getContentType(headers) || ''
  return contentType.includes(OctetStreamType)
}

export const downloadFile = async ({
  url,
  data,
  headers,
}) => {
  try {
    let filename = ''
    if (isOctetStream(headers)) {
      filename = getFilename(headers)
    } else {
      filename = getStaticFileInfo({
        url,
        filename,
        headers,
      })
    }
    filename = decodeURIComponent(filename)
    console.log({ filename })
    let { dir, base, ext, name } = parse(filename)
    // console.log({ dir, base, ext, name })
    let opts = {
      title: `Save ${base}`,
    }
    if (ext.includes('.')) {
      ;[, ext] = ext.split('.')
      opts = {
        ...opts,
        defaultPath: name,
        filters: [
          {
            name: name,
            extensions: [ext],
          },
        ],
      }
    } else {
      opts = {
        ...opts,
        defaultPath: filename,
      }
    }
    const filePath = await save(opts)
    console.log({ filePath })
    if (!filePath) return
    await writeBinaryFile(filePath, data, {
      // dir: BaseDirectory.Download,
      // dir: dir,
      recursive: true,
    })
    return null
  } catch (err) {
    console.info(err)
    return numbersArrayToText(data)
  }
}

export async function processStream(reader, cb) {
  let buffer = ''
  let content = ''
  let haveData = true
  const decoder = new TextDecoder()
  try {
    while (haveData) {
      const { value, done } = await reader.read()
      if (done) {
        haveData = false
        break
      }
      // console.log(value, 888)
      buffer += decoder.decode(value)
      // console.log(buffer)
      while (buffer.includes('\n')) {
        const line = buffer.substring(
          0,
          buffer.indexOf('\n')
        )
        // console.log(line)
        buffer = buffer.substring(buffer.indexOf('\n') + 1)

        cb && cb(line)
        // if (line.startsWith('data:')) {
        //   // const jsonData = JSON.parse(line.substring(5))
        //   // console.log(line.substring(5))
        //   cb && cb(line)
        // } else {
        //   // console.log('Received message:', line)
        //   // 在这里处理接收到的文本数据
        // }
      }
    }

    reader.releaseLock()
    return content
    // appendToOutput(new Date().toLocaleString());
  } catch (e) {
    console.log(e)
    return ''
  }
}

export const getLocalHistoryList = async () => {
  try {
    let list = await localforage.getItem(historyKey)
    return list || []
  } catch (e) {
    console.log(e)
    return []
  }
}

export async function exportHistory(json) {
  try {
    // let list = await getLocalHistoryList()
    let filename = `min-api-settings-${Date.now()}`
    const filePath = await save({
      title: `Save ${filename}`,
      defaultPath: filename,
      filters: [
        {
          name: filename,
          extensions: ['json'],
        },
      ],
    })
    console.log({ filePath })
    if (!filePath) return false
    await writeTextFile(
      filePath,
      JSON.stringify(json, null, 2),
      {
        // dir: BaseDirectory.Download,
        recursive: true,
      }
    )
    return true
  } catch (e) {
    console.log(e)
    return false
  }
}

export async function importHistory(configMap, json) {
  try {
    for (let k in json) {
      let { localKey, storeListKey } = configMap[k]
      let data = getStoreData(storeListKey) || []
      let list = [...cloneDeep(data), ...(json[k] || [])]
      await localforage.setItem(localKey, list)
      setStoreData(storeListKey, list)
    }
    return true
  } catch (e) {
    console.log(e)
    return null
  }
}

export async function readImportConfig() {
  try {
    const filePath = await open({
      directory: false,
      multiple: false,
      defaultPath: await downloadDir(),
      filters: [
        {
          name: '',
          extensions: ['json'],
        },
      ],
    })
    console.log({ filePath })
    if (!filePath) return null
    let res = await readTextFile(filePath, {
      recursive: true,
    })
    return JSON.parse(res)
  } catch (e) {
    console.log(e)
    return null
  }
}

export function numbersArrayToText(arr) {
  let utf8decoder = new TextDecoder()
  let arrayBuffer = new Uint8Array(arr).buffer
  let data = utf8decoder.decode(arrayBuffer)
  try {
    return JSON.parse(data)
  } catch (e) {
    console.info(`numbersArrayToText: ${e}`)
    return data
  }
}

export function HeadersFirstRowHandle(arr = []) {
  if (arr.length === 0) {
    arr = [
      {
        keys: 'content-type',
        values: 'application/json',
      },
      ...arr,
    ]
  } else {
    let ct = null
    arr = arr.filter((item, index) => {
      let { keys, values } = item
      let key = keys.toLowerCase()
      if (key === 'content-type') {
        ct = {
          ...item,
        }
        return false
      }
      return true
    })
    if (ct) {
      arr = [ct, ...arr]
    } else {
      arr = [
        {
          keys: 'content-type',
          values: 'application/json',
        },
        ...arr,
      ]
    }
  }
  return arr
}

export function getGlobalConfig(type) {
  let list = getSettingsList(type)
  let obj = {}
  list.forEach(({ k, v, enable }) => {
    if (enable) {
      obj[k] = v
    }
  })
  return obj
}

export function getCookies(initialValue = '') {
  let list = getSettingsList('cookie')
  return list.reduce((acc, { k, v, enable }) => {
    if (enable) {
      acc += `${k}=${v}; `
    }
    return acc
  }, initialValue)
}

export function getUrl(url) {
  let uri = ''
  if (httpRegex.test(url)) {
    uri = url
  } else {
    let baseUrl = getCurrentEnv()?.trim()
    uri = `${baseUrl}${url}`
  }
  return uri
}

// 阻止右键菜单
export function contextmenuHandler(event) {
  event.preventDefault()
}

// 阻止F12、Ctrl+Shift+I、Ctrl+Shift+C快捷键打开 开发者工具
export function keyDownHandler(event) {
  const { keyCode, ctrlKey, shiftKey } = event
  if (
    keyCode === 123 ||
    (ctrlKey && shiftKey && [67, 73].includes(keyCode))
  ) {
    // F12 123
    // Ctrl+Shift+I 73
    // Ctrl+Shift+C 67
    event.preventDefault()
    event.stopPropagation()
    event.returnValue = false
    return false
  }
}

export function windowEventListener(type) {
  document[`${type}EventListener`](
    'contextmenu',
    contextmenuHandler
  )
  document[`${type}EventListener`](
    'keydown',
    keyDownHandler
  )
}
