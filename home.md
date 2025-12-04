开发 iPad 应用的 HTML/CSS 页面时，为了完美还原“蛋仔专注岛”的治愈可爱风格，你需要准备以下详细的 UI 元素清单和 CSS 属性值。

鉴于你的开发者身份，我将以**Design Token (设计变量)** 和 **组件规范** 的形式提供数据，你可以直接将这些值填入 CSS 变量或 Tailwind 配置中。

### 1\. 核心设计系统 (Design System)

首先定义全局样式变量，这是确立风格的基础。

#### 🎨 色彩规范 (Color Palette)

| 变量名 | 色值 (HEX/RGBA) | 说明 |
| :--- | :--- | :--- |
| `--bg-canvas` | `#FFFDF5` | **全局背景色**：极浅的奶油黄，护眼且温暖。 |
| `--bg-panel` | `#A0D8C5` | **右侧控制台背景**：清新的薄荷绿 (参考图中的面板)。 |
| `--color-primary` | `#FFD54F` | **主色/按钮**：暖蛋黄色，用于大按钮。 |
| `--color-primary-dark`| `#FFB300` | **按钮阴影/深色**：用于按钮的立体厚度效果。 |
| `--color-accent` | `#FF8A65` | **强调色**：用于小红点或重要提示（如珊瑚粉）。 |
| `--text-main` | `#5D4037` | **主文字**：深咖啡色，比纯黑更柔和。 |
| `--text-secondary`| `#8D6E63` | **次级文字**：浅咖啡色，用于占位符或辅助说明。 |
| `--glass-white` | `rgba(255, 255, 255, 0.6)` | **毛玻璃白**：用于卡片背景，带半透明。 |

#### 🔡 字体与圆角 (Typography & Radius)

  * **Font Family:** 推荐使用圆体字以配合可爱风格。
      * iOS/Web: `"Rounded Mplus 1c"`, `"Nunito"`, `"PingFang SC Rounded"`, `"Hiragino Maru Gothic ProN"`, sans-serif.
  * **Border Radius:**
      * `--radius-xl`: `32px` (用于大卡片、大按钮)
      * `--radius-lg`: `24px` (用于输入框)
      * `--radius-md`: `16px` (用于时间选择气泡)
      * `--radius-full`: `999px` (用于胶囊形状)

-----

### 2\. 布局结构 (Layout Structure)

iPad 横屏通常分辨率为 1024px 宽以上。

  * **容器 (Container):** `display: flex; width: 100vw; height: 100vh;`
  * **左侧场景 (Scene Area):** `flex: 1.2;` (占比约 55%)
      * 需要一张透明背景的 PNG 图片：`egg-island-scene.png` (包含蛋仔和岛屿)。
      * CSS: `background-image: url(...); background-size: contain; background-position: center;`
  * **右侧控制台 (Control Panel):** `flex: 0.8;` (占比约 45%)
      * `background-color: var(--bg-panel);`
      * `padding: 40px;` (留足呼吸感)
      * `display: flex; flex-direction: column; justify-content: center;`

-----

### 3\. UI 组件与具体值 (Components & Values)

这里是构建右侧面板所需的 4 个核心组件的具体 CSS 样式建议。

#### A. 顶部金币胶囊 (Coin Capsule)

*参考右上角的胶囊设计*

  * **HTML:** `div.capsule > img.icon + span.amount`
  * **Size:** `height: 64px;`
  * **Background:** `rgba(255, 255, 255, 0.4)` (半透明)
  * **Border:** `2px solid #FFFFFF`
  * **Shadow:** `box-shadow: 0 4px 12px rgba(0,0,0,0.05);`
  * **Content:** Flexbox 居中，Icon 宽度 `40px`。

#### B. 专注设置卡片 (Focus Setup Card)

*包含输入框和时间选择的白色容器*

  * **Background:** `var(--glass-white)`
  * **Backdrop Filter:** `backdrop-filter: blur(10px);` (关键：毛玻璃效果)
  * **Padding:** `32px`
  * **Margin-Bottom:** `30px`
  * **Shadow:** `box-shadow: 0 8px 32px rgba(93, 64, 55, 0.1);`

#### C. 交互元素细节 (Inputs & Bubbles)

**1. 任务输入框 (Task Input):**

  * **Height:** `60px`
  * **Background:** `#FFFFFF`
  * **Border:** `none` (或者极淡的 `2px solid #F0F0F0`)
  * **Text Size:** `18px`
  * **Placeholder Color:** `var(--text-secondary)`

