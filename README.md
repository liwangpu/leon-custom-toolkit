#### 一些常用命令

> yarn nocobase install --lang=zh-CN

* 创建插件
> yarn pm create @leon/plugin-unique-token-policy
* 注册插件
> yarn pm add @leon/plugin-unique-token-policy
* 激活插件
> yarn pm enable @leon/plugin-unique-token-policy
* 禁用插件
> yarn pm disable @leon/plugin-unique-token-policy
* 删除插件
> yarn pm remove @leon/plugin-unique-token-policy

> yarn nocobase upgrade @extnocobase/plugin-workflow-webhook-trigger

#### postgres 添加启用备份和还原的sql命令
> INSERT INTO "public"."applicationPlugins" ("createdAt", "updatedAt", "name", "packageName", "version", "enabled", "installed", "builtIn", "options") VALUES ('2024-09-24 15:56:12.918+00', '2025-03-13 06:32:01.909+00', 'backup-restore', '@nocobase/plugin-backup-restore', '1.5.10', 't', 't', 'f', NULL);