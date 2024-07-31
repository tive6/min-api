import { Space, Table } from 'antd'
import propTypes from 'prop-types'
import { useEffect } from 'react'

import { getLocalHistoryList } from '../common/helper.js'
import { setHistoryList, useStore } from '../store/index.js'
import { historyKey } from './../common/config'
import useBaseConfig from './../hooks/baseConfig'

const ContentTab = ({ onQueryChange }) => {
  const store = useStore()

  const { historyBaseColumns } = useBaseConfig()

  const deleteRow = (row) => {
    console.log(row.key)
    const localHistoryList = getLocalHistoryList()
    let list = localHistoryList.filter((item) => item.key !== row.key)
    window.localStorage.setItem(historyKey, JSON.stringify(list))
    let historyList = store.historyList.filter((item) => item.key !== row.key)
    setHistoryList(historyList)
  }

  const columns = [
    ...historyBaseColumns,
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 100,
      align: 'center',
      render: (text, record) => (
        <Space size="small">
          <a onClick={() => onQueryChange(record)}>请求</a>
          <a onClick={() => deleteRow(record)} style={{ color: '#FF4D4F' }}>
            删除
          </a>
        </Space>
      ),
    },
  ]

  const pagination = {
    current: store.page,
    size: 'default',
    showSizeChanger: true,
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    showTotal(total) {
      return `共 ${total} 条`
    },
    onChange(page, size) {
      // console.log({ page, size })
      store.page = page
    },
  }

  useEffect(() => {
    const localHistoryList = getLocalHistoryList()
    setHistoryList(localHistoryList)
  }, [])

  return (
    <>
      <Table
        columns={columns}
        dataSource={store.historyList}
        pagination={pagination}
        className="history-table"
        cell-class-name="history-table-cell"
        scroll={{ x: '100%', y: 'calc(100vh - 265px)' }}
      />
    </>
  )
}

ContentTab.propTypes = {
  // historyList: propTypes.array,
  onQueryChange: propTypes.func,
}

export default ContentTab
