import { Select } from 'antd'

import { RequestTypeOptions } from '../common/config.js'
import { useStore } from '../store/index.js'

const Com = () => {
  const store = useStore()

  function onChange(val) {
    store.requestType = val
    console.log(store.requestType)
  }

  return (
    <div className="tab-extra">
      <div className="tab-extra-label">请求类型</div>
      <Select
        defaultValue={store.requestType}
        value={store.requestType}
        style={{
          width: 100,
        }}
        onChange={onChange}
        options={RequestTypeOptions}
      />
    </div>
  )
}

// Com.propTypes = {
//   resJson: propTypes.any,
//   modes: propTypes.array,
// }

export default Com
