import localforage from 'localforage'
import { cloneDeep } from 'lodash-es'
import { proxy } from 'valtio'
import { useProxy } from 'valtio/utils'

import { DefaultRequestType, settingsMap } from '../common/config.js'
import { currentEnvKey } from '../common/consts.js'

export const defaultData = {
  requestType: DefaultRequestType,
  currentFile: null,
  resData: '',
  keywords: '',
  page: 1,
  historyList: [],
  environmentList: [],
  headerList: [],
  cookieList: [],
  queryList: [],
  bodyList: [],
  currentEnv: null,
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

export async function setSettingsList(type, list) {
  try {
    let { localKey, storeListKey } = settingsMap[type]
    if (!list) {
      list = await localforage.getItem(localKey)
    }
    let rows = list || []
    store[storeListKey] = rows
    return rows
  } catch (e) {
    console.log(e)
    return []
  }
}

export function getSettingsList(type) {
  try {
    let { storeListKey } = settingsMap[type]
    return store[storeListKey] || []
  } catch (e) {
    console.log(e)
    return []
  }
}

export async function setCurrentEnv(env) {
  try {
    store.currentEnv = env
    await localforage.setItem(currentEnvKey, env)
  } catch (e) {
    console.log(e)
  }
}

export function getCurrentEnv() {
  return store.currentEnv || null
}

export async function initGlobalSettings() {
  try {
    Object.keys(settingsMap).forEach((type) => {
      setSettingsList(type)
    })
    let env = await localforage.getItem(currentEnvKey)
    store.currentEnv = env || null
  } catch (e) {
    console.log(e)
  }
}
