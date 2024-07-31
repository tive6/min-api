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
        local: path.join(localPath, filename),
        remote: `${remotePath}${filename}`,
      },
      {
        local: path.join(__dirname, 'deploy.sh'),
        remote: `${shellPath}${shellName}`,
      },
    ])
    console.log(`${filename} && shell脚本上传成功`)
    let res = await ssh.execCommand(`sh ${shellName} ${filename}`, { cwd: shellPath })
    if (res.stdout) {
      console.log(`\r\n${res.stdout}\r\n`)
      console.log('shell脚本执行成功')
    } else {
      console.log(`\r\n${res.stderr}\r\n`)
      console.log('shell脚本执行失败')
    }
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
