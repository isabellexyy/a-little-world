# 夜里的家 · 第一版原型

无需安装依赖。用 VS Code 打开这个文件夹。

本地运行：

```sh
python3 -m http.server 8765 --directory dist
```

打开 http://localhost:8765 。

- `dist/index.html`：页面和控件
- `dist/style.css`：等比画面、手机和放大浏览样式
- `dist/app.js`：九间房坐标、人物平移、遮挡与暂停
- `dist/assets/house.png`：无人空景
- `dist/assets/foreground.png`：生成的前景透明遮罩来源
- `dist/assets/girl.png`：静止女孩透明素材

叠放：空景 → 女孩 → 用前景 alpha 从原画取色的遮挡层。这样保留原画外观，避免重绘前景覆盖底图。前景 alpha 仍需人工精修；家具尚未分层，人物可能穿过家具。当前用于测试移动、遮挡和相同比例坐标，不是最终动画。

房间按钮可点击或用 Tab / Enter 操作。点新房间时会先完成当前路段，再前往最近选择的房间。减少动态效果的系统偏好下默认暂停。小屏幕可看整栋楼，也可放大横向浏览。

下一步：确认人物比例与站位 → 精修遮罩 → 家具原位抠图和底图补洞 → 家具 hover 与内容面板 → 人物动作。

原图中的 about / explore 字样目前仍是画面文字，不是导航。
