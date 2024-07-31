import {
  ClearOutlined,
  ExportOutlined,
  ImportOutlined,
  MenuOutlined,
  ReloadOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import { relaunch } from '@tauri-apps/api/process'
import { FloatButton, notification } from 'antd'

import { historyKey } from '../common/config.js'
import { exportHistory, importHistory } from '../common/helper.js'

const Com = () => {
  async function reload() {
    console.log('reload')
    await relaunch()
  }
  async function refresh() {
    window.location.reload()
  }
  async function cleanHistory() {
    try {
      window.localStorage.removeItem(historyKey)
      notification.success({
        message: '提醒',
        description: '清除完成！',
      })
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <FloatButton.Group
      trigger="click"
      type="primary"
      size="small"
      // shape="square"
      style={{ right: 1, bottom: 1 }}
      icon={<MenuOutlined />}
    >
      <FloatButton
        size="small"
        // type="primary"
        tooltip="刷新"
        onClick={refresh}
        icon={<SyncOutlined />}
      />
      <FloatButton
        size="small"
        // type="primary"
        tooltip="重启"
        onClick={reload}
        icon={<ReloadOutlined />}
      />
      <FloatButton
        size="small"
        type="primary"
        tooltip="历史记录导入"
        onClick={importHistory}
        icon={<ImportOutlined />}
      />
      <FloatButton
        size="small"
        type="primary"
        tooltip="历史记录导出"
        onClick={exportHistory}
        icon={<ExportOutlined />}
      />
      <FloatButton
        size="small"
        type="primary"
        tooltip="历史记录全部清除"
        onClick={cleanHistory}
        icon={<ClearOutlined />}
      />
    </FloatButton.Group>
  )
}

export default Com
