# Planet 612 工具箱 · 变更记录

## v136(2026-11-27)· 门户首页补上部署包下载入口

之前 `index.html`（门户首页）里**一个下载入口都没有** —— 全文件搜不到 `download.html`，
想要部署包只能自己敲 `/download.html` 地址才能找到。

- 首页「📱 装到手机」旁边并排放一个「⬇ 下载部署包（zip）」胶囊按钮（同为圆角胶囊，紫色系区分）；
- 下载页顶部补「← 返回首页」链接，从首页点进去下载后能一键回门户。

## v135(2026-11-19)· 编年页新增行程范围说明 + 下载页脚本外露修复

### 编年页说明条

「全部年份」标题下方新增一条**行程范围说明条**：**2025 年起只记录旅游 / 异地观看演出行程**。

- 放在大标题**下面单独一行**，不跟统计信息挤在同一行 —— 同排会把标题行撑得很长，
  抢走「全部年份」这个 40px 大标题的视觉重心；
- 样式走「提示条」而不是灰色小字：淡主题色底 + 3px 主色左边条 + 主文本色文字（13px），
  「2025 年起」用高亮色（`--primary-dark`）标出 —— 最初做成 muted 灰字时实测「不是很突出」；
- 前缀一个主题色 `※`，鼠标悬停有补充说明：
  「2025 年之前是完整的生活流水；2025 年起只保留旅游与异地看演出的行程」；
- 只在「全部年份」全览态出现（单年视图里说「2025 年起」没有上下文），筛选态仍显示。

底色用独立的 `--note-bg` 变量（浅色 `rgba(191,154,125,.16)` / 深色 `rgba(187,124,228,.20)`），
**不复用 `--primary-soft`** —— 那个变量全站从未定义、只有引用，导致左栏年份行的 hover 底色与
「筛选中」徽章底色其实一直是失效的，补它会顺手改动左栏观感，不在本次范围内。

排版坑：`.yv-note` 用 flex 排「圆点 + 文字」时，`<b>2025 年起</b>` 和后面的文字会被拆成
两个**并排**的 flex 子项，文案折成两行。文字必须整体包在一个 `<span>` 里，当作单个 flex 子项。

### 下载页修复

`download.html` 底部「在线地址 + 一键复制」那段脚本**漏了 `<script>` 标签**，
被浏览器当正文渲染 → 页面底部露出一整段 JS 源码；它还作为一个 flex 子项参与
`body` 布局，把 520px 的卡片挤到左边变窄，并撑出横向滚动条。补上标签后两个现象一起消失。

另：本地 `file://` 打开时不再发那个必然 CORS 失败的 `/dl` 探测请求，控制台零报错。

### 版本

- `time.html` → `v44 · 倒叙卡片墙 + 行程说明`
- `index.html` `TOOLS_VER['time.html']` → 44
- `sw.js` `CACHE` → `p612-v161`

### 涉及脚本

| 脚本 | 作用 |
| --- | --- |
| `tools/test_v135_note.py` | 说明小字专项测试：全览态显示、单年视图隐藏、筛选态仍显示、文案不折行、无 JS 错误 |

## v134(2026-11-18)· 编年页改为「倒叙卡片墙」

### 结构变化

编年页从「每年一块、可折叠」的全览形态，改为**倒叙卡片墙**：

- **进入时**：全部事件按时间**从新到旧**连续平铺成 3 列块状卡片网格，
  每年第一张卡在卡头标出年份（如「2024 住宿」）——
  年份角标作为卡头的 flex 子项，不绝对定位（绝对定位会压住分类名）。
- **点左栏年份**：右侧仍是现在的编年单年形态（年标题 + 分类统计条 + 按分类分组的事件）。
- 左栏顶部「全部」按钮点一下即回到卡片墙（现状就存在，无需新增）。
- 跨年长时段事件按**开始日期**排序（与时间轴一致）。

### 删除

旧的「每年一块、可折叠」全览形态整体移除 —— 渲染代码、CSS、事件绑定一并清掉。
（你的数据里有 4 个年份只有 1 条记录，分块后每年只占一行、大片留白。）

### 涉及脚本

| 脚本 | 作用 |
| --- | --- |
| `tools/port_v134_yearwall.py` | 倒叙卡片墙 + 年份角标移植，删除旧全览形态 |
| `tools/build_year_wall_previews.py` | 五方案对比预览生成（A/B/C/D + 现状 Z） |

回滚点：`_archived/v134/time.html.v42.bak`。

## v133(2026-11-18)· 「按年」页签改名「编年」

- 「按年」页签改名为「**编年**」—— 与页面标题「个人编年史」、导出文件名「编年记事」用词统一。

## v132(2026-11-18)· 公网地址恢复

### 域名后缀迁移

平台把发布应用的域名后缀从 `app.workbuddy.host` 迁到了 `sh4.agentos-app.net`。
老地址 `a6ac3488091b49644.app.workbuddy.host` 已被平台回收（返回 404
「该应用尚未发布」），沙箱侧无法绑定回去 —— 后端只接受 `sh4.agentos-app.net`。

新地址：**`https://a6ac3488091b49644.sh4.agentos-app.net`**

- **免访问凭据** —— 裸链接直接打开，不需要 `?sharecode=`
- **稳定** —— 跟随 appName，多次发布不变（`publish.js` 返回的 uuid 域名每次都变，
  但 `<appName>.sh4.agentos-app.net` 恒定）
- 全部页面 200：门户 / 6 个工具 / sw.js / manifest.json / 下载包

### 涉及脚本

| 脚本 | 作用 |
| --- | --- |
| `tools/resolve_public_domain.py` | 解析稳定主域名 + 校验免凭据可访问，写入 `portal/public-domain.json` |
| `tools/add_online_address.py` | 给 `download.html` 加「在线地址」区块（一键复制） |

## v131(2026-11-18)· 时光自撰集「块状网格」改版

### 按年视图右栏 → 块状网格

