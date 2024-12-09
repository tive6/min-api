import {
  ClearOutlined,
  ExportOutlined,
  ImportOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import { Input, Tag, Tooltip } from 'antd'
import localforage from 'localforage'
import propTypes from 'prop-types'
import { useMemo } from 'react'

import { disabledAutoCapitalize } from '../common/config.js'
import { historyKey } from '../common/consts.js'
import { getLocalHistoryList } from '../common/helper.js'
import { setHistoryList } from '../store/index.js'

const menuItems = [
  {
    label: '刷新',
    key: 'refresh',
    icon: <SyncOutlined />,
  },
  {
    label: '重启',
    key: 'reload',
    icon: <ReloadOutlined />,
  },
  {
    label: '导入配置和历史',
    key: 'import',
    icon: <ImportOutlined />,
  },
  {
    label: '导出配置和历史',
    key: 'export',
    icon: <ExportOutlined />,
    // disabled: true,
  },
  {
    label: '清除历史记录',
    key: 'cleanHistory',
    icon: <ClearOutlined />,
    danger: true,
    // disabled: true,
  },
]

function formatText(text) {
  if (!text) return ''
  if (typeof text === 'string') {
    if (text.includes('{')) {
      return JSON.stringify(JSON.parse(text), null, 2)
    } else {
      return text
    }
  } else {
    return JSON.stringify(text, null, 2)
  }
}

const CustomTd = ({ text }) => {
  return (
    <div
      className="history-list-data"
      contentEditable="true"
      dangerouslySetInnerHTML={{ __html: formatText(text) }}
    ></div>
  )
}

CustomTd.propTypes = {
  text: propTypes.any,
}

export default function useBaseConfig() {
  async function editByKey(key, e) {
    console.log('editByKey', key, e)
    try {
      const localHistoryList = await getLocalHistoryList()
      let list = localHistoryList.map((item) => {
        if (item.key === key) {
          item.remark = e.target.value
        }
        return item
      })
      await localforage.setItem(historyKey, list)
      setHistoryList(list)
      e.target.blur()
    } catch (e) {
      console.log(e)
    }
  }

  const historyBaseColumns = [
    {
      title: 'Url',
      dataIndex: 'url',
      key: 'url',
      width: 200,
      textWrap: 'word-break',
      // wordBreak: 'break-word',
      // ellipsis: true,
      // align: 'center',
      fixed: 'left',
      className: 'history-list-link',
      render: (text, record) => (
        <div className="flex flex-col h-100% url-wrap">
          <CustomTd text={text} />
          <Input
            defaultValue={record.remark}
            className="mt-10px"
            placeholder="备注"
            variant="filled"
            {...disabledAutoCapitalize}
            onPressEnter={(e) => {
              editByKey(record.key, e)
            }}
            suffix={
              <Tooltip title="编辑后，回车保存">
                <InfoCircleOutlined
                  style={{
                    color: 'rgba(0,0,0,.45)',
                  }}
                />
              </Tooltip>
            }
          />
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 90,
      render: (status) => {
        if (status) {
          return <Tag color="#52c41a">成功</Tag>
        } else {
          return <Tag color="#f5222d">失败</Tag>
        }
      },
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      align: 'center',
      width: 90,
      render: (text) => {
        if (text.toLocaleLowerCase() === 'get') {
          return <Tag color="green">{text}</Tag>
        } else {
          return <Tag color="purple">{text}</Tag>
        }
      },
    },
    {
      title: 'Headers',
      dataIndex: 'headers',
      key: 'headers',
      align: 'left',
      width: 200,
      render: (text) => <CustomTd text={text} />,
    },
    {
      title: 'Query',
      dataIndex: 'params',
      key: 'params',
      align: 'left',
      width: 300,
      render: (text) => <CustomTd text={text} />,
    },
    {
      title: 'Body',
      dataIndex: 'data',
      key: 'data',
      align: 'left',
      width: 300,
      render: (text) => <CustomTd text={text} />,
    },
    {
      title: 'CreateTime',
      dataIndex: 'createTime',
      key: 'createTime',
      defaultSortOrder: 'descend',
      sorter: (a, b) =>
        new Date(a.createTime) - new Date(b.createTime),
      align: 'left',
      width: 120,
    },
  ]

  const handleMenuItems = useMemo(() => menuItems, [])

  return {
    historyBaseColumns,
    handleMenuItems,
  }
}
