import {
  ClearOutlined,
  ExportOutlined,
  ImportOutlined,
  ReloadOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import { Tag } from 'antd'
import propTypes from 'prop-types'
import { useMemo } from 'react'

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
  const historyBaseColumns = [
    {
      title: 'Url',
      dataIndex: 'url',
      key: 'url',
      width: '200px',
      textWrap: 'word-break',
      // wordBreak: 'break-word',
      // ellipsis: true,
      // align: 'center',
      fixed: 'left',
      className: 'history-list-link',
      render: (text) => <CustomTd text={text} />,
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
