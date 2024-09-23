import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { useReactive } from 'ahooks'
import {
  Button,
  Form,
  Input,
  notification,
  Select,
  Space,
  Table,
  Tooltip,
  Upload,
} from 'antd'
import { isObject } from 'lodash-es'
import propTypes from 'prop-types'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
} from 'react'

import { useStore } from '../store/index.js'
import {
  columnsArr,
  contentTypeOptions,
  disabledAutoCapitalize,
} from './../common/config'
import {
  getRandomKey,
  HeadersFirstRowHandle,
} from './../common/helper'
const { Dragger } = Upload

const ParamsFormTab = forwardRef(
  ({ setCurrentFile, name, onDataChange }, ref) => {
    useImperativeHandle(ref, () => ({
      initHandle,
    }))
    const [form] = Form.useForm()

    const store = useStore()

    const state = useReactive({
      initData: {
        key: '',
        keys: '',
        values: '',
        description: '',
      },
      firstKey: getRandomKey(),
      lastKey: '',
    })

    const data = useReactive({
      list: [
        {
          ...state.initData,
          keys: name === 'HeadersTab' ? 'content-type' : '',
          values:
            name === 'HeadersTab' ? 'application/json' : '',
          key: state.firstKey,
        },
      ],
      scroll: {},
      selectedRowKeys: [state.firstKey],
    })

    const initHandle = (arr = []) => {
      console.log(arr)
      if (name === 'HeadersTab') {
        let row =
          store.requestType === 'upload'
            ? {
                keys: 'content-type',
                values: 'multipart/form-data',
              }
            : {
                keys: 'content-type',
                values: 'application/json',
              }
        arr = [row, ...arr]
      }
      let urlData = []
      let key = []
      if (name === 'HeadersTab') {
        arr = HeadersFirstRowHandle(arr)
      }
      arr.map((item) => {
        if (
          item.keys !== 'file' &&
          !isObject(item.values)
        ) {
          let k = getRandomKey()
          key.push(k)
          urlData.push({
            key: k,
            description: '',
            ...item,
          })
        }
      })
      state.firstKey = getRandomKey()
      data.selectedRowKeys = [...key, state.firstKey]
      let res = [
        ...urlData,
        { ...state.initData, key: state.firstKey },
      ]
      data.list = res
      console.log(res)
      getLastData(res)
    }

    const getLastData = (list) => {
      let arr = []
      list.forEach((item) => {
        if (
          item?.keys?.toString()?.trim() !== '' &&
          data.selectedRowKeys.includes(item.key)
        ) {
          let { keys, values } = item
          arr.push({ keys, values })
        }
      })
      onDataChange(arr)
    }

    const inputOnChange = (e, id, k) => {
      let val =
        e?.target?.value?.trim() ||
        (typeof e === 'string' ? e : '')
      let newData = [...data.list]
      let index = newData.findIndex(
        (item) => id === item.key
      )
      if (val === '' && newData[index][k] === '') return
      if (newData[index][k] === val) return
      newData[index][k] = val
      getLastData(newData)
    }

    const addTr = () => {
      let { keys, values } = data.list.at(-1)
      if (keys?.trim() === '') {
        notification.info({
          message: '提醒',
          description: '前一项【Key】不能为空！',
        })
        return false
      }
      state.lastKey = getRandomKey()
      data.list = [
        ...data.list,
        {
          ...state.initData,
          key: state.lastKey,
        },
      ]
      if (data.list.length > 6) {
        data.scroll = {
          y: 350,
          scrollToFirstRowOnChange: false,
        }
      }
      data.selectedRowKeys = [
        ...data.selectedRowKeys,
        state.lastKey,
      ]
    }

    const rowSelection = {
      selectedRowKeys: data.selectedRowKeys,
      columnWidth: 50,
      onChange(k) {
        data.selectedRowKeys = k
        getLastData(data.list)
      },
    }

    useEffect(() => {
      if (name === 'HeadersTab') {
        // console.log(store.requestType)
        let index = 0
        if (store.requestType === 'json') {
          index = 0
        }
        if (store.requestType === 'upload') {
          index = 2
        }
        data.list[0].keys = 'content-type'
        data.list[0].values =
          contentTypeOptions[index].value
      }
    }, [store.requestType])

    function delRow(key, index) {
      console.log(key, index)
      let arr = data.list.filter((item) => item.key !== key)
      data.list = arr
      getLastData(arr)
    }

    const columns = useMemo(
      () =>
        columnsArr.map(({ title, dataIndex, width }) => {
          return {
            title,
            dataIndex,
            width,
            render(_, data, index) {
              let { key } = data
              if (
                index === 0 &&
                name === 'HeadersTab' &&
                dataIndex === 'values'
              ) {
                return (
                  <Select
                    value={data[dataIndex]}
                    onChange={(e) => {
                      inputOnChange(e, key, dataIndex)
                    }}
                    placeholder="请选择"
                    style={{ width: '100%' }}
                  >
                    {contentTypeOptions.map(
                      ({ value, label }) => (
                        <Select.Option
                          key={value}
                          value={value}
                        >
                          {label}
                        </Select.Option>
                      )
                    )}
                  </Select>
                )
              }
              if (dataIndex === 'action') {
                return (
                  <Button
                    disabled={index === 0}
                    onClick={delRow.bind(null, key, index)}
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  />
                )
              }

              return (
                <Input
                  {...disabledAutoCapitalize}
                  onChange={(e) => {
                    inputOnChange(e, key, dataIndex)
                  }}
                  allowClear
                  defaultValue={data[dataIndex]}
                  placeholder={title}
                />
              )
            },
          }
        }),
      []
    )

    function handleUpload(file) {
      // console.log(file)
      return false
    }

    function onFileChange({ fileList }) {
      console.log('current fileList', fileList)
      if (fileList.length) {
        let file = fileList?.[0]?.originFileObj || null
        setCurrentFile(file)
      } else {
        setCurrentFile(null)
      }
    }

    const uploadProps = {
      multiple: false,
      maxCount: 1,
      className: 'dragger-box w-50%',
      beforeUpload: handleUpload,
      onChange: onFileChange,
    }

    return (
      <Form
        form={form}
        name={name}
        className="params-table"
        layout="inline"
        initialValues={{}}
        component={false}
      >
        <Table
          // virtual={true}
          bordered={false}
          size="small"
          // tableLayout="auto"
          rowSelection={rowSelection}
          dataSource={data.list}
          columns={columns}
          pagination={false}
          // scroll={data.scroll}
          scroll={{ x: '100%', y: 'calc(100vh - 283px)' }}
          footer={() => (
            <Space.Compact
              // size="small"
              block
            >
              <Tooltip title="添加一行">
                <Button
                  // block
                  // size="small"
                  onClick={addTr}
                  type="dashed"
                >
                  <PlusOutlined />
                </Button>
              </Tooltip>

              {store.requestType === 'upload' &&
                name === 'ParamsFormTab' && (
                  <Upload {...uploadProps}>
                    <Tooltip title="上传文件">
                      <Button>
                        <UploadOutlined />
                      </Button>
                    </Tooltip>
                  </Upload>
                  // <Dragger
                  //   {...uploadProps}
                  // >
                  //   <p className="ant-upload-drag-icon">
                  //     <InboxOutlined />
                  //   </p>
                  //   <p className="ant-upload-text">
                  //     拖动文件到此区域，或{' '}
                  //     <span className="ant-upload-span">
                  //       点击上传
                  //     </span>
                  //   </p>
                  //   {/*<p className="ant-upload-hint">暂不支持多文件同时上传</p>*/}
                  // </Dragger>
                )}
            </Space.Compact>
          )}
        />
      </Form>
    )
  }
)

ParamsFormTab.displayName = 'ParamsFormTab'
ParamsFormTab.propTypes = {
  name: propTypes.string,
  onDataChange: propTypes.func,
  setCurrentFile: propTypes.func,
}

export default ParamsFormTab
