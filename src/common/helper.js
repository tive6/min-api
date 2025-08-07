import {
  readText,
  writeText,
} from '@tauri-apps/api/clipboard'
import { open, save } from '@tauri-apps/api/dialog'
import {
  readTextFile,
  writeBinaryFile,
  writeTextFile,
} from '@tauri-apps/api/fs'
import { downloadDir } from '@tauri-apps/api/path'
import { message } from 'antd'
import fetchToCurl from 'fetch-to-curl'
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
import { toJsonObject } from './curlToJson.js'

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
    console.log(headers)
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
        if (!buffer.includes('\n')) {
          cb && cb(buffer)
        }
        break
      }
      let text = decoder.decode(value)
      buffer += text
      // console.log('text', buffer)
      while (buffer.includes('\n')) {
        let index = buffer.indexOf('\n')
        let line = buffer.substring(0, index)
        buffer = buffer.substring(index + 1)
        line?.trim() && cb && cb(line)
      }
    }

    reader.releaseLock()
    return content
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
  if (httpRegex.test(url.trim())) {
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

export async function curlExport() {
  try {
    let text = await readText()
    console.log(text)
    let json = toJsonObject(text)
    return {
      ...json,
      params: json.queries,
    }
  } catch (e) {
    console.log(e)
    return ''
  }
}

export async function setClipboardText(text) {
  try {
    await writeText(text)
  } catch (e) {
    console.log(e)
  }
}

const curlStr = `
curl 'https://mp-activity.csdn.net/activity/report' \\
  -H 'Accept: application/json, text/javascript, */*; q=0.01' \\
  -H 'Accept-Language: zh-CN,zh;q=0.9' \\
  -H 'Cache-Control: no-cache' \\
  -H 'Connection: keep-alive' \\
  -H 'Content-Type: application/json; charset=UTF-8' \\
  -b 'UN=tiven_; fid=20_72173686980-1723171964606-667777; UserName=tiven_; UserInfo=0f04c32d71074d8faf6957682559ca1b; UserToken=0f04c32d71074d8faf6957682559ca1b; UserNick=%E5%A4%A9%E5%95%8F_; AU=9D3; BT=1746762659167; p_uid=U010000; tfstk=gwUxIiMZi_dxe8axZSSkjvMvty5ukgV4m-PBSADDf8e8_RLDoV0mffM8QE4gs5Z9WWkyoS40sIrzKWT0oiuMWquZ59Xh-wA4gVu6Sg1PCKRS6XQM5misu4_zLV2R-wV4GglXwEQ3SrX1pxks5misF0Mr_dgsGf1-FfhefKw_C_3SsfH6fjG6F3GtFAgs5RN5wfkSGVgsstLrQGMHWkRobLJ6zj865zhxVgVjFPzOsjixdSMRd9a-5mHQGYL1KWU1NYGLPOJmQzF7lX25rE3TNfeKluBWkRFbYRlQhapjMoNLt0UNdFhzV-ooMuC6VxNIhWg0SL1xQr2YWmzCKUkb2zztouXv-Ao_qroUoTTxRkPmolw51FMTVfsyCy4Kcqvnpfxfw_KwbmGycQ_-3SJQa9l-K_2XbhoJYbHhwi-wbmMjwvfkJh-Z2iC..; csdn_newcert_tiven_=1; c_dl_fref=https://blog.csdn.net/2401_83242712/article/details/145210905; c_dl_prid=1751009330146_995979; c_dl_rid=1751009362090_610482; c_dl_fpage=/download/yhpyhp123456789/4693612; c_dl_um=distribute.pc_relevant.none-task-download-2%7Edefault%7EBlogCommendFromBaidu%7ECtr-3-877204-blog-145210905.235%5Ev43%5Epc_blog_bottom_relevance_base7; uuid_tt_dd=10_10228374260-1752832793179-336819; c_segment=3; Hm_lvt_6bcd52f51e9b3dce32bec4a3997715ac=1751008805,1752832794; HMACCOUNT=2D2209B9D6785B22; dc_sid=df236ea632ac3ee52eac0f4bdb1fa16b; FCNEC=%5B%5B%22AKsRol9pVv015OhCC3w-me4orqTI_55cG8P4u3mWtPTS7dYpLHIp8RkR6gLMxtcZNoOzA2S3KGeBp9jPGF3klhzPxDXZfXc4K3nHJQZarWq9r70WqzRETs7zmLgylB2QkVMv_-alEpPfK_Dqb-ovPUoQdbt3DgLr5A%3D%3D%22%5D%5D; creative_btn_mp=3; __gads=ID=191f04350992d988:T=1745301304:RT=1753198370:S=ALNI_MYtJASWnDjtRdnpkFPJfDqeRIUz0A; __gpi=UID=0000109ac294254d:T=1745301304:RT=1753198370:S=ALNI_MZ2wcTqP5j5cU_UjsYTq6hT6TvXOQ; __eoi=ID=7d7d33efa38f67f8:T=1742800467:RT=1753198370:S=AA-Afja8-mge_bD4OODKvYIOsYli; dc_session_id=10_1753257257096.926935; c_pref=default; c_ref=default; c_first_ref=default; c_first_page=https%3A//blog.csdn.net/tiven_%3Ftype%3Dblog; _clck=4dphmh%7C2%7Cfxu%7C0%7C1547; creativeSetApiNew=%7B%22toolbarImg%22%3A%22https%3A//img-home.csdnimg.cn/images/20230921102607.png%22%2C%22publishSuccessImg%22%3A%22https%3A//img-home.csdnimg.cn/images/20240229024608.png%22%2C%22articleNum%22%3A147%2C%22type%22%3A2%2C%22oldUser%22%3Atrue%2C%22useSeven%22%3Afalse%2C%22oldFullVersion%22%3Atrue%2C%22userName%22%3A%22tiven_%22%7D; _clsk=3eq1f7%7C1753257258939%7C1%7C0%7Ce.clarity.ms%2Fcollect; c_dsid=11_1753257262675.671198; c_page_id=default; dc_tos=szudym; log_Id_pv=2; Hm_lpvt_6bcd52f51e9b3dce32bec4a3997715ac=1753257263; log_Id_view=12' \\
  -H 'Origin: https://blog.csdn.net' \\
  -H 'Pragma: no-cache' \\
  -H 'Referer: https://blog.csdn.net/tiven_?type=blog' \\
  -H 'Sec-Fetch-Dest: empty' \\
  -H 'Sec-Fetch-Mode: cors' \\
  -H 'Sec-Fetch-Site: same-site' \\
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36' \\
  -H 'sec-ch-ua: "Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"' \\
  -H 'sec-ch-ua-mobile: ?0' \\
  -H 'sec-ch-ua-platform: "macOS"' \\
  --data-raw '{"pageUrl":"https://blog.csdn.net/tiven_?type=blog","action":"pageView","platform":"pc"}'
`

// let json = toJsonObject(curlStr)
// console.log(json.data)
// let cl = fetchToCurl(json.url, {
//   ...json,
//   body: json.data,
// })
// console.log(cl)

export async function fetchToCurlHandler(config) {
  try {
    let { url, data, params, method } = config
    method = method.toLowerCase()
    let q = new URLSearchParams(params)
    let query = q.toString()
    if (method === 'get' && query) {
      url = `${url}?${query}`
    }
    let curlCmd = fetchToCurl(url, {
      ...config,
      body: method === 'get' ? undefined : data,
    })
    await writeText(curlCmd)
    message.success('复制成功')
  } catch (e) {
    console.log(e)
  }
}
