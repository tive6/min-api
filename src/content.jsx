import { DownOutlined } from '@ant-design/icons'
import { useDebounceEffect, useReactive } from 'ahooks'
import {
  App,
  Badge,
  Dropdown,
  Form,
  Input,
  Select,
  Space,
  Tabs,
} from 'antd'
import localforage from 'localforage'
import { cloneDeep } from 'lodash-es'
import { useEffect, useRef, useState } from 'react'

import { http, stream } from './api/ajax'
import {
  DefaultRequestType,
  disabledAutoCapitalize,
  layout,
  MethodOptions,
} from './common/config'
import {
  historyKey,
  httpRegex,
  testUrl,
} from './common/consts'
import {
  arrToObj,
  curlExport,
  downloadFile,
  fetchToCurlHandler,
  fileToUint8Array,
  formatFixedDate,
  getLocalHistoryList,
  getRandomKey,
  numbersArrayToText,
  objToArr,
  processStream,
} from './common/helper'
import DataTab from './components/dataTab'
import HeadMenu from './components/headMenu'
import HistorySearch from './components/historySearch'
import HistoryTab from './components/historyTab'
import ParamsFormTab from './components/paramsFormTab'
import ParamsJsonTab from './components/paramsJsonTab'
import SubTabBarExtra from './components/subTabBarExtra'
import { setHistoryList, useStore } from './store/index'

