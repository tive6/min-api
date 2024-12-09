import { Space, Table, Tooltip } from 'antd'
import localforage from 'localforage'
import propTypes from 'prop-types'
import { useEffect } from 'react'

import { historyKey } from '../common/consts.js'
import { getLocalHistoryList } from '../common/helper.js'
import useBaseConfig from '../hooks/useBaseConfig.jsx'
import { setHistoryList, useStore } from '../store/index.js'

const Com = ({ onQueryChange }) => {
  const store = useStore()

  const { historyBaseColumns } = useBaseConfig()

  const deleteRow = async (row) => {
    try {
      console.log(row.key)
      const localHistoryList = await getLocalHistoryList()
      let list = localHistoryList.filter(
        (item) => item.key !== row.key
      )
      await localforage.setItem(historyKey, list)
      let historyList = store.historyList.filter(
        (item) => item.key !== row.key
      )
      setHistoryList(historyList)
    } catch (e) {
      console.log(e)
    }
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
          <Tooltip placement="top" title="重新请求">
            <a onClick={() => onQueryChange(record)}>
              请求
            </a>
          </Tooltip>
          <a
            onClick={() => deleteRow(record)}
            className="text-#FF4D4F"
          >
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
    async function main() {
      const localHistoryList = await getLocalHistoryList()
      setHistoryList(localHistoryList)
    }
    main()
  }, [])

  return (
    <>
      <Table
        // virtual={true}
        columns={columns}
        dataSource={store.historyList}
        pagination={pagination}
        className="history-table"
        cell-class-name="history-table-cell"
        scroll={{ x: '100%', y: 'calc(100vh - 246px)' }}
      />
    </>
  )
}

Com.propTypes = {
  // historyList: propTypes.array,
  onQueryChange: propTypes.func,
}

export default Com