- **不再按分类分组**,按时间顺序铺成 **3 列网格**。分类色收在卡头
  (分类名 + 重要星标 + 时长),同色卡片不再被拆散,网格没有空洞。
- **超长标题(超过 3 行)两种查看方式**:悬停弹完整原文气泡(含换行)、
  点卡片右下角「⋯」就地展开全文再点收起。气泡浮层挂在页面层,不被卡片裁掉。
- 事件描述里的换行统一折叠成空格(标题 / 地点 / 时间轴 / 列表 / 导入预览一致)。

### 修掉的两个真 bug

- **编辑框吃掉换行符**:标题与地点字段从 `<input type="text">` 改成
  `<textarea>`。`<input type="text">` 按浏览器规范会**把换行符直接吃掉** ——
  Excel 里带换行的「事件描述」导进来后,打开编辑框换行就没了,一保存就永久丢失。
- **深色主题下编辑框白底白字**:新样式误用了深色主题**未定义**的 `--bg` 变量,
  回落成浅色底配浅色字,输入的内容完全看不见。

### 涉及脚本

| 脚本 | 作用 |
| --- | --- |
| `tools/port_v131_block.py` | 方案 D 块状网格 + N3 换行折叠 + P2/P3 超长处理移植 |
| `tools/port_v131_place_fix.py` | 地点字段 textarea 化 + 各地点显示折叠换行 + 白底白字修复 |
| `tools/test_v131_block.py` | v131 专项测试(36 项:网格布局 / 换行 / 悬停 / 展开 / 编辑框) |
| `tools/build_block_previews.py` | 四方案块状 UI 对比预览生成 |
| `tools/build_newline_previews.py` | 换行处理三变体(N1/N2/N3)预览生成 |
| `tools/build_over3line_previews.py` | 超过 3 行三变体(P1/P2/P3)预览生成 |

回滚点:`_archived/v131/time.html.v40.bak`(块状网格移植前)、
`_archived/v131/time.html.v41.bak`(地点修复前)。

## v126(2026-11-18)· 时光自撰集「年为主骨架」重构

### 信息架构

- **年 = 第一层骨架**。左栏「分类」大块改为「年份浏览」目录,每行显示年份、条数、
  分类分布色带、重要标记 ★,外加「全部」入口。
- **新增「按年」视图**(`time.html` v36),页签排在**第一位**,进入页面默认落在这一屏。
  - 全览形态:按年份顺序列出每年一块,每块 = 年标题 + 分类统计条 + 按分类分组的事件,
    默认只展开最近一年,其余折叠(首屏不是一堵卡片墙)。
  - 单年形态:点左栏某年 → 只看那一年,结构同上(年 → 分类统计 → 事件)。
  - 搜索 / 只看重要激活时**自动退回全览**(按年分组显示命中项),
    避免"在 2017 里搜不到就永远看不到结果"。
- **分类降级为一行紧凑 chip**,从左栏主角变成年下面的统计维度 + 可选筛选参数。
- 章节视图(旧 v24 自造词那套)仍下线,代码保留;旧章节配色已改为引用统一表。

### 图谱页 → 时间骨架图

- 旧的「年份↔分类」力导向二部图**整体移除**(约 400 行,含拖拽联动、图例、悬浮气泡)。
- 新「时间骨架图」是严格三层:**年份主干**(编年顺序排成一条紫脊)
  → **分类分支**(挂在年份上,用统一分类色)→ **事件叶子**(挂在分类下)。
- 交互:点年份 → 跳到「按年」页并选中该年;点分类 → 按分类筛选;
  悬停事件圆点 → 详情气泡;点圆点 → 打开编辑。
- 工具条新增「旧 → 新 / 新 → 旧」排序切换按钮。
- SVG 改为 1:1 渲染 + 外层滚动(旧实现靠 viewBox 缩放,树一高就糊成一团)。

### 分类配色统一

- 原文件并存**三套**不一致的分类色(图谱 `G_CAT_COLOR` / 章节 `CH_COLORS` / 各处散落),
  同一个「旅行」在不同视图里颜色不同。现统一为**全站唯一来源**
  `CAT_COLOR` / `CAT_COLOR_DARK`,任何视图、任何年份、任何主题下同一分类同一颜色。
- 深浅两套主题**同色相、不同明暗**(实测色相差 <0.002),浅色底压暗、深色底提亮。
- **新增自定义分类颜色**:分类管理面板每个分类有 🎨 色盘按钮,16 个预设色 + 原生取色器
  + 「恢复默认」;持久化键 `time_catcolors_v1`。
  - 分类改名时颜色跟着迁移,删除时颜色一并清理。
  - Excel 分类表增加「颜色」列,跟着云端数据走 —— 换设备后颜色不变。

### 修掉的缺陷

- `#view-year` 容器没有统一的显隐控制 → 切到其它视图时年视图仍占位,内容叠在一起。
- 色盘弹层 HTML 被插入两次 → 页面上有两个 `#color-mask`,`#color-title` 选择器命中冲突。
- 分类管理面板新版 DOM 的 class 与原 CSS 不一致(`.cat-man-row` vs `.cm-row`)
  → 弹窗里样式全丢,改名输入框也找不到。
- 图谱网格是三段式,加了色点与色盘按钮后变四段 → 按钮被挤到下一行。

### 验证

| 测试 | 结果 |
| --- | --- |
| `tools/test_v126_year.py`(按年视图 + 统一色 + 色盘) | 37/37 |
| `tools/test_skeleton_preview.py`(时间骨架图) | 23/23 |
| `tools/test_cat_color.py`(全站配色一致性) | 39/39 |
| `tools/test_time_dedupe.py` / `_paths` / `_btn` | 19/19 · 12/12 · 16/16 |
| `tools/test_standalone.py`(单文件版) | 20/20 |

### 本轮新增/改动的工具脚本