**2. 时间选择气泡 (Time Bubbles):**

  * **Size:** `width: 70px; height: 70px;` (圆形)
  * **Default State:**
      * Bg: `rgba(255,255,255, 0.5)`
      * Text: `var(--text-secondary)`
  * **Active State (选中):**
      * Bg: `var(--color-primary)`
      * Text: `var(--text-main)`
      * Border: `3px solid #FFFFFF`
      * Transform: `scale(1.1)` (放大效果)

#### D. 巨型行动按钮 (Giant Action Button)

*底部的“投入孵化”按钮，这是点击率最高的地方*

  * **Width:** `100%`
  * **Height:** `88px` (iPad上便于手指点击的大尺寸)
  * **Background:** `linear-gradient(180deg, #FFD54F 0%, #FFCA28 100%)`
  * **Border:** `4px solid #8D6E63` (模拟卡通描边，可选) 或 `none`
  * **Border Radius:** `44px` (完全圆角)
  * **立体效果 (3D CSS):**
    ```css
    box-shadow: 
        inset 0 4px 0 rgba(255,255,255, 0.4), /* 顶部高光 */
        0 6px 0 var(--color-primary-dark),    /* 底部厚度 */
        0 12px 20px rgba(93, 64, 55, 0.2);    /* 投影 */
    ```
  * **Active State (按下):**
      * `transform: translateY(6px);`
      * `box-shadow: inset 0 4px 0 rgba(255,255,255, 0.4), 0 0 0 var(--color-primary-dark);` (按下去阴影消失)

-----

### 4\. 需要切图的资源清单 (Assets List)

你需要准备以下 PNG/SVG 图片资源：

1.  **`bg-texture.png`**: (可选) 给奶油色背景增加一点点纸质纹理，透明度 5%。
2.  **`egg-island-hero.png`**: 左侧的主图，包含漂浮的岛屿和蛋仔。
3.  **`icon-coin.png`**: 金币图标。
4.  **`icon-capsule-bg.png`**: (可选) 如果不想用 CSS 画胶囊，可以直接切图。
5.  **`icon-play.svg`**: 按钮上的播放三角图标。
6.  **`deco-cloud.png`**: 几朵不同形状的云，用于 CSS 动画漂浮。

### 💡 开发小贴士

  * **Flex Gap:** 使用 `gap: 20px` 属性来控制按钮和输入框之间的间距，比使用 margin 更现代且容易维护。
  * **Safe Area:** 在 iPad 上开发记得考虑底部的 Home Bar，给底部容器加上 `padding-bottom: env(safe-area-inset-bottom);`。
  * **Touch:** 给所有可点击元素加上 `cursor: pointer` 和 CSS Active 缩放效果，增加点击的“肉感”反馈。

  针对移动端竖屏（Mobile Portrait）布局，我们需要将 iPad 的“左右分栏”转换为\*\*“垂直堆叠 (Vertical Stack)”\*\*结构。

核心思路是：**上部展示场景（沉浸感），下部聚合操作（易触达）**。为了适应手机单手操作，我们将操作面板设计为一个**底部抽屉 (Bottom Sheet)** 的形态。

以下是移动端竖屏的布局规范和 CSS 参数：

### 1\. 布局结构图示 (Layout Structure)

页面分为三个层级 (`z-index` 由低到高)：

1.  **背景层:** 全局奶油色背景 + 顶部云朵装饰。
2.  **场景层 (Top Area):** 蛋仔和岛屿，占据屏幕上半部分 (约 45%)。
3.  **操作层 (Bottom Sheet):** 白色圆角面板，包含所有交互组件，占据下半部分 (约 55%)。

-----

### 2\. 核心容器 CSS (Mobile Container)

```css
.mobile-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-canvas); /* #FFFDF5 */
  position: relative;
  overflow: hidden;
}
```

-----

### 3\. 各区域 UI 规范与数值

#### A. 顶部导航栏 (Top Navbar)

悬浮在最上方，不占用布局流，为了保持场景完整性。

  * **Position:** `absolute; top: 0; left: 0; width: 100%;`
  * **Padding:** `16px 20px` (考虑刘海屏，需加 `padding-top: max(20px, env(safe-area-inset-top));`)
  * **元素:**
      * 左侧: Logo Icon (32px)
      * 右侧: 汉堡菜单 Icon (24px)
  * **注意:** 手机端空间有限，**不建议**把大的“金币胶囊”放在这里，会抢视觉。

