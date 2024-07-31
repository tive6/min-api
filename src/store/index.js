import { cloneDeep } from 'lodash-es'
import { proxy } from 'valtio'
import { useProxy } from 'valtio/utils'

import { DefaultRequestType } from '../common/config.js'

export const defaultData = {
  requestType: DefaultRequestType,
  currentFile: null,
  resData: '',
  keywords: '',
  page: 1,
  historyList: [],
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