| 脚本 | 用途 |
| --- | --- |
| `tools/port_v126.py` | 把「按年」视图 + 统一分类色 + 色盘正式写进 `time.html`(第一阶段) |
| `tools/port_v126_skeleton.py` | 把图谱页改造成时间骨架图(第二阶段) |
| `tools/year-view-v126.js` | 年视图逻辑(年份目录 / 单年 / 全览按年分组) |
| `tools/cat-color-v126.js` | 分类配色与色盘(统一色源 / 自定义色持久化 / 改名迁移) |
| `tools/skeleton-graph-v126.js` | 时间骨架图渲染(年→分类→事件三层) |
| `tools/test_v126_year.py` | 按年视图 + 分类色测试 |
| `tools/test_skeleton_preview.py` | 时间骨架图测试 |
| `tools/build_year_preview.py` | v125 预览构建(历史) |
| `tools/build_traj_preview.py` | 地图轨迹预览构建(历史,素材已移入 `_archived/v125/`) |
| `tools/test_year_preview.py` / `tools/test_traj_preview.py` | v125 预览测试(历史) |

回滚点:`_archived/v126/time.html.v35.bak`(按年移植前)、
`_archived/v126/time.html.v36-year.bak`(骨架图移植前)。

---

### v127(2026-11-18)· 按用户表格格式重做导入 + 新增「地点」字段

用户实际在用的表格格式（`时光自撰集.xlsx`）：
```
说明：结束时间为空，则为单日事件          ← 第 1 行说明
开始时间 | 结束时间 | 分类 | 地点 | 事件描述   ← 第 2 行表头
20100720 | 20220201 | 住宿 | 北京 | 租住于北京清河宝盛西里   ← 数据行（日期是数字）
```

**根因**：导入端只认「表头含 事件/标题 且列数≥4」才算结构化表，
用户这张表表头是「事件描述」→ 识别失败 → 掉进"每行一句话"回退分支，
把标题、分类、地点全拼成一坨 —— 这就是"数据都是乱的"的来源。

**改造**：
- 导入改按**表头语义**认列（`findHeaderRow` + `mapHeaderCols` + `rowsToEventsByCols`），
  支持用户格式，也兼容工具自己的旧导出格式。
- 导出改成同一格式（说明行 + 五列表头 + `YYYYMMDD` 数字），可读、可再导入。
- 新增「地点」字段：表单输入框 / 时间轴 / 列表 / 按年视图 / 导入预览 全都显示。
- 导入时把表格里的自定义分类并入分类表（否则会被打成兜底分类「其他」）。
- 云端表格解析同步改造（不改会导致「地点」当标题、整体错位）。
- 「清空」连云端一起清（原来只清本机，云端合并是并集 → 刷新后旧数据全回来）。

**验证**（用用户真实表格跑）：

| 测试 | 结果 |
| --- | --- |
| `tools/test_v127_place.py` | 30/30 |
| `tools/test_v126_year.py` | 37/37 |
| `tools/test_skeleton_preview.py` | 23/23 |
| `tools/test_cat_color.py` | 39/39 |
| `tools/test_time_dedupe.py` / `_paths` / `_btn` | 19/19 · 12/12 · 16/16 |
| `tools/test_csp_sandbox.py` | 24/24 |

清空→重新导入实测：64 条 / 12 年 / 8 分类 / 16 个地点 / 零重复。

新增脚本：`tools/port_v127_place.py`（改造）、`tools/test_v127_place.py`（测试）。
回滚点：`_archived/v127/time.html.v36.bak`。

---

### v128(2026-11-18)· 图谱页还原为原本的力导向图

用户反馈「时间骨架图好丑」，要求还原回原本的力导向图（可拖拽、按分类联动）。

**做法**：以 `_archived/v126/time.html.v36-year.bak` 为基线 —— 那是「按年视图 + 全站统一分类色 +
**原本力导向图**」的最后一个好版本（骨架图改造之前），再把 v127 的地点字段与新表格格式导入导出叠加回去。

**结果**：
- 图谱页 = 原力导向图：大圆＝年份（大小按记录数）、中圆＝分类标签（各自分类色）、
  连线＝该年出现过该分类；按住拖拽按「跳数」分层联动、悬停出气泡、点分类筛选、点年份跳列表。
- 「按年」视图、全站统一分类色、地点字段、新表格格式导入导出 —— **全部保留**。
- 顺带修掉两个从旧基线带回来的缺陷：色盘弹层 HTML 重复插入（`#color-mask` 撞车 → 色盘打不开）、
  分类管理面板 DOM 与 CSS class 不匹配。

**验证**：

| 测试 | 结果 |
| --- | --- |
| `tools/test_v128_graph.py`（力导向图：渲染/拖拽/气泡/筛选/配色） | 21/21 |
| `tools/test_v127_place.py` | 30/30 |
| `tools/test_v126_year.py` | 37/37 |
| `tools/test_cat_color.py` | 39/39 |
| `tools/test_time_dedupe.py` / `_paths` / `_btn` | 19/19 · 12/12 · 16/16 |
| `tools/test_csp_sandbox.py` | 24/24 |

新增脚本：`tools/port_v128_restore_graph.py`、`tools/test_v128_graph.py`。
回滚点：`_archived/v128/time.html.v37-skeleton.bak`（骨架图版）、`_archived/v126/time.html.v36-year.bak`（力导向图基线）。

---

### v129(2026-11-18)· 修自定义分类颜色的两个问题

用户反馈两件事：
1. 自定义颜色后**无法确定**，只能选固定的两行预设色。
2. 问：改了既存分类的颜色，该分类在页面上会全部更新吗？

**问题 ① 的根因**：原生 `<input type="color">` 打开的系统取色器面板**盖住了弹层的「完成」按钮**，
而颜色保存绑定在 `onchange`（系统面板关闭时才触发）→ 选了色点不到确认 → 弹层卡死。

**问题 ② 的答案：原本不会全更新**。图谱页的 `gCatColor()` 只查 `CAT_COLOR` / `CAT_COLOR_DARK`
两张默认表，**不查用户自定义色映射** —— 实测同一分类：按年页 `#ff6683`、图谱页 `#e08ad2`。
其余位置（分类 chip / 分类管理色点 / 年份目录色带 / 按年统计条 / 按年事件色点）都走 `catColor()`，
所以它们是同步的，**只有图谱页漏了**。