#### B. 场景展示区 (Hero Scene)

  * **Height:** `42vh` (视口高度的 42%)
  * **Align:** `display: flex; align-items: center; justify-content: center;`
  * **Image:** 蛋仔岛屿图片宽度约为屏幕宽度的 `80%`。
  * **动画:** 给岛屿加上上下浮动动画 (`animation: float 6s ease-in-out infinite;`)。

#### C. 金币悬浮窗 (Floating Coin Capsule)

*为了增加层次感，我们将金币胶囊放在场景和操作面板的交界处，或者作为场景的一部分。*

  * **Position:** 位于场景区右下角，或者正居中悬浮在操作面板上方。
  * **推荐位置:** `absolute; right: 20px; top: 12vh;` (避开中间的蛋仔)。
  * **样式:** 与 iPad 版一致，但尺寸缩小 0.8 倍。
      * `height: 48px;`
      * `font-size: 16px;`

#### D. 底部操作面板 (Control Sheet)

这是移动端的核心。它像一张卡片从底部升起，稍微盖住一点背景。

  * **Geometry:**
      * `flex: 1;` (占据剩余空间)
      * `background: #FFFFFF;` (或极淡的 `rgba(255,255,255, 0.9)` + backdrop-filter)
      * `border-radius: 32px 32px 0 0;` (仅左上和右上圆角)
      * `padding: 32px 24px;`
      * `padding-bottom: calc(20px + env(safe-area-inset-bottom));` (**关键：** 避开 iPhone 底部横条)
      * `box-shadow: 0 -10px 40px rgba(93, 64, 55, 0.08);`

#### E. 面板内组件布局 (Panel Components)

在底部面板中，元素垂直排列：

1.  **引导文案 (Guide Text):**

      * `text-align: center; margin-bottom: 24px;`
      * Text: "准备好开始新的挑战了吗？" (Color: `--text-secondary`, Size: `14px`)

2.  **任务输入框 (Task Input):**

      * `width: 100%;`
      * `height: 56px;`
      * `background: #F5F5F5;` (比背景稍深一点的灰色，突出输入区)
      * `border-radius: 16px;`
      * `margin-bottom: 24px;`

3.  **时长选择器 (Time Selector - Mobile Optimized):**

      * iPad 是横排气泡，手机端建议使用 **"横向滚动容器 (Horizontal Scroll)"** 或 **"Grid 网格"**。
      * **推荐方案 (Flex Scroll):**
          * `display: flex; gap: 12px; overflow-x: auto;`
          * `padding-bottom: 8px;` (防止滚动条遮挡)
          * **气泡尺寸:** `min-width: 64px; height: 64px;` (稍微小一点)

4.  **开始按钮 (Main Action Button):**

      * `width: 100%;`
      * `height: 80px;` (比 iPad 略小，但仍要霸气)
      * `margin-top: auto;` (使用 `margin-top: auto` 把它顶在面板最底部)
      * `font-size: 20px; font-weight: 800;`

-----

### 4\. 适配代码片段 (CSS Snippet)

```css
/* 针对移动端的特定调整 */
@media (max-width: 768px) {
    :root {
        --radius-panel: 32px;
    }

    /* 底部面板容器 */
    .control-sheet {
        background: white;
        border-radius: var(--radius-panel) var(--radius-panel) 0 0;
        padding: 30px 24px;
        
        /* 布局逻辑 */
        display: flex;
        flex-direction: column;
        align-items: center;
        
        /* 确保在大屏手机上不要拉得太长，而在小屏上允许滚动 */
        max-height: 60vh; 
        min-height: 45vh;
        
        /* 底部安全区适配 */
        padding-bottom: max(24px, env(safe-area-inset-bottom));
    }

    /* 时间选择器 - 手机端横向排列 */
    .time-selector-row {
        display: flex;
        width: 100%;
        justify-content: space-between; /* 或者 space-around */
        margin-bottom: 30px;
    }
    
    .time-bubble {
        width: 60px;
        height: 60px;
        font-size: 14px;
        border-radius: 20px; /* 稍微方一点的圆角在手机上更省空间 */
    }
}
```

### 总结 UI 元素差异

| 元素 | iPad (横屏) | Mobile (竖屏) |
| :--- | :--- | :--- |
| **整体结构** | 左右分栏 (55% / 45%) | 上下堆叠 (Hero / Sheet) |
| **操作面板** | 右侧独立悬浮卡片 | 底部抽屉 (Bottom Sheet) |
| **金币展示** | 右上角胶囊 | 场景内悬浮 或 面板顶部嵌入 |
| **开始按钮** | 88px 高 | 80px 高，位于屏幕最底端 |
| **安全区** | 关注四周 margin | **重点关注底部 Home Indicator** |