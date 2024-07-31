import { relaunch } from '@tauri-apps/api/process'
import { checkUpdate, installUpdate, onUpdaterEvent } from '@tauri-apps/api/updater'
import { notification } from 'antd'
import { useEffect } from 'react'

import Content from './content'

function App() {
  const [api, contextHolder] = notification.useNotification()

  function openNotification() {
    api.info({
      message: `Notification Title`,
      description: <div>notification</div>,
      placement: 'topRight',
      duration: null,
    })
  }

  useEffect(() => {
    let unlisten = null

    async function main() {
      try {
        unlisten = await onUpdaterEvent(({ error, status }) => {
          // This will log all updater events, including status updates and errors.
          console.log('Updater event', error, status)
        })

        const { shouldUpdate, manifest } = await checkUpdate()

        if (shouldUpdate) {
          // You could show a dialog asking the user if they want to install the update here.
          console.log(
            `Installing update ${manifest?.version}, ${manifest?.date}, ${manifest?.body}`
          )
          openNotification()

          // Install the update. This will also restart the app on Windows!
          await installUpdate()

          // On macOS and Linux you will need to restart the app manually.
          // You could use this step to display another confirmation dialog.
          await relaunch()
        }

        // you need to call unlisten if your handler goes out of scope, for example if the component is unmounted.
        unlisten()
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