**修复**：
- `gCatColor()` 直接走 `catColor()` → 图谱与全站一致（章节视图的 `CH_COLORS` 引用一并清掉）。
- 色盘改成**选色即生效**：取色器 `oninput` 实时预览并保存（页面立刻跟着变），
  `onchange` 落定并收起弹层；「完成」改为「关闭」，不再承担保存职责。
- 色盘新增「当前颜色」指示（色块 + 十六进制 + 提示），随时看得见现在是什么色。
- 改色后**自动重建图谱** —— 力导向图的节点颜色是建图时写进 SVG 的 `fill`，光重绘页面不重画它。

**验证**：

| 测试 | 结果 |
| --- | --- |
| `tools/test_v129_color.py`（色盘交互 + 全站同步 + 持久化） | 25/25 |
| `tools/test_v128_graph.py` | 21/21 |
| `tools/test_v127_place.py` | 30/30 |
| `tools/test_v126_year.py` | 37/37 |
| `tools/test_cat_color.py` | 39/39 |
| `tools/test_time_dedupe.py` / `_paths` / `_btn` | 19/19 · 12/12 · 16/16 |
| `tools/test_csp_sandbox.py` | 24/24 |

新增脚本：`tools/port_v129_color_fix.py`、`tools/test_v129_color.py`。
回滚点：`_archived/v129/time.html.v38.bak`。

---

### v130(2026-11-18)· 左栏「年份浏览」区域变短

用户反馈年份浏览「太长了」，并明确要求：**每一条的样式保持不变**，只是**年份浏览这个整体区域**改短，
且**保留滚动**。

所以本轮只改了一处：`.yr-dir` 的 `max-height`（`40vh` → `24vh`）。
行样式（年份 12.5px / 条数 10.5px / 色带 6px / ★ 10px、行内距 1px 7px）、
单列布局、`overflow-y: auto` 滚动、自定义滚动条**全部原样不动**。

实测：区域高 228px（内容 291px → 可滚动），行高仍是 24px，样式零变化。

新增脚本：`tools/port_v130_compact_year.py`。回滚点：`_archived/v130/time.html.v39.bak`。

---

# Planet 612 工具箱 · 安全修复替换包

打包日期:2026-11-11(第三轮 · 已对账真实源码)
用途:直接替换 GitHub 仓库 `Sumer0825/Sumer` 根目录下同名文件,然后手动 push。
包内文件:8 个 HTML + sw.js + manifest.json,共 10 个,均为仓库根级路径,文件名与仓库一致。

## 本轮共 3 个 zip(都在 `audit/` 目录下)

| zip | 内容 | 用在哪一步 |
| --- | --- | --- |
| `Planet612-security-fixes-20261111.zip` | 10 个修复文件 + 本说明 | 只更新代码、暂不动 `data/` 时用它(下方「建议的推送流程」) |
| `Planet612-data-private-20261111.zip` | `Sumer-data-private/data/` 共 6 个数据文件(177,827 B) | 「把 data/ 迁到私有仓库」第 2 步,喂给新建的私有数据仓 |
| `Planet612-pages-clean-20261111.zip` | `Sumer-clean/` 完整站点 32 个文件、**不含 `data/`**(2,000,083 B) | 同说明第 6 步,重建公开代码仓以清掉历史里的数据 |

三个包都已解压回读、逐文件 SHA-256 比对:修复包 11/11 与 `_package` 一致;数据包 6/6 与公开仓
当前 HEAD 的 blob 一致(且与独立下载一致);干净站包 32/32 一致 —— 其中 22 个(`assets/`、`lib/`、
`install.html`、`download.html`、`server.js`、`package*.json`)等于公开仓 HEAD,10 个等于本修复包,
`data/` 零条目、明文口令零命中。**若你走第 6 步,只用 `Planet612-pages-clean` 那一个包即可,不必再叠加修复包。**

> ✅ 基线已核实:本轮拿到你提供的完整源码包 `sumer-pages-web-v119`(含此前缺失的 `lib/`),
> 已用它作为权威基线,对本包 10 个文件逐行 diff。**每一处差异都是下列预期修复,无任何意外改动。**
> 该基线是**修复前**的原始代码(口令明文、无 CSP、无合并函数),因此本包是「原始源码 + 修复」,
> 不会覆盖掉你的其它改动。`lib/`(4 个)与 `assets/`(12 个)与基线**逐字节相同**,故不入包。
>
> 本轮(第三轮)相对上一版新增三件事:
> 1. **修正 `TOOLS_VER` 回退**(详见 index.html 一节)——上一版包里 storage/ledger 的版本号低于你的真实源码,会让访问者继续吃旧缓存;
> 2. **补齐依赖后重跑全部 Excel 与同步测试**——此前本地 `lib/xlsx.full.min.js` 被网络截断(489,334 B,真实 951,904 B),
>    导致上一轮的 Excel 测试实际跑在一个损坏的 SheetJS 上。现已换成完整库(XLSX 0.20.3)重测,结论见「验证结果」;
> 3. **补修 M2 的漏改分支**——weight / budget 同步面板的「连接」按钮上一版漏改,仍会整体覆盖本机数据;
>    换仓库、换设备时用户点的正是这个按钮,故列为本轮必修(详见对应小节)。

> 本轮(第二轮)在上一版 H1/M1/M3/L1–L6 基础上,补修 **M2、M4、M5**。
> Service Worker 缓存版本随之升到 `p612-v151`。
>
> **M5 写法说明(第二轮修订版)**:上一版曾把密码门改成「输入确认词」,现已全部回退为
> **密码验证门保留**,只是口令不再以明文写在源码里 —— 改为运行时解码(XOR),
> 解出的结果与你原来的口令完全一致,输入习惯不变。本说明文件也不再印出该口令。

