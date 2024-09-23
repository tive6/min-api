import { SearchOutlined } from '@ant-design/icons'
import { useKeyPress } from 'ahooks'
import { Input } from 'antd'
import {
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react'

import { disabledAutoCapitalize } from '../common/config.js'
import { getLocalHistoryList } from '../common/helper.js'
import { setHistoryList, useStore } from '../store/index.js'

const Com = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    search,
  }))

  const inputRef = useRef()
  const store = useStore()

  async function search() {
    try {
      store.page = 1
      let kw = store.keywords.trim()
      console.log({ kw })
      const localHistoryList = await getLocalHistoryList()
      let list = localHistoryList.filter((item) =>
        JSON.stringify(item).includes(kw)
      )
      setHistoryList(list)
    } catch (e) {
      console.log(e)
    }
  }

  useKeyPress(
    'enter',
    (event) => {
      const { value } = event.target
      store.keywords = value
      search()
    },
    {
      target: inputRef?.current?.input,
    }
  )

  return (
    <div className="tab-extra">
      <Input
        {...disabledAutoCapitalize}
        defaultValue={store.keywords}
        ref={inputRef}
        onChange={(e) => (store.keywords = e.target.value)}
        onClear={() => {
          store.keywords = ''
          search()
        }}
        allowClear
        suffix={
          <div>
            <SearchOutlined
              onClick={search}
              className="search-icon"
            />
          </div>
        }
        placeholder="搜索历史记录"
      />
    </div>
  )
})

Com.displayName = 'HistorySearch'
// Com.propTypes = {
//   resJson: propTypes.any,
//   modes: propTypes.array,
// }

export default Com
