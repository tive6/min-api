import {
  ControlOutlined,
  MenuOutlined,
} from '@ant-design/icons'
import { relaunch } from '@tauri-apps/api/process'
import { useReactive } from 'ahooks'
import {
  Button,
  Dropdown,
  Modal,
  notification,
  Popover,
  Space,
  Table,
} from 'antd'
import localforage from 'localforage'
import { useRef } from 'react'

import {
  configColumns,
  configMap,
} from '../common/config.js'
import { historyKey } from '../common/consts.js'
import {
  exportHistory,
  importHistory,
  readImportConfig,
} from '../common/helper.js'
import useBaseConfig from '../hooks/useBaseConfig.jsx'
import {
  getHistoryList,
  getSettingsList,
} from '../store/index.js'
import GlobalSettings from './globalSettings.jsx'

const Com = () => {
  const globalSettingsRef = useRef(null)

  const temp = useRef(null)
  const { handleMenuItems } = useBaseConfig()

  const d = useReactive({
    open: false,
    handlerType: '',
    dataSource: [],
    selectedRowKeys: [...Object.keys(configMap)],
  })

  async function reload() {
    await relaunch()
  }
  async function refresh() {
    window.location.reload()
  }
  async function cleanHistory() {
    try {
      await localforage.removeItem(historyKey)
      notification.success({
        message: '提醒',
        description: '清除完成！',
      })
    } catch (e) {
      console.log(e)
    }
  }

  function showSettings() {
    globalSettingsRef?.current?.show()
  }

  const onSelectChange = (newSelectedRowKeys) => {
    console.log(
      'selectedRowKeys changed: ',
      newSelectedRowKeys
    )
    d.selectedRowKeys = newSelectedRowKeys
  }

  const rowSelection = {
    selectedRowKeys: d.selectedRowKeys,
    onChange: onSelectChange,
  }

  // const hasSelected = d.selectedRowKeys.length > 0

  async function getDataSource(type) {
    if (type === 'import') {
      let json = await readImportConfig()
      if (!json) return null
      console.log(json)
      temp.current = json
      return Object.entries(json).map(([k, list]) => {
        return {
          key: k,
          ...configMap[k],
          length: list?.length || 0,
        }
      })
    }
    return Object.entries(configMap).map(([k, item]) => {
      let list =
        k === 'history'
          ? getHistoryList()
          : getSettingsList(k)
      return {
        key: k,
        ...item,
        length: list?.length || 0,
      }
    })
  }

  async function handleOk() {
    try {
      if (d.selectedRowKeys.length) {
        let res = null
        if (d.handlerType === 'import') {
          let data = d.selectedRowKeys.reduce((acc, k) => {
            acc[k] = temp.current[k]
            return acc
          }, {})
          res = await importHistory(configMap, data)
          temp.current = null
        } else {
          let json = exportData()
          res = await exportHistory(json)
        }
        d.open = !res
        if (res) {
          notification.success({
            message: '提醒',
            description: '操作成功！',
          })
        }
      } else {
        d.open = false
      }
    } catch (e) {
      console.log(e)
    } finally {
      temp.current = null
    }
  }

  function handleCancel() {
    temp.current = null
    d.open = false
  }

  function exportData() {
    try {
      let json = {}
      for (let k of d.selectedRowKeys) {
        let list =
          k === 'history'
            ? getHistoryList()
            : getSettingsList(k)
        json[k] = list || []
      }
      return json
    } catch (e) {
      console.log(e)
      return {}
    }
  }

  async function showHandlerModal(type) {
    try {
      d.handlerType = type
      let res = await getDataSource(type)
      if (res) {
        d.dataSource = res
        d.open = true
      } else {
        d.dataSource = []
      }
    } catch (e) {
      console.log(e)
    }
  }

  function handleMenuClick({ key }) {
    console.log(key)
    if (key === 'refresh') {
      refresh()
    }
    if (key === 'reload') {
      reload()
    }
    if (key === 'import') {
      showHandlerModal('import')
    }
    if (key === 'export') {
      showHandlerModal('export')
    }
    if (key === 'cleanHistory') {
      cleanHistory()
    }
  }

  const menuProps = {
    items: handleMenuItems,
    onClick: handleMenuClick,
  }

  return (
    <>
      <Space.Compact
        // size="small"
        block
      >
        <Popover
          // content="管理 环境变量 / 全局变量 / 全局参数"
          content="管理 环境变量 / 全局参数"
          // placement="bottomRight"
          title=""
        >
          <Button onClick={showSettings}>
            <ControlOutlined />
          </Button>
        </Popover>
        <Dropdown
          placement="bottomRight"
          menu={menuProps}
          trigger={['hover']}
        >
          <Button>
            <MenuOutlined />
          </Button>
        </Dropdown>
      </Space.Compact>

      <Modal
        title={`自定义${d.handlerType === 'import' ? '导入' : '导出'}配置`}
        open={d.open}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Table
          rowSelection={rowSelection}
          columns={configColumns}
          dataSource={d.dataSource}
          pagination={false}
        />
      </Modal>

      <GlobalSettings ref={globalSettingsRef} />
    </>
  )
}

export default Com