## 逐文件改动

### index.html
- **L5**:`<head>` 内新增 Content-Security-Policy meta(GitHub Pages 无法设响应头,改用 meta)。
- **L5**:承载各工具的 `<iframe>` 增加 `sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads"`。
  说明:门户需要读 `contentDocument` 做「工具页被首页占用」的自愈判定,故必须带 `allow-same-origin`;
  这两个标志同时存在时 sandbox **不构成隔离边界**(浏览器会给出对应警告),它的实际收益是禁止弹窗、
  禁止顶层跳转等副作用。已实测七个工具在此 sandbox 下全部正常加载。
- **本轮修正 · `TOOLS_VER`**:你的真实源码为 `time 32 / weight 36 / budget 41 / storage 28 / ledger 20 / analysis 23 / daily 4`;
  上一版包误写成 `storage 27 / ledger 19`(低于真实值),会让这两页的自愈重试命中旧缓存。
  现统一改为**在真实基线上每项 +1**,并因第三轮 weight/budget 的「连接」补修再各 +1:
  `time 33 / weight 38 / budget 43 / storage 29 / ledger 21 / analysis 24 / daily 5`。

### weight.html(轻身时光簿)
- **M3**:`save()` 在 localStorage 写入失败时返回 `false`,`persist()` 据此中止并提示,不再出现"弹成功但没落盘"的假保存。
- **M2**:后台 `refresh()` 与同步设置面板的「连接」按钮(`gh-connect`)两处拉取路径都不再 `DATA = d` 整体覆盖。新增纯函数 `mergeWeightRecords()` 按「日期+时段」键做并集合并:保住本机未推送的记录、并入云端独有记录;同键冲突保留本机并计数提示;若本机有云端没有的改动则把并集回推云端收敛。
  > 第三轮补修:上一版只改了 `refresh()`,**「连接」按钮那条路径仍会整体覆盖** —— 而换仓库 / 换设备时用户点的正是这个按钮,云端若是旧副本就会把本机新录入的记录删掉。现已一并走合并。
- **M4**:读取 Token 时不再回落通用旧键 `gh_token` / `gh_cfg`,只认本机专用键 `weight_gh_token_v1` / `weight_gh_cfg_v1`(缩小泄露面)。断开时的 `removeItem('gh_token')` 清理保留(只删不读,无副作用)。
- **M5**:清空密码门**保留**,输入框仍是 `type="password"` / 6 位 / 掩码显示;口令常量改为运行时解码(`CLEAR_PW` 由 XOR 字节数组解出),源码内不再出现明文字面量。校验逻辑与错误提示("密码不对,请重试")与原版一致。
- **L5**:CSP meta。

### budget.html(刚需日用账)
- **M2**:后台 `refresh()` 与同步设置面板的「连接」按钮(`gh-connect`)两处拉取路径都改为按记录并集合并(新增 `bMergeArr()` / `bMergeData()`,三张表各自按主键合并:actuals=`日期+类型`、budgets=`月份+生效日`、monthlyBudgets=`月份`),合并结果过一遍 `normData()` 规整;保住本机未推送记录,冲突保留本机并提示,有独有改动则回推收敛。
  > 第三轮补修:同上 —— 「连接」按钮那条路径上一版漏改,仍会整体覆盖,现已走合并。
- **M5**:清空 / 月中解锁两处均**恢复密码验证**(提示语为「请输入密码继续」「请输入密码解锁」),输入框恢复 `type="password"`;口令同 weight 的非明文写法。
- **L5**:CSP meta。

### time.html(时光自撰集)
- **L2**:两处分类下拉 `<option>` 渲染(`openEdit` 与 `showImportPreview`)对分类名做 `esc()` 转义,堵住分类名 HTML 注入。
- **M5**:清空密码门**恢复密码验证**,提示语「请输入密码继续」,输入框恢复 `type="password"`;口令非明文。
- **L5**:CSP meta。

### storage.html(清居置物箱)
- **H1**:新增 `ID_RE` + `safeId()` 白名单,导入/同步时对位置、层、物品的 `id`/`levelId`/`locId` 做校验;渲染 `data-loc`/`data-lvl` 用 `esc()`。堵住属性位 id XSS。
- **L1**:`setSyncMsg` 改写真实存在的 `#sync-status` 元素,新增 `refreshSyncUI()` 与保护期,同步状态不再因引用不存在节点而崩。
- **M5**:删除位置 / 删除层 / 删除物品 / 清空本机四处**恢复密码验证**(错误提示 "密码错误,请重新输入"),输入框恢复 `type="password"`;口令非明文。
- **L5**:CSP meta。

### ledger.html(历年收支簿)
- **M1**:`ghPutContents` 增加 `retried` 标志,GitHub 422 分支最多重试一次,消除无限递归。
- **M5**:清空密码门**恢复密码验证**,输入框恢复 `type="password"`(并恢复等宽数字字体样式);口令非明文。
- **L5**:CSP meta。

### analysis.html(账单透视镜)
- **M5**:用户自设密码体系(随机盐 + SHA-256 迭代 3000 轮,只存哈希)不变;**应急通道已恢复** —— `PW_EMERGENCY` 重新参与 `pwCheck()` 校验,但改以 XOR 字节数组运行时解码的形式存储,源码内无明文字面量;**「关闭保护」恢复为需要验证密码**(先弹密码框,密码不对则不解除),避免他人随手关掉保护;页面提示不再印出口令本身。
- **L5**:CSP meta。

### daily.html(随手记簿,隐藏工具)
- **L3**:列表项 `data-id` / `data-del` 用 `esc()` 转义(含单引号),堵住属性注入。
- **L5**:CSP meta。

