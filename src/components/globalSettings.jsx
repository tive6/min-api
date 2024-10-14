import {
  CloseOutlined,
  GlobalOutlined,
  PlusOutlined,
  RetweetOutlined,
} from '@ant-design/icons'
import { useReactive } from 'ahooks'
import {
  Affix,
  Button,
  Card,
  Divider,
  Drawer,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Switch,
  Tabs,
  Tag,
  Tooltip,
} from 'antd'
import localforage from 'localforage'
import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'

import {
  disabledAutoCapitalize,
  HeaderOpts,
  settingsMap,
} from '../common/config.js'
import {
  environmentKey,
  httpRegex,
} from '../common/consts.js'
import { getRandomKey } from '../common/helper.js'
import {
  getCurrentEnv,
  setCurrentEnv,
  setSettingsList,
  useStore,
} from '../store/index.js'

const defaultHeaderItem = [
  {
    k: null,
    v: null,
    desc: '',
    enable: false,
    key: getRandomKey(),
  },
]

const Com = (props, ref) => {
  useImperativeHandle(ref, () => ({
    show,
  }))

  const inputRef = useRef(null)
  const [form] = Form.useForm()
  const store = useStore()

  const d = useReactive({
    open: false,
    currentKey: 'environment',
    itemKey: environmentKey,
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

  const envRules = useMemo(() => {
    return d.currentKey === 'environment'
      ? [
          {
            required: true,
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (httpRegex.test(value)) {
                return Promise.resolve()
              }
              return Promise.reject(
                new Error(
                  'url 格式不正确，必须以 http(s):// 开头'
                )
              )
            },
          }),
        ]
      : []
  }, [d.currentKey])

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
      autoComplete="off"
      // layout="inline"
      initialValues={{
        rows: [...defaultHeaderItem],
      }}
    >
      <Form.List name="rows">
        {(fields, { add, remove }) => (
          <div className="flex flex-col flex-gap-16px">
            {fields.map((field) => (
              <Card
                size="small"
                hoverable
                title={`第 ${field.name + 1} 项`}
                key={field.key}
                extra={
                  <Popconfirm
                    title="删除提醒"
                    description={
                      <div className="w-200px">
                        确认删除该项吗？
                      </div>
                    }
                    onConfirm={remove.bind(
                      null,
                      field.name
                    )}
                    placement="left"
                  >
                    <Button
                      size="small"
                      type="link"
                      danger
                      icon={<CloseOutlined />}
                    ></Button>
                  </Popconfirm>
                }
              >
                <Form.Item
                  label={
                    d.currentKey === 'environment'
                      ? '名称'
                      : 'Key'
                  }
                  style={{ marginBottom: 10 }}
                  name={[field.name, 'k']}
                >
                  {d.currentKey === 'header' ? (
                    <Select
                      style={{
                        width: '100%',
                      }}
                      allowClear
                      placeholder="请选择"
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
                              {...disabledAutoCapitalize}
                              placeholder="请输入"
                              ref={inputRef}
                              value={d.headerKey}
                              onChange={onHeaderKeyChange}
                              onKeyDown={(e) =>
                                e.stopPropagation()
                              }
                            />
                            <Button
                              type="text"
                              icon={<PlusOutlined />}
                              onClick={addHeaderItem}
                            >
                              添加
                            </Button>
                          </Space.Compact>
                        </>
                      )}
                    />
                  ) : (
                    <Input
                      {...disabledAutoCapitalize}
                      allowClear
                      placeholder="请输入"
                    />
                  )}
                </Form.Item>
                <Form.Item
                  label={
                    d.currentKey === 'environment'
                      ? '域名'
                      : 'Value'
                  }
                  style={{ marginBottom: 10 }}
                  name={[field.name, 'v']}
                  rules={envRules}
                >
                  <Input.TextArea
                    {...disabledAutoCapitalize}
                    allowClear
                    autoSize={{ minRows: 1, maxRows: 5 }}
                    placeholder="请输入"
                  />
                </Form.Item>
                <Form.Item
                  label="desc"
                  style={{ marginBottom: 10 }}
                  name={[field.name, 'desc']}
                >
                  <Input.TextArea
                    {...disabledAutoCapitalize}
                    allowClear
                    autoSize={{ minRows: 1, maxRows: 5 }}
                    placeholder="请输入"
                  />
                </Form.Item>
                {d.currentKey !== 'environment' && (
                  <Form.Item
                    label="enable"
                    valuePropName="checked"
                    style={{ marginBottom: 10 }}
                    name={[field.name, 'enable']}
                  >
                    <Switch />
                  </Form.Item>
                )}
              </Card>
            ))}

            <Button
              icon={<PlusOutlined />}
              type="dashed"
              onClick={() =>
                add({
                  ...defaultHeaderItem[0],
                  key: getRandomKey(),
                })
              }
              block
            >
              添加
            </Button>
          </div>
        )}
      </Form.List>
    </Form>
  )

  const envOpts = useMemo(() => {
    return (
      store.environmentList?.reduce((acc, item, i) => {
        let k = item?.k?.trim()
        let v = item?.v?.trim()
        if (k && v) {
          acc.push({
            key: i,
            label: `${k} (${v})`,
            value: v,
          })
        }
        return acc
      }, []) || []
    )
  }, [store.environmentList])

  const tabsItems = [
    {
      label: `环境`,
      key: 'environment',
      disabled: false,
      children: (
        <div>
          <Affix offsetTop={78}>
            <div className="flex items-center bg-#fff mt--21px pt-10px pb-1px">
              <Tag
                size="large"
                icon={<GlobalOutlined />}
                color="success"
              >
                当前环境：
              </Tag>
              <Select
                value={store.currentEnv}
                allowClear
                placeholder="请选择环境（BaseUrl）"
                style={{ flex: 1 }}
                onChange={(val) => {
                  setCurrentEnv(val)
                }}
                options={envOpts}
              />
              <Tooltip
                placement="topRight"
                title="修改配置后，需要重新同步"
              >
                <Button
                  onClick={save}
                  type="link"
                  icon={<RetweetOutlined />}
                ></Button>
              </Tooltip>
            </div>
          </Affix>
          {formContent}
        </div>
      ),
    },
    {
      label: `Header`,
      key: 'header',
      children: formContent,
    },
    {
      label: `Cookie`,
      key: 'cookie',
      children: formContent,
    },
    {
      label: `Query`,
      key: 'query',
      children: formContent,
    },
    {
      label: `Body`,
      key: 'body',
      children: formContent,
    },
  ]

  async function init() {
    try {
      let list = await localforage.getItem(d.itemKey)
      d.headerList = list || []
      console.log(list)
      form.setFieldsValue({
        rows: list || [...defaultHeaderItem],
      })
    } catch (e) {
      console.log(e)
    }
  }

  async function save() {
    try {
      let values = await form.validateFields()
      console.log(values)
      let rows = values?.rows || []
      await localforage.setItem(d.itemKey, rows)
      await setSettingsList(d.currentKey, rows)
      if (d.currentKey === 'environment') {
        // 检测当前环境是否存在于环境列表中
        let currentEnv = getCurrentEnv()
        let env = rows.find(({ v }) => v === currentEnv)
        if (!env) {
          setCurrentEnv(null)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  async function onTabChange(key) {
    await save()
    d.currentKey = key
    let { localKey } = settingsMap[key]
    d.itemKey = localKey
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
      focusTriggerAfterClose={false}
      autoFocus={false}
      width="70%"
      className="global-settings"
      classNames={{
        body: '!p-0',
      }}
      onClose={onClose}
      open={d.open}
    >
      <Tabs
        size="small"
        tabPosition={'left'}
        className="h-100% overflow-y-auto"
        items={tabsItems}
        onChange={onTabChange}
      />
    </Drawer>
  )
}

export default forwardRef(Com)
