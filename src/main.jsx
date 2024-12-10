import './assets/index.scss'
import 'jsoneditor/dist/jsoneditor.min.css'

import { App, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { createRoot } from 'react-dom/client'

import AppPage from './App'

createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <ConfigProvider locale={zhCN}>
    <App>
      <AppPage />
    </App>
  </ConfigProvider>
  // </React.StrictMode>
)