### sw.js(Service Worker)
- **L4**:预缓存由 `c.addAll(CORE)` 改为逐个 `c.add(u).catch(()=>{})`,单个资源 404 不再令整个 SW 安装失败。
- **L4**:页面缓存写入键改为 `url.origin + url.pathname`(剥掉 query),避免自愈重试的 `?r=时间戳` 让缓存条目无限膨胀。
- **L4**:只缓存 `r.ok` 的响应,404/500 不再被永久缓存。
- **L4**:匹配增加 `caches.match(req,{ignoreSearch:true})` 兜底,使带 `?v=` 的资源(门户背景 `assets/bg.jpg?v=2`)能命中预缓存的无 query 副本。
- `CORE` 补入 `./assets/bg.jpg`(门户背景此前未预缓存,离线首屏无背景)。
- 缓存版本:你的真实源码为 `p612-v148`,本包升到 **`p612-v152`**(HTML 有改动,促使客户端换新)。

### manifest.json
- **L6**:`"id"` 由 `/Planet612/` 改为 `./`,与 `start_url`/`scope` 一致(PWA 安装身份匹配)。

## 验证结果(第三轮 · 依赖补齐后重测)

**密码门(六处)**
- `CLEAR_PW` / `PW_EMERGENCY` 运行时解码结果与原口令逐字符一致(6 位),全站源码已无该口令的明文字面量;
- 浏览器逐页实测:弹窗可打开、输入错误口令被拒(提示文案正确且弹窗不关闭)、输入正确口令放行;
- analysis 全链路:设密码 → 「关闭保护」弹密码框 → 错密码不解除 → 应急口令可解除,均通过。

**Excel 读写(用完整 SheetJS 0.20.3 重跑)**
- weight:导出→读回 3 条,日期/时段/体重/备注全一致,非法行被丢弃。已知传输限制:`goal`(目标体重)不在 Excel 列里,读回时由本机 `goalOf()` 回填;
- budget:金额全一致;M2 合并语义实测 —— 云端独有记录被并入(added=1)、同键冲突保留本机(金额仍为本机值)且计入 conflicts;
- time:三张工作表 `events / 规则 / 分类` 齐全,读回 2 条标题/日期/分类一致,规则词表随文件往返成功;
- ledger:账单表识别正确,解析 3 条,金额 `[32.5, 8000, 6]`、收支类型 `["out","in","out"]` 全对;
- ledger M1:桩造 422 响应,`fetch` 恰好被调用 **2 次**后抛错(不再无限递归)。

**「连接」按钮的合并语义(第三轮补修后实测)**

桩造「云端是旧副本」场景:本机有云端缺的独有记录 + 一条同键不同值的冲突记录,云端另有本机缺的记录。

- weight:合并后 3 条 —— 本机独有保留、同键冲突保留本机(权重仍为本机值)、云端独有并入;并集回推云端 **1 次**(推送内容 3 条),本机缓存同步落盘 3 条;提示「连接成功,合并后共 3 条(本机独有 1 条已保留并回推)(1 处同日冲突保留本机)」;
- budget:实际记录 3 条同上;预算段按 `月份+生效日` 合并为本机 1 + 云端 1 = 2 段(不同生效日是不同段,都保留)、月度预算 2 条;冲突保留本机金额 99.9;并集回推 1 次。

**注入与存储**
- time L2:恶意分类名渲染为纯文本,未生成 `img` 节点,XSS 标记未被触发;
- storage H1:非法 id(含 `" < >`)一律被判为非法数据丢弃,合法 uid 全部放行;非法外键回落为空;
- storage CRUD:真实 IndexedDB 下新建/改名/防重复/删除全通过,存储模式横幅正确显示「本机浏览器(IndexedDB)」。

**门户与依赖**
- 七个工具在带 sandbox 的 iframe 中全部加载成功(`healTry=0`,无「被门户首页占用」误判,无错误面板);
- 26 个网络请求全部 200,`lib/`(flatpickr css/js、zh.js、xlsx)与 `assets/`(bg.jpg 及各工具背景)全部命中,控制台零报错;
- 九个 HTML + sw.js 的全部内联脚本经 `vm.Script` 语法解析,零错误。

**对账与打包校验方法(已纠正)**
- 与你提供的 `sumer-pages-web-v119/site` 逐文件 SHA-256 + 逐行 diff:17 个文件逐字节相同(全部 lib/assets/install.html),
  10 个文件有差异且差异全部为预期修复;
- 上一轮用 `certutil -hashfile` 做哈希比对曾给出**假「一致」**(把截断的 xlsx 判为相同),该方法已弃用;
  本轮全部改用 Node `crypto.createHash('sha256')` 重算,zip 解包后与打包源逐文件比对。

## 修复边界(诚实告知,仍需你决策)

- **C1 公开数据暴露(高危)**:仓库为 **public**,站点纯前端,工具会把 localStorage 数据经用户自备的 GitHub Token 同步进仓库文件。**代码修不了这个**。
  可行解法是把 `data/` 迁到**单独的私有数据仓**(代码仓仍公开) —— 注意「直接把 `Sumer` 转私有」这条路走不通,见下方「把 data/ 迁到私有仓库」。
- **M4 只能缓解,不能根治**:GitHub Token 存在浏览器 localStorage 里、由纯前端直接调用 GitHub API,是"无后端的静态站"这种架构的固有结果。本轮已去掉跨工具共享旧键、收紧了 XSS 面(H1/L5),但**要做到 Token 不落地前端,需要一层后端代持或改私有仓库 + 受限 fine-grained PAT**。
- **M5 现状与残余风险**:密码门全部保留,口令已从源码明文中移除(改为运行时 XOR 解码),公开仓库里不再能直接读到它。
  但这**不改变纯前端密码门的性质** —— 由页面自身校验,拿到站点文件的人调试运行时仍可取得解码结果,绕过成本只是变高而非消失。
  它挡住的是「顺手误操作」与「从源码直接读口令」,挡不住有决心的攻击者;真正要防住仍需私有仓库或后端参与校验。
- M2 的跨设备**同一记录被两端同时改**这种真冲突,因 Excel 传输不带逐条时间戳,合并策略是"保留本机 + 提示",不静默丢弃;若将来要在 Excel 里加"修改时间"列即可升级为按时间戳择优。

