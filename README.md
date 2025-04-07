#### 一些常用命令

> yarn nocobase install --lang=zh-CN

* 创建插件
> yarn pm create @tx/plugin-aliyun-sms
* 注册插件
> yarn pm add @tx/plugin-aliyun-sms
* 激活插件
> yarn pm enable @tx/plugin-aliyun-sms
* 禁用插件
> yarn pm disable @tx/plugin-aliyun-sms
* 删除插件
> yarn pm remove @tx/plugin-aliyun-sms

> yarn nocobase upgrade @tx/plugin-aliyun-sms

#### postgres 添加启用备份和还原的sql命令
> INSERT INTO "public"."applicationPlugins" ("createdAt", "updatedAt", "name", "packageName", "version", "enabled", "installed", "builtIn", "options") VALUES ('2024-09-24 15:56:12.918+00', '2025-03-13 06:32:01.909+00', 'backup-restore', '@nocobase/plugin-backup-restore', '1.5.10', 't', 't', 'f', NULL);