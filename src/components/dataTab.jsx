import { useThrottleEffect } from 'ahooks'
import JsonEditor from 'jsoneditor'
import propTypes from 'prop-types'
import { useRef } from 'react'

const ResponseTab = ({ resJson, modes }) => {
  const editorWrap = useRef(null)

  useThrottleEffect(
    () => {
      let options = {
        modes,
        indentation: 2,
        search: true,
      }
      let editor = new JsonEditor(
        editorWrap.current,
        options
      )
      editor.set(resJson)
      return () => {
        editor.destroy()
      }
    },
    [resJson],
    {
      wait: 1000,
    }
  )

  return (
    <>
      <div
        className="w-full h-[calc(100vh-160px)]"
        ref={editorWrap}
      ></div>
    </>
  )
}

ResponseTab.propTypes = {
  resJson: propTypes.any,
  modes: propTypes.array,
}

export default ResponseTab
