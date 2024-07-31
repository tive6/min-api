import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import JsonEditor from 'jsoneditor'
import propTypes from 'prop-types'

const ParamsJsonTab = forwardRef(({ resJson, onDataChange }, ref) => {
  useImperativeHandle(ref, () => ({
    initHandle,
  }))
  const instance = useRef(null)
  const editorWrap = useRef(null)
  const [data, setData] = useState({})

  function initHandle(res) {
    // console.log(res)
    // setData(res)
    instance.current.set(res)
  }

  useEffect(() => {
    let editor = new JsonEditor(editorWrap.current, {
      modes: ['code', 'tree'],
      onChange() {
        let res = JSON.parse(editor.getText())
        setData(res)
      },
    })
    editor.set({})
    instance.current = editor
    return () => {
      editor.destroy()
    }
  }, [])

  useEffect(() => {
    onDataChange(data)
  }, [data])

  useEffect(() => {
    if (resJson) {
      console.log(resJson)
      setData(resJson)
    }
  }, [resJson])

  return (
    <>
      <div style={{ width: '100%', height: 'calc(100vh - 216px)' }} ref={editorWrap}></div>
    </>
  )
})

ParamsJsonTab.displayName = 'ParamsJsonTab'
ParamsJsonTab.propTypes = {
  resJson: propTypes.object,
  onDataChange: propTypes.func,
}

export default ParamsJsonTab
