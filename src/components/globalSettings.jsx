import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import { useReactive } from 'ahooks'
import { Button, Card, Divider, Drawer, Form, Input, Select, Space, Switch, Tabs } from 'antd'
import localforage from 'localforage'
import { forwardRef, useImperativeHandle, useRef } from 'react'

import { cookiesKey, HeaderOpts, headersKey } from '../common/config.js'
import { setCookieList, setHeaderList } from '../store/index.js'

const defaultHeaderItem = [
  {
    k: null,
    v: null,
    enable: false,
  },
]

const Com = (props, ref) => {
  useImperativeHandle(ref, () => ({
    show,
  }))

  const inputRef = useRef(null)
  const [form] = Form.useForm()

  const d = useReactive({
    open: false,
    currentKey: 'header',
    itemKey: headersKey,
    headerKey: '',
    headerItems: [...HeaderOpts],
    headerList: [],
  })

  function show() {
    d.open = true
    init()
  }

  function onClose() {
    save()
    d.open = false
  }

  function onHeaderKeyChange(e) {
    d.headerKey = e.target.value
  }

  function addHeaderItem(e) {
    e.preventDefault()
    let name = d.headerKey.trim()
    if (!name) return
    d.headerItems = [
      ...d.headerItems,
      {
        value: name,
        label: name,
      },
    ]
    d.headerKey = ''
    let t = setTimeout(() => {
      clearTimeout(t)
      inputRef.current?.focus()
    }, 0)
  }

  let formContent = (
    <Form
      labelCol={{
        style: {
          width: 60,
        },
      }}
      wrapperCol={{
        style: {
          paddingRight: 20,
        },
      }}
      form={form}
      style={{ width: '100%' }}
      autoComplete="off"
      // layout="inline"
      initialValues={{
        headers: [...defaultHeaderItem],
      }}
    >
      <Form.List name="headers">
        {(fields, { add, remove }) => (
          <div style={{ display: 'flex', rowGap: 16, flexDirection: 'column' }}>
            {fields.map((field) => (
              <Card
                size="small"
                hoverable
                title={`第 ${field.name + 1} 项`}
                key={field.key}
                extra={
                  <CloseOutlined
                    onClick={() => {
                      remove(field.name)
                    }}
                  />
                }
              >
                <Form.Item label="Key" style={{ marginBottom: 10 }} name={[field.name, 'k']}>
                  <Select
                    style={{
                      width: '100%',
                    }}
                    allowClear
                    placeholder="key"
                    options={d.headerItems}
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider
                          style={{
                            margin: '8px 0',
                          }}
                        />
                        <Space.Compact block>
                          <Input
                            placeholder="请输入"
                            ref={inputRef}
                            value={d.headerKey}
                            // style={{ width: '300px' }}
                            onChange={onHeaderKeyChange}
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                          <Button type="text" icon={<PlusOutlined />} onClick={addHeaderItem}>
                            添加
                          </Button>
                        </Space.Compact>
                      </>
                    )}
                  />
                  {/*<Input allowClear placeholder="key" />*/}
                </Form.Item>
                <Form.Item label="Value" style={{ marginBottom: 10 }} name={[field.name, 'v']}>
                  <Input.TextArea
                    allowClear
                    autoSize={{ minRows: 1, maxRows: 5 }}
                    placeholder="value"
                  />
                </Form.Item>
                <Form.Item
                  label="enable"
                  valuePropName="checked"
                  style={{ marginBottom: 10 }}
                  name={[field.name, 'enable']}
                >
                  <Switch />
                </Form.Item>
              </Card>
            ))}

            <Button icon={<PlusOutlined />} type="dashed" onClick={() => add()} block>
              添加
            </Button>
          </div>
        )}
      </Form.List>
    </Form>
  )

  const tabsItems = [
    {
      label: `Header`,
      key: 'header',
      disabled: false,
      children: formContent,
    },
    {
      label: `Cookie`,
      key: 'cookie',
      disabled: false,
      children: formContent,
    },
  ]

  async function init() {
    try {
      let list = await localforage.getItem(d.itemKey)
      d.headerList = list || []
      console.log(list)
      form.setFieldsValue({
        headers: list || [...defaultHeaderItem],
      })
    } catch (e) {
      console.log(e)
    }
  }

  async function save() {
    try {
      let values = await form.validateFields()
      console.log(values)
      let headers = values?.headers || []
      await localforage.setItem(d.itemKey, headers)
      if (d.currentKey === 'header') {
        setHeaderList(headers)
      } else {
        setCookieList(headers)
      }
    } catch (e) {
      console.log(e)
    }
  }

  async function onTabChange(key) {
    await save()
    d.currentKey = key
    if (key === 'header') {
      d.itemKey = headersKey
    } else {
      d.itemKey = cookiesKey
    }
    d.headerItems = [...HeaderOpts]
    await init()
  }

  return (
    <Drawer
      title={
        <div className="flex-flex justify-between items-center">
          全局设置
          {/*<Button onClick={save} type="primary">*/}
          {/*  保存*/}
          {/*</Button>*/}
        </div>
      }
      width="70%"
      onClose={onClose}
      open={d.open}
    >
      <Tabs
        defaultActiveKey="1"
        size="small"
        tabPosition={'left'}
        // style={{ height: 220 }}
        items={tabsItems}
        onChange={onTabChange}
      />
    </Drawer>
  )
}

export default forwardRef(Com)
