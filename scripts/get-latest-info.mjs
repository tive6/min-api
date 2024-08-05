import axios from 'axios'
import { outputJson, readJson } from 'fs-extra/esm'
// import FormData from 'form-data'
// import { createReadStream } from 'fs'
import { join } from 'path'

const filename = 'latest.json'
const filepath = join(process.cwd(), `${filename}`)

const owner = 'tive6'
const repo = 'min-api'

async function getPkg() {
  try {
    return await readJson(join(process.cwd(), 'package.json'))
  } catch (e) {
    console.log(e)
    return null
  }
}

!(async function main() {
  let { name, productName, version } = await getPkg()
  console.log({ name, productName, version })
  let fileUrl = await getLatestRelease()
  console.log({ fileUrl })
  if (!fileUrl) return
  try {
    let { data } = await axios({
      url: `${fileUrl}`,
      // responseType: 'stream',
    })
    await outputJson(filepath, data, { spaces: 2 })
    console.log(filename, data)
  } catch (e) {
    console.log(e)
  }
})()

async function getLatestRelease() {
  try {
    let { data } = await axios({
      url: `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
      params: {
        // access_token: GITEE_TOKEN,
      },
    })
    let item = data?.assets?.find((item) => item.name === filename)
    let fileUrl = item?.browser_download_url
    return fileUrl
  } catch (e) {
    console.log(e)
    return null
  }
}
