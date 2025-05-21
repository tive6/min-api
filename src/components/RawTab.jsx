import { langs } from '@uiw/codemirror-extensions-langs'
import { vscodeLight } from '@uiw/codemirror-theme-vscode'
import CodeMirror from '@uiw/react-codemirror'
import { useReactive } from 'ahooks'
import { useCallback } from 'react'

const Com = () => {
  // console.log(langNames)
  const d = useReactive({
    value: '{a: 1, b: 2}',
  })
  const onChange = useCallback((val, viewUpdate) => {
    console.log('val:', val)
    try {
      let json = JSON.parse(val)
      console.log(json)
    } catch (e) {
      console.log(e)
    }
    d.value = val
  }, [])
  return (
    <div className="cm-wrapper h-[calc(100vh-206px)]">
      <CodeMirror
        value={d.value}
        // height="115px"
        className="cm-box w-full h-full"
        theme={vscodeLight}
        extensions={[langs.markdown()]}
        onChange={onChange}
      />
    </div>
  )
}

export default Com
