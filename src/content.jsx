import { SendOutlined } from '@ant-design/icons'
import { useDebounceEffect, useReactive } from 'ahooks'
import {
  Badge,
  Button,
  Form,
  Input,
  notification,
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
} from './common/consts.js'
import {
  arrToObj,
  downloadFile,
  fileToUint8Array,
  formatFixedDate,
  getLocalHistoryList,
  numbersArrayToText,
  objToArr,
  processStream,
} from './common/helper'
import { getRandomKey } from './common/helper'
import DataTab from './components/dataTab'
import HeadMenu from './components/headMenu.jsx'
import HistorySearch from './components/historySearch'
import HistoryTab from './components/historyTab'
import ParamsFormTab from './components/paramsFormTab'
import ParamsJsonTab from './components/paramsJsonTab'
import SubTabBarExtra from './components/subTabBarExtra'
import { setHistoryList, useStore } from './store/index.js'
const { Option } = Select

const Content = () => {
  const paramsRef = useRef()
  const headersRef = useRef()
  const paramsJsonRef = useRef()
  const historySearchRef = useRef()

  const currentFile = useRef(null)
  const [headForm] = Form.useForm()
  const store = useStore()

  const count = useReactive({
    params: 0,
    headers: 0,
    body: 0,
  })

  const that = useReactive({
    paramsTabKey: '11',
    resJsonData: {},
    isUpload: false,
    resData: '',
    fileKey: '',
  })

  const [params, setParams] = useState([])
  const [headers, setHeaders] = useState([])
  const [url, setUrl] = useState(testUrl)
  const [reqParams, setReqParams] = useState({})
  const [reqJson, setReqJson] = useState({})
  const [queryParams, setQueryParams] = useState({})
  const [reqHeaders, setReqHeaders] = useState({})
  const [method, setMethod] = useState('GET')
  const [resAllJson, setAllResJson] = useState({})
  const [tabKey, setTabKey] = useState('6')
  const [status, setStatus] = useState(0)
  const [loading, setLoading] = useState(false)

  // useEffect(() => {
  //   if (method === 'GET') {
  //     let { queryArr } = queryToObj(url)
  //     // console.log(queryArr)
  //     let obj = arrToObj(queryArr)
  //     setQueryParams(obj)
  //   }
  // }, [url])

  useDebounceEffect(
    () => {
      if (!params.length) {
        count.params = 0
        return
      }
      // console.log(params)
      let obj = arrToObj(params)
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
        count.params = Reflect.ownKeys(reqJson)?.length
      } catch (err) {
        count.params = 0
      }
    },
    [reqJson],
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
      let obj = arrToObj(headers)
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

  function paramsTabChange(key) {
    that.paramsTabKey = key
    if (key === '11') {
      count.params = params?.length || 0
    } else {
      count.params = Reflect.ownKeys(reqJson)?.length || 0
    }
  }

  const inputOnBlur = () => {
    let { url } = headForm.getFieldsValue()
    // console.log(url)
    setUrl(url)
  }

  const inputOnEnter = () => {
    inputOnBlur()
    send()
  }

  const setHistoryData = async (opts) => {
    try {
      let list = await getLocalHistoryList()
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
    let date = formatFixedDate(
      new Date(),
      'yyyy-MM-dd HH:mm:ss'
    )
    let opts = {
      ...p,
      createTime: date,
      key: getRandomKey(),
    }
    let state = 0
    try {
      setLoading(true)
      if (store.requestType === 'stream') {
        state = await fetchOfStream(p)
        return
      }
      let res = await http(p)
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
      if (store.requestType !== 'download') {
        try {
          // 尝试解析 json
          data = JSON.parse(data)
        } catch (err) {
          console.info('response data is not json')
        }
      } else {
        if (status !== 200) {
          try {
            data = numbersArrayToText(data)
          } catch (err) {
            console.info(
              'response data is not numbersArray'
            )
          }
        }
      }
      that.resData = data
      setTabKey('5')
      state = 1
      // console.log(headers)
      if (
        status === 200 &&
        data &&
        store.requestType === 'download'
      ) {
        console.log('downloadFile start')
        let err = await downloadFile({ url, data, headers })
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
        description: `请求失败！`,
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
      setLoading(false)
    }
  }

  async function fetchOfStream(p) {
    try {
      let res = await stream(p)
      let {
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
        that.resData = [...that.resData, str]
      })
      // console.log(headers.entries())
      // res?.headers?.entries()?.forEach?.((item) => {
      //   console.log(item)
      // })
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
      return status === 200 ? 1 : 0
    } catch (e) {
      console.log('fetchOfStream err', e)
      notification.error({
        message: '提醒',
        description: (
          <div className="break-all whitespace-pre-wrap">
            请求失败！{e}
          </div>
        ),
        // duration: 0,
      })
      return 0
    }
  }

  const send = async () => {
    // loading 是否正在请求
    if (loading) return
    let { url, method } = headForm.getFieldsValue()
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
    setUrl(url)
    let queryObj = {}
    // if (url.includes('?')) {
    //   queryObj = queryToObj(url).queryObj
    //   url = url.match(/(\S*)\?/)[1]
    // }
    let obj = {}
    if (that.paramsTabKey === '11') {
      if (JSON.stringify(reqParams) !== '{}') {
        obj = reqParams
      }
    } else {
      if (JSON.stringify(reqJson) !== '{}') {
        obj = reqJson
      }
    }
    obj = Object.assign({}, queryParams, queryObj, obj)
    let p = {
      url,
      method,
      headers: reqHeaders,
    }
    if (method === 'GET') {
      p.params = obj
    } else {
      let params = Object.assign({}, queryParams, queryObj)
      // console.log(reqParams)
      // console.log(reqJson)
      p.data = Object.assign({}, reqParams, reqJson)
      p.params = params
      console.log('params', params)
      console.log('data', p.data)
      if (JSON.stringify(params) !== '{}') {
        let str = ''
        Object.keys(params).map((k) => {
          str += `&${k}=${params[k]}`
        })
        console.log(`${url}?${str.slice(1)}`)
        let fd = {
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
        let { name, type } = currentFile.current
        let uint8Array = await fileToUint8Array(
          currentFile.current
        )
        // let arrayBuffer = await currentFile.current.arrayBuffer()
        let fileKey = p.data.file || 'file'
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
      <Select onChange={setMethod} style={{ width: 120 }}>
        {MethodOptions.map(({ value, label }) => (
          <Option key={value} value={value}>
            {label}
          </Option>
        ))}
      </Select>
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
            right: <SubTabBarExtra />,
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
          ]}
        ></Tabs>
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

  function onQueryChange(record) {
    let {
      url,
      method,
      requestType,
      params,
      data,
      headers,
    } = record
    setUrl(url)
    setMethod(method)
    setQueryParams(params)
    setReqHeaders(headers)
    store.requestType = requestType || DefaultRequestType
    let formData = {
      url,
      method,
    }
    initFormData(formData)
    setStatus(status + 1)
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

    let timer = setTimeout(() => {
      if (requestType === 'upload') {
        paramsRef?.current?.initHandle(objToArr(res))
      } else {
        paramsJsonRef?.current?.initHandle(res)
      }
      clearTimeout(timer)
    }, 200)

    // paramsRef.current.initHandle(objToArr(res))
    headersRef?.current?.initHandle(objToArr(headers))
  }

  function onTabChange(key) {
    setTabKey(key)
    if (key === '6') {
      let t = setTimeout(() => {
        historySearchRef?.current?.search()
        clearTimeout(t)
      }, 0)
    }
  }

  return (
    <div className="app-content">
      <div className="body-top">
        <Form
          form={headForm}
          {...layout}
          initialValues={{ url, method }}
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
                className="w-[calc(100vw-250px)]"
                onBlur={inputOnBlur}
                onPressEnter={inputOnEnter}
                placeholder={`请输入完整url，"${testUrl}"， 或接口路径，"/api/xxx"`}
              />
            </Form.Item>
            <Button
              loading={loading}
              onClick={send}
              type="primary"
              icon={<SendOutlined />}
            >
              发送
            </Button>
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
