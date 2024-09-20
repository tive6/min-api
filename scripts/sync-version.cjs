const { parse, stringify } = require('smol-toml')
const { join } = require('path')
const { readFile, writeFile } = require('node:fs/promises')
const { version, productName } = require('../package.json')

const filepath = join(__dirname, '../src-tauri/Cargo.toml')
const configPath = join(
  __dirname,
  '../src-tauri/tauri.conf.json'
)

!(async function main() {
  try {
    let data = await readFile(configPath, 'utf8')
    let conf = JSON.parse(data)
    conf.package.version = version
    conf.package.productName = productName
    console.log(conf.package)
    const updatedData = JSON.stringify(conf, null, 2)
    await writeFile(configPath, updatedData, 'utf8')
  } catch (e) {
    console.log(e)
  }
})()

async function editToml() {
  try {
    let data = await readFile(filepath, 'utf8')
    let config = parse(data)
    // console.log(data)
    console.log('Parsed TOML:', config)
    console.log(config.package.version)
    config.package.version = version
    const updatedData = stringify(config)
    console.log(updatedData)
    await writeFile(filepath, updatedData, 'utf8')
  } catch (e) {
    console.log(e)
  }
}
