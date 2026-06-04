# my-cloud-notepad
云笔记是一款轻量级、自托管的个人笔记应用，支持 Markdown 编辑、分类与标签管理、笔笔记支持多种导入导出形式（文本形式导入导出、主文件夹+子文件夹形式导入导出）、GitHub 登录、安全分享、WebDAV 备份、锁屏保护以及深色主题。 所有数据完全由用户掌控，存储在自有服务器中，适合追求隐私、安全和长期可维护性的个人知识管理场景。
<img width="1920" height="1040" alt="PixPin_2026-06-04_17-31-01" src="https://github.com/user-attachments/assets/982a17f0-aece-4df8-b133-c477544753c4" />
![PixPin_2026-06-04_17-31-01.png](https://tc.alex.nyc.mn/api/cfile/AgACAgUAAxkDAAIQCGohRvztisVaw30g-cHzl5k3T6-EAAKeEGsbF_EJVaELJSpIw0b5AQADAgADdwADOwQ)

# 主要功能介绍

# 限制注册账号数量
在 Cloudflare 后台，你需要填写的环境变量名称是：MAX_USERS

具体填写方式如下：

变量名称 (Variable name)：MAX_USERS （必须全部大写，不要有空格）

值 (Value)：填入你允许的最大注册数量（例如填 1 代表只能注册一个账号，填 2 代表两个）。

# 注销账号
设置保存后，一定要去部署记录里点击一次重试部署 (Retry deployment)，这个人数限制的拦截功能就会立刻生效
保存并推送更新后，你的右上角就会多出一个“注销账号”的选项。点击后必须要一字不差地打出“确认注销”四个字，系统才会连根拔起销毁该账号的数据，同时释放你的 KV 数据库空间和之前设置的“注册人数名额”！
