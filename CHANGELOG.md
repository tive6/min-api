

## [4.8.2](https://github.com/tive6/min-api/compare/4.5.0...4.8.2) (2024-10-19)


### ✨ Features | 新功能

* logo 替换 ([dff745d](https://github.com/tive6/min-api/commit/dff745dcb0b236dacad09c6cd1bc06ea118a91ff))
* 使用 localforage 替换 localStorage；上传文件 formData 数据 由 arrayBuffer 修改为 Uint8Array ([65f24b6](https://github.com/tive6/min-api/commit/65f24b6cd6b70cc323d000b8dcd597b53833285e))
* 修改打包命令为 pnpm app ([c9decdc](https://github.com/tive6/min-api/commit/c9decdcdbe4955e515d8d202e77d8ae39c9b3679))
* 全局配置-增加 desc 描述项 ([fe97f1c](https://github.com/tive6/min-api/commit/fe97f1c6bf89998e631a0498e7b04761bb6f477b))
* 发送请求 增加 query， body 全局参数 ([ba217f6](https://github.com/tive6/min-api/commit/ba217f6fc2bb77fd15432e42a6a49e43aa8027de))
* 增加 contentTypeOptions  text/plain application/xml text/xml ([1f815b4](https://github.com/tive6/min-api/commit/1f815b4184c851f9d0f628933aa7b106a172a6d2))
* 增加 阻止右键菜单；阻止F12、Ctrl+Shift+I、Ctrl+Shift+C快捷键打开 开发者工具；增加 start , pack 启动和打包命令 ([b0a23eb](https://github.com/tive6/min-api/commit/b0a23eb81c497150b2734a357f71f68e6342875f))
* 增加全局参数 headers ([cf92097](https://github.com/tive6/min-api/commit/cf9209764e3db1f75dfb4059c385845f3b216917))
* 增加全局参数：全局 cookie 配置 ([28d4aba](https://github.com/tive6/min-api/commit/28d4aba0cbbfc503982bd630085c68719ad9dacc))
* 增加全局环境-域名配置和相关url合法性验证 ([1fb45da](https://github.com/tive6/min-api/commit/1fb45da1e9cad907c0c3ca6043938438e9059e00))
* 增加全局配置和历史记录导入、导出功能；优化文件上传操作；优化悬浮按钮和全局配置按钮；优化请求参数展示和过多滚动；优化 eslint 配置；log日志增加环境区分，debug调试模式不在控制台打印；文件格式化 ([bd6b820](https://github.com/tive6/min-api/commit/bd6b820730610a3cd70804266ab20271dd5914e5))
* 解决导入导出失败的问题； url后的Query参数自动格式化关闭； ([d44131e](https://github.com/tive6/min-api/commit/d44131e319a9c69c2c1455e5b5e93182a7a711e3))


###   Bug Fixes | Bug 修复

* 修复搜索历史记录异常问题 ([e498be1](https://github.com/tive6/min-api/commit/e498be10546b2215d83c207099a5511f5eb41ccb))
* 解决 localforage 不能保存 Proxy 对象的问题，深拷贝解除 Proxy ([0a170d0](https://github.com/tive6/min-api/commit/0a170d0728d846cc93d77380d10cef23ec1d9717))
* 解决 全局环境 不自动补全 base url 的问题 ([5f3c112](https://github.com/tive6/min-api/commit/5f3c112721f0c2a02e86d22d5fee72d8779740c5))
* 解决Mac 中首字母自动转大写的问题：https://tiven.cn/p/c81a08f9/ ([54e354c](https://github.com/tive6/min-api/commit/54e354ca5e64687735562c6ba400d4c20bfd6183))
* 解决Mac 中首字母自动转大写的问题：https://tiven.cn/p/c81a08f9/    代码优化 ([36f572d](https://github.com/tive6/min-api/commit/36f572d602759c5f59527f2d57ce3515fa6c4c1c))


###   Chores | 其他更新

* 升级 vite 和 @vitejs/plugin-react 版本，解决 Warning with use client directive with Vite 的警告⚠ ([2bdc47d](https://github.com/tive6/min-api/commit/2bdc47da9833fe54d56b58e1428bbd8ead095f18))


###   Documentation | 文档

* 更新 description ([79248d3](https://github.com/tive6/min-api/commit/79248d3ce125d4ee497236684eb4abcc39d1dab4))
* 更新 version ([e054659](https://github.com/tive6/min-api/commit/e0546599d66a89728c01029866fdab852b6de5af))
* 更新功能介绍 ([f8aa1e0](https://github.com/tive6/min-api/commit/f8aa1e0c5f6325b4d203e8059b1ecbcc4f203a2a))
* 编写 readme 文档，增加项目描述和功能介绍 ([72b1555](https://github.com/tive6/min-api/commit/72b1555ef09162d87b7ff172b56ed45f028a2112))


### ⚡ Performance Improvements | 性能优化

* 优化，具体化，明确化  log 输出 ([95568ec](https://github.com/tive6/min-api/commit/95568ec330c2be12de84882f4def0f195f3a7ee8))
* 使用 unocss 替换 内联style样式，优化 http 参数 ([56db3bd](https://github.com/tive6/min-api/commit/56db3bd17ff73f324f2448fae21453d519247279))
* 全局环境配置动态检测和自动补全 ([459319e](https://github.com/tive6/min-api/commit/459319e0be7d193419886aed814d96369a704d0b))
* 整理 config.js 和 consts.js ; 调整提示文案 ([07ee3be](https://github.com/tive6/min-api/commit/07ee3be8f1fc817f132eead236c5e9a4b2ecffa0))

## [4.5.0](https://github.com/tive6/min-api/compare/4.4.1...4.5.0) (2024-08-08)


### ✨ Features | 新功能

* 增加 log 功能，增加自定义更新逻辑及更新展示 ([af53c05](https://github.com/tive6/min-api/commit/af53c0505a5b8c453b697980919cb9cd93fd2df8))


###   Chores | 其他更新

* Release v4.4.1 ([3bd95ab](https://github.com/tive6/min-api/commit/3bd95ab363812afcc55f090722f13a4b386df220))


### ⚡ Performance Improvements | 性能优化

* 优化自动更新流程，优化顶部布局 ([1dc3970](https://github.com/tive6/min-api/commit/1dc39706cab69d9a9d487cb6f9b8fdca589ac549))

## [4.4.1](https://github.com/tive6/min-api/compare/4.4.0...4.4.1) (2024-08-05)


###   Continuous Integration | CI 配置

* 调整 actions 工作流触发时机：master push -> release published ([4bb7b4b](https://github.com/tive6/min-api/commit/4bb7b4b652be2cf2d3b5174de98936fa9ce71a45))

## [4.4.0](https://github.com/tive6/min-api/compare/4.3.19...4.4.0) (2024-08-05)


###   Continuous Integration | CI 配置

* 增加获取最新 latest.json 内容脚本和 版本同步脚本。增加上传到服务器端的逻辑，修改tauri对应updater的配置 ([ddaa337](https://github.com/tive6/min-api/commit/ddaa3372d4f32bb6971cd57c93c2994bf1c4aff5))

## [4.3.19](https://github.com/tive6/min-api/compare/4.3.18...4.3.19) (2024-08-05)

## [4.3.18](https://github.com/tive6/min-api/compare/4.3.17...4.3.18) (2024-08-05)

## [4.3.17](https://github.com/tive6/min-api/compare/4.3.16...4.3.17) (2024-08-05)

## [4.3.16](https://github.com/tive6/min-api/compare/4.3.15...4.3.16) (2024-08-05)

## [4.3.15](https://github.com/tive6/min-api/compare/4.3.14...4.3.15) (2024-08-05)


### ✅ Tests | 测试

* actions test ([3cfddb0](https://github.com/tive6/min-api/commit/3cfddb0641d968d02de79f6da9b9b56849bf609c))
* actions test ([a822ac2](https://github.com/tive6/min-api/commit/a822ac2d3d12c1b323d34de54a890d192ea4a5cd))
* actions test ([2a30a8d](https://github.com/tive6/min-api/commit/2a30a8d8d8744dccea4be0c928dd763e848bdbdb))
* actions test ([db5d3eb](https://github.com/tive6/min-api/commit/db5d3eb64c97de5941a77ec538f175567e861bb1))
* actions test ([57ea53c](https://github.com/tive6/min-api/commit/57ea53cb0820578eb5250474c64a164d70a15f75))
* actions test 2 ([412be8e](https://github.com/tive6/min-api/commit/412be8eef9f4ac0eeb6ab576b9826864bad41473))
* actions test 3 ([c26491e](https://github.com/tive6/min-api/commit/c26491ef8965f933d5cac639f2d8ca66527a4e98))
* actions test 4 ([d0dfe02](https://github.com/tive6/min-api/commit/d0dfe025e5b4770f03822ad2367f2f4ab5340a79))
* actions test 5 ([d6a2746](https://github.com/tive6/min-api/commit/d6a27465d3964438a09b385b849ba6f017eb8a0e))
* actions test 6 ([033c9b6](https://github.com/tive6/min-api/commit/033c9b61116873323dc02d3a185b347981f78f92))


###   Continuous Integration | CI 配置

* github actions 增加 node_modules 缓存 ([65ea09f](https://github.com/tive6/min-api/commit/65ea09f11ca5094077875b6260755be955615ccb))

## [4.3.14](https://github.com/tive6/min-api/compare/4.3.13...4.3.14) (2024-08-01)

## [4.3.13](https://github.com/tive6/min-api/compare/4.3.12...4.3.13) (2024-08-01)

## [4.3.12](https://github.com/tive6/min-api/compare/4.3.11...4.3.12) (2024-08-01)

## [4.3.11](https://github.com/tive6/min-api/compare/4.3.10...4.3.11) (2024-07-31)

## [4.3.10](https://github.com/tive6/min-api/compare/4.3.9...4.3.10) (2024-07-31)

## [4.3.9](https://github.com/tive6/min-api/compare/4.3.8...4.3.9) (2024-07-31)

## [4.3.8](https://github.com/tive6/min-api/compare/4.3.7...4.3.8) (2024-07-31)

## [4.3.7](https://github.com/tive6/min-api/compare/4.3.6...4.3.7) (2024-07-31)

## 4.3.6 (2024-07-31)


### ✨ Features | 新功能

* init ([ba9138b](https://github.com/tive6/min-api/commit/ba9138bbf70e93099083c7f4b8b13dbc72c3a610))

## [4.3.4](https://gitee.com/tive/post-tools-tauri/compare/4.3.3...4.3.4) (2024-07-29)


###   Continuous Integration | CI 配置

* 修改 同步版本的 脚本 ([57b1adb](https://gitee.com/tive/post-tools-tauri/commit/57b1adb42166fb3fc99dbe94c8860c3160cc3492))

## [4.3.3](https://gitee.com/tive/post-tools-tauri/compare/4.3.0...4.3.3) (2024-07-29)


###   Continuous Integration | CI 配置

* 增加 版本同步脚本和附件上传脚本，修改 release-it 配置 ([b62e97d](https://gitee.com/tive/post-tools-tauri/commit/b62e97d9cc0b9a7f6f66e4a9a4a5412ff998d2ec))

## [4.3.0](https://gitee.com/tive/post-tools-tauri/compare/4.2.0...4.3.0) (2024-07-26)


###   Bug Fixes | Bug 修复

* 解决文件上传默认 content-type 异常的问题； 修复拖拽文件到指定位置上传的功能 ([b4e796a](https://gitee.com/tive/post-tools-tauri/commit/b4e796a549cf3d3130210843c52d660e6c9fb8ec))


###   Chores | 其他更新

* Release v4.2.3 ([707529e](https://gitee.com/tive/post-tools-tauri/commit/707529edb8963d7faf0a53afe630d9f76c260681))


###   Continuous Integration | CI 配置

* 修改 release-it 配置，调整release-it推送流程 ([9e562a2](https://gitee.com/tive/post-tools-tauri/commit/9e562a22312007768f9d51d7f01df1e618fbf8c9))

## [4.2.3](https://gitee.com/tive/post-tools-tauri/compare/4.2.0...4.2.3) (2024-07-23)


###   Continuous Integration | CI 配置

* 修改 release-it 配置，调整release-it推送流程 ([9e562a2](https://gitee.com/tive/post-tools-tauri/commit/9e562a22312007768f9d51d7f01df1e618fbf8c9))

## [4.2.2](https://gitee.com/tive/post-tools-tauri/compare/4.2.0...4.2.2) (2024-07-23)

## [4.2.1](https://gitee.com/tive/post-tools-tauri/compare/4.2.0...4.2.1) (2024-07-23)

## 4.2.0 (2024-07-23)


### ✨ Features | 新功能

* headers 参数回显优化 ([9cd161c](https://gitee.com/tive/post-tools-tauri/commit/9cd161c36ac57e18fe28eadaeccc5ddaf43cd106))
* 修改 app name ([cc457a2](https://gitee.com/tive/post-tools-tauri/commit/cc457a252dbf421b09053823d6a9a67edea0b8ae))
* 增加 formData application/x-www-form-urlencoded contentType 数据支持 ([937d8c9](https://gitee.com/tive/post-tools-tauri/commit/937d8c961f6bcfd6305743654cb66ef91110c925))
* 增加 PUT DELETE PATCH 类型请求 ([c08731d](https://gitee.com/tive/post-tools-tauri/commit/c08731d9fb85db806062de205ad2b346fd31bfdd))
* 增加 文件上传，文件下载 功能 ([44bfbf2](https://gitee.com/tive/post-tools-tauri/commit/44bfbf20ba6103434d102261af69f79d49b32590))
* 增加文件上传，下载，流式请求类型；增加历史记录导入导出 ([e39a831](https://gitee.com/tive/post-tools-tauri/commit/e39a831e43e0bbcf01c75809503f7808c3571547))
* 调试窗口菜单 ([d66ea06](https://gitee.com/tive/post-tools-tauri/commit/d66ea06e3638aaeeeccfe4aa83e0a4be7474c0a1))
* 配置beforeBuildCommand构建前静态打包 ([324706d](https://gitee.com/tive/post-tools-tauri/commit/324706de4150d353078318ca2674bcbe21b19756))


### ⚡ Performance Improvements | 性能优化

* 优化 form 和 json 参数由merge变为独立作为参数发送请求 ([c1f29f0](https://gitee.com/tive/post-tools-tauri/commit/c1f29f077fd3757a8df81b5be1e11853bff2e89f))


### ✅ Tests | 测试

* 创建工作流测试 ([3453136](https://gitee.com/tive/post-tools-tauri/commit/3453136eedf4234ce074a8da232571f7a45126b1))
* 创建工作流测试 2 ([ec2c79f](https://gitee.com/tive/post-tools-tauri/commit/ec2c79fc27e31ea3cc1e3e9b9e5a255e944e414a))
* 工作流 测试 ([2bd3b20](https://gitee.com/tive/post-tools-tauri/commit/2bd3b20ca18c000f37af6987779e5dd2a68641c2))


###   Continuous Integration | CI 配置

* 配置 eslint 格式化 ([6e84ca3](https://gitee.com/tive/post-tools-tauri/commit/6e84ca3d7c1596d36b3e8a6cc6d964ab768a0127))