## 把 data/ 迁到私有仓库(C1 的实际处置)

**为什么不能只把 `Sumer` 转私有**:GitHub 官方文档写明 —— 私有仓库发 Pages 需要 Pro/Team/Enterprise;
而即使能发,**发布出来的站点仍是公开的**(「私有发布」即 access control for GitHub Pages 仅 Enterprise Cloud 提供)。
你的 `data/*` 正好在 Pages 的发布目录里,所以仓库转私有并不会让数据变私有,免费计划下反而会让站点直接下线。

**做法:代码仓保持公开,数据单独放一个私有仓(不开 Pages)。零代码改动** —— 七个工具的
「仓库 owner / 仓库名 / 分支 / 保存路径」都是界面上可填的字段。

当前公开暴露的文件(`https://sumer0825.github.io/Sumer/data/…`,实测状态码 200):

| 文件 | 字节 | 写入工具 |
| --- | --- | --- |
| `data/ledger.json` | 1,679,130 | 历年收支簿 |
| `data/time.xlsx` | 58,138 | 时光自撰集 |
| `data/budget.xlsx` | 35,206 | 刚需日用账 |
| `data/weight.xlsx` | 44,027 | 轻身时光簿 |
| `data/analysis-marks.json` | 32,453 | 账单透视镜 |
| `data/storage.json` | 212 | 清居置物箱 |

### 需要迁移的 6 个文件(已逐字节取自公开仓当前 HEAD,SHA-256 供上传后比对)

| 文件 | 字节 | 写入工具 | SHA-256(前 20) |
| --- | --- | --- | --- |
| `data/ledger.json` | 1,679,130 | 历年收支簿 | `29f3efc8bd2261384627` |
| `data/time.xlsx` | 58,138 | 时光自撰集 | `57bc94c3dbacf7a51b4f` |
| `data/budget.xlsx` | 35,206 | 刚需日用账 | `ccdc57ca43c5cb4d44c9` |
| `data/weight.xlsx` | 44,027 | 轻身时光簿 | `22913a2cdd78a8a98845` |
| `data/analysis-marks.json` | 32,453 | 账单透视镜 | `504f85ec40bc1fc71af5` |
| `data/storage.json` | 212 | 清居置物箱 | `35c65cce8f4176a73542` |

这 6 个文件已单独打成 **`Planet612-data-private-20261111.zip`**(解压即为 `data/` 目录,可直接提交)。

### 迁移步骤(按顺序,先喂数据、再切配置、最后清公开仓)

**第 1 步 建私有数据仓**

GitHub 右上角 `+` → `New repository`:
- Owner `sumer0825`,Repository name `Sumer-data`(名字随意,下面配置要一致);
- **Private** 选中;
- ✅ **不要**勾 "Add a README";✅ **不要**勾 "Add .gitignore";✅ **不要**勾 "create a template";
  也就是建一个**空仓**。建完停在 "…or push an existing repository from the command line" 这一页即可。
- 建好后 **不要**去 Settings → Pages 开 Pages:一旦开了 Pages,私有仓的文件就又变公开了(而且免费计划开不了)。

**第 2 步 把 6 个文件推上去**(两条路任选)

```bash
cd <解压出来的 Sumer-data-private 目录>
git init -b main
git config core.autocrlf false     # 关键:否则 git 会把 LF 改成 CRLF,文件字节数变大
git add -A
git commit -m "Planet 612 data"
git remote add origin https://github.com/Sumer0825/Sumer-data.git
git push -u origin main            # 认证用下面第 3 步的 PAT,不是账号密码
```

不想用命令行的话:在空仓页面 `Add file` → `Upload files`,把解压出来的整个 **`data` 文件夹**拖进去,
`Commit changes`。**拖完必须在仓库里确认路径真是 `data/ledger.json` 而不是根目录的 `ledger.json`** ——
网页上传对「整个文件夹」的路径保留不如命令行可靠;若落到了根目录,就在仓库里新建 `data` 目录把它们移进去,
或直接删掉这次提交改用上面的 `git push` 重来。
上传后还要确认 6 个文件大小与上表逐字节一致(`ledger.json` 必须是 1,679,130,若显示 1,686,042 就是被换行符改过了,删掉重传)。

**第 3 步 签发受限 PAT**

Settings → Developer settings → **Personal access tokens → Fine-grained tokens** → `Generate new token`:
- Token name:`planet612-data`;Expiration:选一个日期(建议 90 天,到期再换);
- Repository access:**Only select repositories** → 只勾 `Sumer0825/Sumer-data`(**不要** All repositories);
- Permissions → **Contents**: `Read and write`;其余全留 No access(不需要 `Delete commits` 之类);
- 生成后复制那串 `github_pat_…`。

为什么用 fine-grained 而不是 classic `ghp_…`:classic 是账号级全量写权限,一旦泄露能改你所有仓库;
fine-grained 能把爆炸半径压到「只有这一个数据仓的 Contents」。

**第 4 步 逐个工具改同步配置**(7 个工具,每台设备/每个浏览器都要做一遍)

各工具都有 owner / 仓库名 / 分支 / Token 输入框(账单透视镜没有路径框,路径由白名单固定),
按下表改**仓库名**这一项(分支、路径都不用动),然后按「哪个按钮保存」点一下:

