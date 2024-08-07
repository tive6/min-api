import { LinkOutlined } from '@ant-design/icons'
import { getName, getVersion } from '@tauri-apps/api/app'
import { relaunch } from '@tauri-apps/api/process'
import { open } from '@tauri-apps/api/shell'
import { checkUpdate, installUpdate, onUpdaterEvent } from '@tauri-apps/api/updater'
import { useReactive } from 'ahooks'
import { Button, notification } from 'antd'
import { useEffect } from 'react'
import { attachConsole, error, info, trace } from 'tauri-plugin-log-api'

import Content from './content'

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
          <div className="items-center justify-end mt-20">
            <Button onClick={cancel} size="small" className="ml-10">
              取消
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
      ),
    })
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

    async function main() {
      // with LogTarget::Webview enabled this function will print logs to the browser console
      const detach = await attachConsole()

      trace('Trace')
      info('Info')
      error('Error')

      // detach the browser console from the log stream
      detach()

      try {
        unlisten = await onUpdaterEvent(({ error, status }) => {
          // This will log all updater events, including status updates and errors.
          console.log('Updater event', { error }, { status })
          d.loading = status === 'PENDING'
          if (d.status !== 'DOWNLOADED' && status === 'DOWNLOADED') {
            d.status = status
            startInstall()
          }
        })

        const { shouldUpdate, manifest } = await checkUpdate()

        if (shouldUpdate) {
          // You could show a dialog asking the user if they want to install the update here.
          console.log(
            `Installing update ${manifest?.version}, ${manifest?.date}, ${manifest?.body}`
          )
          await openNotification(manifest)
        }
      } catch (e) {
        console.log(e)
      }
    }

    main()

    return () => {
      unlisten && unlisten()
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
