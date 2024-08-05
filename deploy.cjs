const path = require('path')
const { NodeSSH } = require('node-ssh')
const config = require('./config.json')
const { platform } = process

const { filename, host, username, rsaPathObj, localPathObj, remotePath, shellPath, shellName } =
  config

const rsaPath = rsaPathObj[platform]
const localPath = localPathObj[platform]
const ssh = new NodeSSH()

!(async function main() {
  try {
    await ssh.connect({
      host,
      username,
      privateKey: rsaPath,
    })
    console.log('ssh连接成功')
    await ssh.putFiles([
      {
        local: path.join(filename),
        remote: `${remotePath}${filename}`,
      },
    ])
    console.log(`${filename} 上传成功`)
  } catch (err) {
    console.log('ssh连接失败')
    console.log(err)
  } finally {
    exit()
  }
})()

function exit() {
  ssh.dispose()
  process.exit(0)
}
