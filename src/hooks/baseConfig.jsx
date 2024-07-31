import { Tag } from 'antd'
import propTypes from 'prop-types'

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
      sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
      align: 'left',
      width: 120,
    },
  ]

  return {
    historyBaseColumns,
  }
}