const Content = () => {
  const { notification } = App.useApp()

  const paramsRef = useRef()
  const headersRef = useRef()
  const paramsJsonRef = useRef()
  const historySearchRef = useRef()

  const currentFile = useRef(null)
  const [headForm] = Form.useForm()
  const method = Form.useWatch('method', headForm)

  const store = useStore()

  const count = useReactive({
    params: 0,
    headers: 0,
    body: 0,
  })

  const that = useReactive({
    paramsTabKey: '11',
    resJsonData: {},
    reqJson: {},
    isUpload: false,
    resData: '',
    fileKey: '',
    loading: false,
  })

  const [params, setParams] = useState([])
  const [headers, setHeaders] = useState([])
  const [reqParams, setReqParams] = useState({})
  const [queryParams, setQueryParams] = useState({})
  const [reqHeaders, setReqHeaders] = useState({})
  const [resAllJson, setAllResJson] = useState({})
  const [tabKey, setTabKey] = useState('6')
  const [status, setStatus] = useState(0)

  useDebounceEffect(
    () => {
      if (!params.length) {
        count.params = 0
        return
      }
      // console.log(params)
      const obj = arrToObj(params)
      setReqParams(obj)
      count.params = params.length
    },
    [params],
    {
      wait: 500,
    }
  )

  useDebounceEffect(
    () => {
      try {
        if (typeof that.reqJson === 'string') {
          count.params = 1
        } else {
          count.params = Reflect.ownKeys(
            that.reqJson
          )?.length
        }
      } catch (err) {
        count.params = 0
      }
    },
    [that.reqJson],
    {
      wait: 500,
    }
  )

  useDebounceEffect(
    () => {
      if (!headers.length) {
        count.headers = 0
        setReqHeaders({})
        return
      }
      // console.log(headers)
      const obj = arrToObj(headers)
      setReqHeaders(obj)
      count.headers = headers.length
    },
    [headers],
    {
      wait: 500,
    }
  )

  useEffect(() => {
    if (status === 0) return
    send()
  }, [status])

  function setReqJson(val) {
    that.reqJson = val
  }

  function paramsTabChange(key) {
    that.paramsTabKey = key
    if (key === '11') {
      count.params = params?.length || 0
    } else {
      count.params =
        Reflect.ownKeys(that.reqJson)?.length || 0
    }
  }

  const inputOnEnter = () => {
    send()
  }

  const setHistoryData = async (opts) => {
    try {
      const list = await getLocalHistoryList()
      list.push(opts)
      await localforage.setItem(historyKey, list)
      if (historySearchRef?.current) {
        historySearchRef?.current?.search()
      } else {
        setHistoryList(list)
      }
    } catch (e) {
      console.log(e)
    }
  }

  const initFormData = (data) => {
    headForm.setFieldsValue(data)
    console.log('initFormData', headForm.getFieldsValue())
  }

  const httpHandle = async (p) => {
    const date = formatFixedDate(
      new Date(),
      'yyyy-MM-dd HH:mm:ss'
    )
    const opts = {
      ...p,
      createTime: date,
      key: getRandomKey(),
    }
    let state = 0
    try {
      that.loading = true
      if (store.requestType === 'stream') {
        state = await fetchOfStream(p)
        return
      }
      const res = await http(p)
      if (!that.loading) return
      console.log('http res', res)
      let {
        url,
        config,
        data,
        headers,
        status,
        statusText,
      } = res
      console.log('requestType', store.requestType)
      console.log('http res data', res.data)
      if (store.requestType === 'download') {
        if (status !== 200) {
          try {
            data = numbersArrayToText(data)
          } catch (err) {
            console.info(
              'response data is not numbersArray'
            )
          }
        }
      } else if (store.requestType === 'jsonp') {
        try {
          let params = p?.params || {}
          let cbName =
            params?.cb || params?.callback || 'callback'

          window[cbName] = function (result) {
            data = result
          }
          let fn = new Function(`return ${data}`)
          fn()
        } catch (e) {
          console.log(e)
          console.info('response data is not jsonp')
        }
      } else {
        try {
          // 尝试解析 json
          console.log(data)
          data = JSON.parse(data)
        } catch (err) {
          console.info('response data is not json')
        }
      }
      that.resData = data
      setTabKey('5')
      state = 1
      if (
        status === 200 &&
        data &&
        store.requestType === 'download'
      ) {
        console.log('downloadFile start')
        const err = await downloadFile({
          url,
          data,
          headers,
        })
        console.log('downloadFile err', err)
        if (err) {
          data = err
          that.resData = err
        }
      }
      setAllResJson({
        status,
        statusText,
        headers,
        config,
        data,
        // request,
      })
    } catch (err) {
      console.log('http options', p)
      console.log('http err', err)
      notification.error({
        message: '提醒',
        description: '请求失败！',
      })
      setTabKey('4')
      setAllResJson(err)
    } finally {
      console.log('http finally')
      if (store.requestType === 'upload') {
        Reflect.deleteProperty(opts.data, that.fileKey)
      }
      setHistoryData({
        ...cloneDeep(opts),
        status: state,
      })
      setQueryParams({})
      that.loading = false
    }
  }

  async function fetchOfStream(p) {
    try {
      const res = await stream(p)
      if (!that.loading) return
      const {
        body,
        bodyUsed,
        headers,
        ok,
        redirected,
        status,
        statusText,
        type,
        url,
      } = res
      const reader = body.getReader()
      that.resData = []
      setTabKey('5')
      await processStream(reader, (str) => {
        console.log(
          `stream data ${that.resData.length}`,
          str
        )
        that.resData = [...that.resData, str]
      })
      setAllResJson({
        body: [],
        bodyUsed,
        headers: headers,
        ok,
        redirected,
        status,
        statusText,
        type,
        url,
      })
      console.log('fetchOfStream res', res)
      if (status !== 200) {
        notification.error({
          message: '提醒',
          description: (
            <div className="break-all whitespace-pre-wrap">
              请求失败！
              <br />
              status: {status}
              <br />
              statusText: {statusText}
            </div>
          ),
          // duration: 0,
        })
      }
      return status === 200 ? 1 : 0
    } catch (e) {
      console.log('fetchOfStream err', e)
      notification.error({
        message: '提醒',
        description: (
          <div className="break-all whitespace-pre-wrap">
            请求失败！
            <br />
            {e}
          </div>
        ),
        // duration: 0,
      })
      return 0
    }
  }

  const send = async (type) => {
    // loading 是否正在请求
    if (that.loading) return
    const { url, method } = headForm.getFieldsValue()
    if (!store.currentEnv) {
      console.log('currentEnv', store.currentEnv)
      if (!httpRegex.test(url.trim())) {
        notification.warning({
          message: '提醒',
          description: '请配置环境变量，或输入合法 url ！',
        })
        return false
      }
    }
    console.log(method, url)
    const queryObj = {}
    let obj = {}
    if (that.paramsTabKey === '11') {
      if (JSON.stringify(reqParams) !== '{}') {
        obj = reqParams
      }
    } else {
      if (JSON.stringify(that.reqJson) !== '{}') {
        obj = that.reqJson
      }
    }
    obj = Object.assign({}, queryParams, queryObj, obj)
    const p = {
      url,
      method,
      headers: reqHeaders,
    }
    if (method === 'GET') {
      p.params = obj
    } else {
      const params = Object.assign(
        {},
        queryParams,
        queryObj
      )
      p.data = Object.assign({}, reqParams, that.reqJson)
      p.params = params
      console.log('params', params)
      console.log('data', p.data)
      if (JSON.stringify(params) !== '{}') {
        let str = ''
        Object.keys(params).map((k) => {
          str += `&${k}=${params[k]}`
        })
        console.log(`${url}?${str.slice(1)}`)
        const fd = {
          method,
          url: `${url}?${str.slice(1)}`,
        }
        initFormData(fd)
      }

      if (store.requestType === 'upload') {
        console.log('currentFile', currentFile.current)
        if (!currentFile.current) {
          notification.warning({
            message: '提醒',
            description: '请选择要上传的文件 ！',
          })
          return false
        }
        const { name, type } = currentFile.current
        const uint8Array = await fileToUint8Array(
          currentFile.current
        )
        // let arrayBuffer = await currentFile.current.arrayBuffer()
        const fileKey = p.data.file || 'file'
        that.fileKey = fileKey
        Reflect.deleteProperty(p.data, 'file')
        p.data[fileKey] = {
          file: uint8Array, // or filepath
          // file: `/Users/xxx/Downloads/${currentFile.current.name}`,
          mime: type,
          fileName: name,
        }
        console.log('upload data', p.data)
        // let formData = new FormData()
        // formData.append(
        //   'file',
        //   currentFile.current,
        //   `/Users/xxx/Downloads/${currentFile.current.name}`
        // )
        // p.data = formData
      }
    }
    if (type === 'copyToCurl') {
      fetchToCurlHandler(p)
      return
    }
    await httpHandle({
      ...p,
      requestType: store.requestType,
    })
  }

  function setCurrentFile(file) {
    currentFile.current = file
  }

  const prefixSelector = (
    <Form.Item name="method" noStyle>
      <Select
        style={{ width: 120 }}
        options={MethodOptions}
      />
    </Form.Item>
  )

  const tabsItems = [
    {
      key: '1',
      label: (
        <div>
          参数
          <Badge
            count={count.params}
            style={{ backgroundColor: '#249C47' }}
          />
        </div>
      ),
      children: (
        <Tabs
          size="small"
          tabPosition={'top'}
          type="card"
          activeKey={that.paramsTabKey}
          onChange={paramsTabChange}
          tabBarExtraContent={{
            right: (
              <div className="flex justify-between items-center w-[calc(100vw-500px)]">
                <div />
                <SubTabBarExtra />
              </div>
            ),
          }}
          items={[
            {
              key: '11',
              label: 'Form 格式',
              children: (
                <>
                  <ParamsFormTab
                    name="ParamsFormTab"
                    ref={paramsRef}
                    setCurrentFile={setCurrentFile}
                    onDataChange={setParams}
                  />
                </>
              ),
            },
            {
              key: '12',
              label: 'Json 格式',
              children: (
                <ParamsJsonTab
                  ref={paramsJsonRef}
                  resJson={that.resJsonData}
                  onDataChange={setReqJson}
                />
              ),
            },
            // {
            //   key: '13',
            //   label: 'Raw 格式',
            //   children: (
            //     <RawTab
            //     // ref={paramsJsonRef}
            //     // resJson={that.resJsonData}
            //     // onDataChange={setReqJson}
            //     />
            //   ),
            // },
          ]}
        />
      ),
    },
    {
      key: '2',
      label: (
        <div>
          请求头
          <Badge
            count={count.headers}
            style={{ backgroundColor: '#249C47' }}
          />
        </div>
      ),
      forceRender: true, // 被隐藏时是否渲染 DOM 结构
      children: (
        <ParamsFormTab
          name="HeadersTab"
          ref={headersRef}
          onDataChange={setHeaders}
        />
      ),
    },
    {
      key: '4',
      label: '响应',
      children: (
        <DataTab
          resJson={resAllJson}
          modes={['tree', 'code']}
        />
      ),
    },
    {
      key: '5',
      label: '数据',
      children: (
        <DataTab
          resJson={that.resData}
          modes={['code', 'tree']}
        />
      ),
    },
    {
      key: '6',
      label: '历史',
      children: (
        <HistoryTab onQueryChange={onQueryChange} />
      ),
    },
  ]

  function onQueryChange(record, type) {
    const {
      url,
      method,
      requestType,
      params,
      data,
      headers,
    } = record
    setQueryParams(params)
    setReqHeaders(headers)
    store.requestType = requestType || DefaultRequestType
    const formData = {
      url,
      method,
    }
    initFormData(formData)
    if (type !== 'curlToFetch') {
      setStatus(status + 1)
    }
    let res = null
    if (method === 'GET') {
      res = params
      setReqParams({})
    } else {
      res = data
    }
    setTabKey('1')
    if (requestType === 'upload') {
      that.paramsTabKey = '11'
    } else {
      that.paramsTabKey = '12'
      setReqJson(res)
    }

    const timer = setTimeout(() => {
      if (requestType === 'upload') {
        paramsRef?.current?.initHandle(objToArr(res))
      } else {
        paramsJsonRef?.current?.initHandle(res)
      }
      clearTimeout(timer)
    }, 50)

    // paramsRef.current.initHandle(objToArr(res))
    headersRef?.current?.initHandle(objToArr(headers))
  }

  function onTabChange(key) {
    setTabKey(key)
    if (key === '6') {
      const t = setTimeout(() => {
        historySearchRef?.current?.search()
        clearTimeout(t)
      }, 0)
    }
  }

  function formatQueryParams(url) {
    const [urlPath, search] = url.split('?')
    console.log(urlPath, search)
    // console.log(new URL(url))
    // let { origin, pathname, search } = new URL(url)
    const q = new URLSearchParams(search)
    const o = {}
    for (const [k, v] of q.entries()) {
      // console.log(`${k}, ${v}`)
      o[k] = v
    }
    console.log(o)
    initFormData({
      url: urlPath,
    })
    setTabKey('1')
    that.paramsTabKey = '12'
    setReqJson(o)
    const timer = setTimeout(() => {
      paramsJsonRef?.current?.initHandle(o)
      clearTimeout(timer)
    }, 200)
  }

  function menuClick({ key }) {
    console.log(key)
    const { url } = headForm.getFieldsValue()
    if (key === 'queryFormat' && url.includes('?')) {
      formatQueryParams(url)
    }
    if (key === 'jsonForm') {
      setTabKey('1')
      if (that.paramsTabKey === '11') {
        // 切换到 Json 格式
        that.paramsTabKey = '12'
      } else {
        // 切换到 Form 格式
        that.paramsTabKey = '11'
        console.log(that.reqJson)
        paramsRef?.current?.initHandle(
          objToArr(that.reqJson)
        )
      }
    }
    if (key === 'abort') {
      that.loading = false
    }
    if (key === 'curlToFetch') {
      curlExportHandler()
    }
    if (key === 'fetchToCurl') {
      send('copyToCurl')
    }
  }

  async function curlExportHandler() {
    try {
      let p = await curlExport()
      console.log('curlExport', p)
      onQueryChange(p, 'curlToFetch')
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div className="app-content">
      <div className="body-top">
        <Form
          form={headForm}
          {...layout}
          initialValues={{ url: testUrl, method: 'GET' }}
          name="basic"
          layout="inline"
          size="large"
        >
          <Space.Compact>
            <Form.Item noStyle name="url">
              <Input
                {...disabledAutoCapitalize}
                allowClear
                addonBefore={prefixSelector}
                className="w-[calc(100vw-290px)]"
                // onBlur={inputOnBlur}
                onPressEnter={inputOnEnter}
                placeholder={`请输入完整url，"${testUrl}"， 或接口路径，"/api/xxx"`}
              />
            </Form.Item>
            <Dropdown.Button
              // type="primary"
              icon={<DownOutlined />}
              loading={that.loading}
              menu={{
                items: [
                  {
                    label: 'Query参数格式化',
                    key: 'queryFormat',
                    disabled: method !== 'GET',
                  },
                  {
                    label: '中止请求',
                    key: 'abort',
                  },
                  // {
                  //   label: 'Json ⇋ Form',
                  //   key: 'jsonForm',
                  // },
                  {
                    label: '从粘贴板curl命令导入',
                    key: 'curlToFetch',
                  },
                  {
                    label: '复制为curl命令',
                    key: 'fetchToCurl',
                  },
                ],
                onClick: menuClick,
              }}
              style={{
                width: 'auto',
              }}
              onClick={send}
            >
              发送
            </Dropdown.Button>
          </Space.Compact>
        </Form>
        <div className="head-menu">
          <HeadMenu />
        </div>
      </div>

      <Tabs
        tabBarExtraContent={{
          right:
            tabKey === '6' ? (
              <HistorySearch ref={historySearchRef} />
            ) : null,
        }}
        onTabClick={onTabChange}
        defaultActiveKey={tabKey}
        activeKey={tabKey}
        items={tabsItems}
        size="large"
        style={{ flex: 1, overflowY: 'hidden' }}
      />
    </div>
  )
}

export default Content
