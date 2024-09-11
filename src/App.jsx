import { LinkOutlined } from '@ant-design/icons'
import { getName, getVersion } from '@tauri-apps/api/app'
import { relaunch } from '@tauri-apps/api/process'
import { open } from '@tauri-apps/api/shell'
import { checkUpdate, installUpdate, onUpdaterEvent } from '@tauri-apps/api/updater'
import { useReactive } from 'ahooks'
import { Button, notification } from 'antd'
import localforage from 'localforage'
import { useEffect } from 'react'
import { attachConsole, info } from 'tauri-plugin-log-api'

import { SkipVersion } from './common/consts.js'
import Content from './content'

localforage.config({
  // 选择存储引擎: INDEXEDDB、LOCALSTORAGE、WEBSQL
  driver: localforage.INDEXEDDB,
  name: 'min-api-data', // 定义存储的数据库名称
  version: 1.0, // 设置数据库版本
  storeName: 'local-data', // 定义存储数据的仓库名称(相当于表名)
  description: 'min-api-data', // 设置数据库描述
  size: 50 * 1024 * 1024,
})

function App() {
  const [api, contextHolder] = notification.useNotification()

  const d = useReactive({
    status: '',
    loading: false,
  })

  async function openNotification(manifest) {
    let { version, date, body } = manifest
    const appName = await getName()
    // const tauriVersion = await getTauriVersion()
    // console.log(tauriVersion)
    const appVersion = await getVersion()
    api.info({
      style: {
        width: 430,
      },
      placement: 'topRight',
      duration: null,
      stack: { threshold: 2 },
      message: `${appName} 更新提醒`,
      description: (
        <div>
          <div className="items-center">当前版本：{appVersion}</div>
          <div className="items-center">发现新版本：{version}</div>
          <div className="items-center">
            发布时间：{date}
            {/*发布时间：{formatFixedDate(new Date(d), 'yyyy-MM-dd HH:mm:ss')}*/}
          </div>
          <div className="items-center">更新内容：{body}</div>
          <div className="items-center">
            更新日志：
            <Button
              size="small"
              style={{ margin: 0, padding: 2 }}
              onClick={viewRelease}
              icon={<LinkOutlined />}
              type="link"
            >
              查看
            </Button>
          </div>
          <div className="items-center justify-between mt-20">
            <Button onClick={jumpVer.bind(null, version)} size="small">
              跳过这个版本
            </Button>
            <div className="flex">
              <Button onClick={cancel} size="small" className="ml-10">
                下次再说
              </Button>
              <Button
                loading={d.loading}
                // disabled={d.loading}
                onClick={startUpdate}
                type="primary"
                size="small"
                className="ml-10"
              >
                开始安装并重启
              </Button>
            </div>
          </div>
        </div>
      ),
    })
  }

  async function jumpVer(version) {
    try {
      await localforage.setItem(SkipVersion, version)
      cancel()
    } catch (e) {
      console.log(e)
      info(e)
    }
  }

  async function viewRelease() {
    await open('https://github.com/tive6/min-api/releases')
  }

  function cancel() {
    api.destroy()
  }

  async function startUpdate() {
    d.loading = true
    cancel()
    // Install the update. This will also restart the app on Windows!
    try {
      info('start installUpdate')
      await installUpdate()
      // await startInstall()
    } catch (e) {
      info(e)
    }
  }

  async function startInstall() {
    // On macOS and Linux you will need to restart the app manually.
    // You could use this step to display another confirmation dialog.
    await relaunch()
    d.loading = false
  }

  useEffect(() => {
    let unlisten = null
    let detach = null

    async function main() {
      // with LogTarget::Webview enabled this function will print logs to the browser console
      detach = await attachConsole()

      // trace('Trace')
      // info('Info')
      // error('Error')
      info('app start')

      try {
        unlisten = await onUpdaterEvent(({ error, status }) => {
          // This will log all updater events, including status updates and errors.
          console.log('Updater event', { error }, { status })
          d.loading = status === 'PENDING'
          if (d.status !== 'DONE' && status === 'DONE') {
            d.status = status
            startInstall()
          }
        })

        const { shouldUpdate, manifest } = await checkUpdate()
        let skipVersion = await localforage.getItem(SkipVersion)
        console.log({ skipVersion })
        if (shouldUpdate && manifest?.version !== skipVersion) {
          // You could show a dialog asking the user if they want to install the update here.
          console.log(
            `Installing update ${manifest?.version}, ${manifest?.date}, ${manifest?.body}`
          )
          await openNotification(manifest)
        }
      } catch (e) {
        console.log(e)
        info(e)
      }
    }

    main()

    return () => {
      unlisten && unlisten()
      // detach the browser console from the log stream
      detach && detach()
    }
  }, [])
  return (
    <div className="container">
      <Content />
      {contextHolder}
    </div>
  )
}

export default App
