export const columnsArr = [
  {
    title: 'Key',
    dataIndex: 'keys',
    width: '20%',
  },
  {
    title: 'Value',
    dataIndex: 'values',
    width: '40%',
  },
  {
    title: '字段描述',
    dataIndex: 'description',
    width: 'auto',
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 70,
  },
]

export const currentEnvKey = 'current-environment'

export const historyKey = 'request-history-list'

export const environmentKey = 'settings-environment'
export const headersKey = 'request-headers'
export const cookiesKey = 'request-cookies'
export const queryKey = 'request-query'
export const bodyKey = 'request-body'

export const MethodOptions = [
  {
    label: 'GET',
    value: 'GET',
  },
  {
    label: 'POST',
    value: 'POST',
  },
  {
    label: 'PUT',
    value: 'PUT',
  },
  {
    label: 'DELETE',
    value: 'DELETE',
  },
  {
    label: 'PATCH',
    value: 'PATCH',
  },
  // {
  //   label: 'HEAD',
  //   value: 'HEAD',
  // },
  // {
  //   label: 'OPTIONS',
  //   value: 'OPTIONS',
  // },
]

export const layout = {
  labelCol: {
    style: {
      width: 0,
    },
  },
  wrapperCol: {
    style: {
      flex: 1,
    },
  },
}

export const formItemStyle = {
  style: {
    width: '100%',
  },
}

export const testUrl = 'https://dog.ceo/api/breeds/image/random'

export const RequestTypeOptions = [
  {
    value: 'json',
    label: 'json',
  },
  {
    value: 'stream',
    label: '流式',
  },
  {
    value: 'upload',
    label: '文件上传',
  },
  {
    value: 'download',
    label: '文件下载',
  },
]

export const DefaultRequestType = RequestTypeOptions[0].value

export const ContentTypeMap = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/zip': 'zip',
  'application/x-rar-compressed': 'rar',
  'application/x-7z-compressed': '7z',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/tiff': 'tiff',
  'image/svg+xml': 'svg',
  'text/plain': 'txt',
  'text/html': 'html',
  'text/css': 'css',
  'text/csv': 'csv',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/x-msvideo': 'avi',
  'video/x-flv': 'flv',
}

export const contentTypeOptions = [
  {
    label: 'application/json',
    value: 'application/json',
  },
  {
    label: 'application/x-www-form-urlencoded',
    value: 'application/x-www-form-urlencoded',
  },
  {
    label: 'multipart/form-data',
    value: 'multipart/form-data',
  },
  {
    label: 'text/plain',
    value: 'text/plain',
  },
  {
    label: 'application/xml',
    value: 'application/xml',
  },
  {
    label: 'text/xml',
    value: 'text/xml',
  },
]

export const HeaderOpts = [
  'Accept',
  'Accept-Charset',
  'Accept-Encoding',
  'Accept-Language',
  'Accept-Datetime',
  'Authorization',
  'Cache-Control',
  'Connection',
  'Content-Length',
  'Content-MD5',
  'Content-Type',
  'Date',
  'Expect',
  'Forwarded',
  'From',
  'Host',
  'If-Match',
  'If-Modified-Since',
  'If-None-Match',
  'If-Range',
  'If-Unmodified-Since',
  'Max-Forwards',
  'Origin',
  'Pragma',
  'Proxy-Authorization',
  'Range',
  'Referer',
  'TE',
  'User-Agent',
  'Upgrade',
  'Via',
  'Warning',
  'X-Requested-With',
  'DNT',
  'X-Forwarded-For',
  'X-Forwarded-Host',
  'X-Forwarded-Proto',
  'Front-End-Https',
  'access-control-request-headers',
  'access-control-request-method',
  'Cookie',
  'Cookie2',
  'Date',
  'keep-alive',
  'Te',
  'Trailer',
  'Transfer-Encoding',
  'x-api-key',
].map((k) => ({ label: k, value: k, desc: '**' }))

export const settingsMap = {
  environment: {
    localKey: environmentKey,
    storeListKey: 'environmentList',
  },
  header: {
    localKey: headersKey,
    storeListKey: 'headerList',
  },
  cookie: {
    localKey: cookiesKey,
    storeListKey: 'cookieList',
  },
  query: {
    localKey: queryKey,
    storeListKey: 'queryList',
  },
  body: {
    localKey: bodyKey,
    storeListKey: 'bodyList',
  },
}

export const httpRegex = /^https?:\/\/[a-zA-Z0-9]+/i
