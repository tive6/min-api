import localforage from 'localforage'
import { cloneDeep } from 'lodash-es'
import { proxy } from 'valtio'
import { useProxy } from 'valtio/utils'

import { DefaultRequestType, headersKey } from '../common/config.js'

export const defaultData = {
  requestType: DefaultRequestType,
  currentFile: null,
  resData: '',
  keywords: '',
  page: 1,
  historyList: [],
  headerList: [],
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

export async function initHeaderList() {
  try {
    let list = await localforage.getItem(headersKey)
    let headers = list || []
    setHeaderList(headers)
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
