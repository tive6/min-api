import localforage from 'localforage'
import { cloneDeep } from 'lodash-es'
import { proxy } from 'valtio'
import { useProxy } from 'valtio/utils'

import { cookiesKey, DefaultRequestType, headersKey } from '../common/config.js'

export const defaultData = {
  requestType: DefaultRequestType,
  currentFile: null,
  resData: '',
  keywords: '',
  page: 1,
  historyList: [],
  headerList: [],
  cookieList: [],
}

const state = cloneDeep(defaultData)
const store = proxy(state)

export const useStore = () => {
  return useProxy(store)
}

export function resetData() {
  Object.entries(defaultData).forEach(([key, value]) => {
    store[key] = cloneDeep(value)
  })
}

export function setHistoryList(list) {
  store.historyList = list
}

export async function initHeaderList(type = 'header') {
  let key = type === 'header' ? headersKey : cookiesKey
  try {
    let list = await localforage.getItem(key)
    let headers = list || []
    if (type === 'header') {
      setHeaderList(headers)
    } else {
      setCookieList(headers)
    }
    return headers
  } catch (e) {
    console.log(e)
    return []
  }
}

export function setHeaderList(list) {
  store.headerList = list
}

export function getHeaderList() {
  return store.headerList
}

export function setCookieList(list) {
  store.cookieList = list
}

export function getCookieList() {
  return store.cookieList
}
