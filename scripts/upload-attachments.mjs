import { readFile } from 'node:fs/promises'

import axios from 'axios'
import { readJson } from 'fs-extra/esm'
// import FormData from 'form-data'
// import { createReadStream } from 'fs'
import { basename, join } from 'path'

const { GITEE_TOKEN } = process.env
const mode = 'debug' // debug  release

const filename = `MinApi.app.tar.gz`
// const filepath = join(process.cwd(), `package/${filename}`)

const owner = 'tive'
const repo = 'post-tools-tauri'

async function getPkg() {
  try {
    return await readJson(
      join(process.cwd(), 'package.json')
    )
  } catch (e) {
    console.log(e)
    return null
  }
}

!(async function main() {
  let { name, productName, version } = await getPkg()
  console.log({ name, productName, version })
  // const filename = `${productName}_${version}_aarch64.dmg`
  // const filepath = join(process.cwd(), `src-tauri/target/release/bundle/dmg/${filename}`)
  const filepath = join(
    process.cwd(),
    `src-tauri/target/${mode}/bundle/macos/${filename}`
  )
  let release_id = await getLatestRelease()
  let attach_file_id = await getAllAttachFiles(release_id)
  if (attach_file_id) {
    await delAttachFiles({
      release_id,
      attach_file_id,
    })
  }
  console.log({ release_id })
  let formData = new FormData()
  let file = await readFile(filepath)
  let files = new File(
    [new Uint8Array(file)],
    basename(filepath),
    {
      type: 'application/zip', // 可以根据文件类型设置 MIME 类型
    }
  )
  // let file = createReadStream(filepath)
  console.log({ GITEE_TOKEN })
  formData.append('access_token', GITEE_TOKEN)
  formData.append('release_id', release_id)
  formData.append('file', files, filename)
  try {
    let { data } = await axios({
      url: `https://gitee.com/api/v5/repos/${owner}/${repo}/releases/${release_id}/attach_files`,
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: formData,
    })
    console.log(data)
  } catch (e) {
    console.log(e)
  }
})()

async function getLatestRelease() {
  try {
    let { data } = await axios({
      url: `https://gitee.com/api/v5/repos/${owner}/${repo}/releases/latest`,
      params: {
        access_token: GITEE_TOKEN,
      },
    })
    // console.log(data)
    return data?.id
  } catch (e) {
    console.log(e)
    return null
  }
}

async function getAllAttachFiles(release_id) {
  try {
    let { data } = await axios({
      url: `https://gitee.com/api/v5/repos/${owner}/${repo}/releases/${release_id}/attach_files`,
      params: {
        access_token: GITEE_TOKEN,
      },
    })
    console.log(data)
    let item = data?.find((item) => item.name === filename)
    return item?.id
  } catch (e) {
    console.log(e)
    return null
  }
}

async function delAttachFiles({
  release_id,
  attach_file_id,
}) {
  try {
    let { data } = await axios({
      url: `https://gitee.com/api/v5/repos/${owner}/${repo}/releases/${release_id}/attach_files/${attach_file_id}`,
      method: 'delete',
      params: {
        access_token: GITEE_TOKEN,
      },
    })
    console.log(data)
  } catch (e) {
    console.log(e)
    return null
  }
}