| 工具 | gh-owner | gh-repo | gh-branch | gh-path(保持不变) | 本机配置键 | 保存按钮 |
| --- | --- | --- | --- | --- | --- | --- |
| 轻身时光簿 | `sumer0825` | `Sumer-data` | `main` | `data/weight.xlsx` | `weight_gh_cfg_v1` + Token 另存 `weight_gh_token_v1` | 「保存并连接」`gh-connect` |
| 刚需日用账 | `sumer0825` | `Sumer-data` | `main` | `data/budget.xlsx` | `budget_gh_cfg_v1` | 「保存并连接」`gh-connect` |
| 时光自撰集 | `sumer0825` | `Sumer-data` | `main` | `data/time.xlsx` | `time_gh_cfg_v1` | 「保存并连接」`sync-save` |
| 清居置物箱 | `sumer0825` | `Sumer-data` | `main` | `data/storage.json` | `storage_gh_cfg_v1` | 「保存并连接」`gh-connect` |
| 历年收支簿 | `sumer0825` | `Sumer-data` | `main` | `data/ledger.json` | `ledger_gh_cfg_v1` | 「保存并连接」`gh-connect` |
| 账单透视镜 | `sumer0825` | `Sumer-data` | `main` | 固定 `data/analysis-marks.json`(无输入框,改路径会被白名单拦回) | `analysis_gh_cfg_v1` | 「保存配置」`mk-save`(此页字段是 `mk-*`,不是 `gh-*`) |
| 随手记簿(隐藏) | `sumer0825` | `Sumer-data` | `main` | `data/daily.xlsx` | `daily_gh_cfg_v1` | 「保存并连接」`sync-save` |

点「保存并连接」/「保存配置」之后工具会立刻拉一次新仓。**本包已把 weight/budget 的「连接」按钮也改成并集合并**
(原实现是 `DATA = d` 整体覆盖,切仓库时会把本机尚未推送的记录删掉),所以现在连新仓不会丢本机数据。
- 云端还没有某个文件(如随手记簿的 `data/daily.xlsx`)时,提示「云端暂无…首次保存将自动创建」,属正常;
- 连上后核对每个工具的记录条数与迁移前一致,再随手存一条确认能写入。

**第 5 步 撤销旧 Token**

Settings → Developer settings → Personal access tokens → 找到原来那个能写 `Sumer` 的 Token → `Delete / Revoke`。
它此前落在各设备的 localStorage 里,撤销是让它失效的唯一办法。撤销后再回工具点一次「连接」,
若报 401 说明第 4 步填的还不是新 Token。

**第 6 步 清掉公开仓里的 `data/`(这步不可逆)**

只 `git rm -r data` 再提交**没用**:旧 commit 还在历史里,
`https://raw.githubusercontent.com/Sumer0825/Sumer/<旧sha>/data/ledger.json` 依旧能下载。
要断掉,必须让公开仓的历史里不再存在那些 commit。本机没有 Python / git-filter-repo / Java BFG,
所以用**等价且更省事**的办法:重建一份只含单个 commit 的仓库内容(已备好,零历史)。

两条路:

- **A. 删仓重建(推荐,能把旧对象一起清掉)**
  公开仓 `Sumer` → Settings → Danger Zone → `Delete this repository`。
  然后 `New repository` 用**同名** `Sumer`、**Public**、不勾任何初始化选项,再:

  ```bash
  cd <解压出来的 Sumer-clean 目录>
  git init -b main
  git config core.autocrlf false
  git add -A
  git commit -m "Planet 612 toolbox"
  git remote add origin https://github.com/Sumer0825/Sumer.git
  git push -u origin main
  ```

  推完到 Settings → Pages → Build and deployment:Source 选 `Deploy from a branch`,
  Branch 选 `main` / `/ (root)` → Save,等 1-2 分钟站点回来(URL 不变,因为 owner/repo 同名)。

- **B. 保留仓库,强推改写后的历史**
  同上解压 `Sumer-clean` 并 `git init/commit`,然后
  `git push -f origin main`(先 `git remote add`)。
  差别:旧的 commit 变成游离对象后,在 GitHub 上**按 SHA 仍可能读到一段时间**,要彻底得联系 GitHub Support
  请求清除游离对象。所以 A 比 B 干净。

`Sumer-clean` 就是当前公开仓 HEAD 去掉 `data/` 之后、再把本包 10 个修好的文件覆盖进去的结果 ——
已逐字节校验:32 个文件里 22 个(`assets/`、`lib/`、`install.html`、`download.html`、`server.js`、`package*.json`)
与公开仓 HEAD 的 blob 完全一致,10 个与 `_package` 完全一致;`data/` 一个都没有;全站搜不到明文口令。
所以走第 6 步时**不必**再单独应用本包的 10 文件(它们已经在里面了)。

**第 7 步 收尾**

- 线上站点清一次 Service Worker 缓存(或等 `p612-v152` 自动接管);
- 在旧设备上点一次「连接」,确认能读到新仓数据(配置键是按浏览器存的,没重配的设备会继续
  尝试写公开仓的 `data/…`,而那个 Token 已撤销,写会失败并提示 —— 属于预期,重配即可)。

**诚实边界**:这些文件此前长期公开可下载,也可能已被爬取或被人 fork。清历史只能阻断后续访问,
**不能把已发生的读取撤回** —— 体重、账单、时间轴这些内容应按「已经泄露」来评估(是否要改其中的敏感条目、
是否担心被关联到你本人)。删仓重建后仍要留意:**已经存在的 fork 不会被删除**,可在 `Sumer` 的 `Forks`
页看有没有;若数据敏感度高,建议顺带把 `data/ledger.json` 里不想留的条目在**新仓**里改掉。
若希望即使数据仓泄露也读不到内容,可在此基础上再加一层提交前加密
(WebCrypto AES-GCM + 口令派生),代价是云端表格不能再直接用 Excel 打开看。

## 建议的推送流程(供参考)

1. 把包内 10 个文件解压覆盖到你本地 clone 的仓库根目录(CHANGES.md 是说明,不必上传);
   `lib/` 与 `assets/` **不用动**(与你的源码逐字节相同,未做任何修改);
2. `git status` + `git diff` 复核改动是否只有预期内容(本包已对账 v119 源码,差异应与上面「逐文件改动」一一对应);
3. 本地打开 `index.html` 或起本地静态服务器,过一遍七个工具确认无回归(重点试:录入后切设备同步、清空/删除时的密码门、账单透视镜的「关闭保护」需密码);
4. `git add` → `git commit` → `git push`;
5. push 后到线上站点清一次 Service Worker 缓存(或等 `p612-v152` 自动接管)。
