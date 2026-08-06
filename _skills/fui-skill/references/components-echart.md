# f-echart — Biểu đồ ECharts V5 (Core)

> File này sở hữu: **`f-echart` core: import, kiến trúc, props, config, theme, DataView, lỗi thường gặp**. Template từng loại chart xem [echart-templates.md](echart-templates.md).

Dùng `f-echart` cho mọi loại biểu đồ: bar, line, pie, scatter, gauge, radar, heatmap, sankey, tree, map, graph...

File này là **core**: import, kiến trúc, props, config, theme, DataView, events, lỗi thường gặp. **Template từng loại chart + các pattern module.json** đã tách sang [echart-templates.md](echart-templates.md) — load thêm khi đã biết cần vẽ loại chart nào.

---

## Import — Bắt buộc, đúng thứ tự

`f-echart` yêu cầu 2 file JS nền tảng. Không có → component không tồn tại, trang trắng.

```
1. /include/chart/echarts.min.js   ← ECharts core (phải đứng TRƯỚC)
2. /include/chart/fechart.js       ← FUI wrapper (phải đứng SAU)
```

Quy trình `file_import_list` → `file_import_new` → `file_import_delete`: xem
[component-quickref.md](component-quickref.md). **Điểm đặc thù của f-echart** — sort number quyết
định thứ tự load, và `fechart.js` phụ thuộc biến `echarts` global nên **PHẢI có sort lớn hơn**
`echarts.min.js` (ví dụ `echarts.min.js` = 100, `fechart.js` = 110).

---

## Kiến trúc — Direct Mode

`f-echart` **xây dựng hoàn toàn trên Apache ECharts V5** (echarts.apache.org). `fechart.js` chỉ là lớp bọc mỏng: nạp theme, vài shortcut trong `config`, DataView, events. **Mọi thứ trong `option` chính là ECharts option** — khi cần cấu hình chart, **dùng thẳng kiến thức Apache ECharts** (option, series, axis, visualMap, dataZoom...); chỉ `config` là shortcut riêng của FUI.

`f-echart` là **Direct Mode only**. Bạn viết ECharts `option` trực tiếp — không có Auto mode, không có `config.type`.

| Prop | Vai trò |
|---|---|
| `option` | **Primary** — full ECharts option, truyền thẳng vào `echarts.setOption()`. Dùng kiến thức Apache ECharts |
| `config` | Meta/shortcut riêng FUI: height, theme, title, toolbox... Là defaults, bị `option` merge đè |

**Thứ tự merge:** `config` xây base → `option` merge đè lên.
- Arrays → **replace** (`series`, `color`, `xAxis`, `yAxis`, `grid`, ...)
- Plain objects → **deep-merge**
- Primitives → **replace**

---

## Quy ước hiển thị MẶC ĐỊNH (làm đúng ngay từ đầu, không chờ user nhắc)

Đúc kết từ các yêu cầu chỉnh sửa lặp lại nhiều lần của user thật. Áp dụng mặc định cho mọi chart mới/refactor — chỉ bỏ qua khi user yêu cầu rõ kiểu khác:

1. **Luôn hiển thị giá trị trên chart** — bar: `label: { show: true, position: 'top' }` (horizontal bar → `position: 'right'`); line: `label: { show: true, position: 'top' }`.
2. **Grid padding**: `grid: { left: 20, right: 20, containLabel: true }` — top/bottom để mặc định. Không để chart dư khoảng trống lớn hai bên.
3. **Số hiển thị đầy đủ** có phân cách nghìn (`1,500,000`) — không rút gọn `1.5M`/`1.2k` trừ khi user yêu cầu (mặc định `formatFull` của tooltip đã đúng — đừng override).
4. **Pie**: không để labelLine ("râu") dài rối; label ngắn gọn (tên + % nếu cần) hoặc dồn thông tin về legend + tooltip.
5. **Không tự dựng nút "Xem dữ liệu"** — dùng `config.dataView: true` có sẵn của f-echart.

---

## Props

| Prop | Type | Default | Mô tả |
|---|---|---|---|
| `config` | Object | `{}` | Shortcut settings |
| `option` | Object | `{}` | Full ECharts option — primary |

> Component chỉ có 2 props: `config` và `option`. **Không có `data` prop.**

---

## config keys

| Key | Type | Default | Mô tả |
|---|---|---|---|
| `height` | number\|string | `400` | Số = `px`; string = `'50vh'`... |
| `theme` | string\|null | `'fui'` | Theme: `'fui'`\|`'shine'`\|`'v5'`; `null` = không dùng theme |
| `backgroundColor` | string | `'transparent'` | Override background |
| `title` | string | | → `option.title.text` |
| `subtitle` | string | | → `option.title.subtext` |
| `titleLeft` | string | `'left'` | `'left'`/`'center'`/`'right'` |
| `titleStyle` | Object | | ECharts textStyle cho title |
| `color` | string[] | | Override color palette |
| `animation` | boolean | | `false` = tắt animation |
| `animationDuration` | number | | ms |
| `animationEasing` | string | | ECharts easing name |
| `legend` | false\|Object | | `false` = ẩn; Object = merge với `{ type:'scroll', bottom:0, left:'center' }` |
| `legendConfig` | Object | | Extra legend props |
| `tooltip` | Object | | Merge vào default `{ confine: true }` |
| `tooltipFormat` | string | `'auto'` | `'number'`/`'percent'`/`'currency'`/`'short'`/`'auto'`. `'auto'` = số đầy đủ có phân cách nghìn (`1,500,000`); `'short'` = co gọn (`1.5M`) — chỉ dùng khi user yêu cầu rõ |
| `tooltipFormatter` | Function | | Custom tooltip fn |
| `toolbox` | boolean | `false` | Hiện toolbox (saveAsImage + restore) |
| `toolboxConfig` | Object | | Override/extend toolbox features |
| `dataView` | boolean | `false` | Hiện nút bảng (Vue overlay) — tự trích xuất data từ `option` |
| `zoom` | boolean | | dataZoom inside + slider |
| `zoomConfig` | Array | | Override dataZoom config |
| `refreshInterval` | number | | ms — auto-refresh |

**Tooltip mặc định đã đẹp sẵn — KHÔNG cần cấu hình gì thêm:** title (tên category) canh giữa, mỗi dòng series gồm chấm màu + label canh trái, giá trị canh phải, số hiển thị đầy đủ có phân cách nghìn (`2,535` chứ không phải `2.5K`). Chỉ đụng vào `tooltipFormat`/`tooltipFormatter` khi user yêu cầu format khác (`percent`, `currency`, co gọn `short`...).

---

## DataView

`config.dataView: true` → hiện icon bảng (góc trên phải chart). Click → overlay bảng dữ liệu phủ lên chart.

**DataView tự trích xuất từ `option` — không cần truyền data riêng:**
- Ưu tiên `option.dataset.source` (object-array hoặc array-of-arrays)
- Fallback: `option.series[].data` + `xAxis.data` / `yAxis.data`
- Không có data phù hợp → nút bảng ẩn tự động

```json
{
  "el": "f-echart", "w": "12",
  "attr": {
    ":config": "{ title: 'Doanh thu', dataView: true, height: 350 }",
    ":option": "vueData.chartOpt"
  }
}
```

> DataView là **Vue overlay tùy chỉnh** — **không phải** ECharts toolbox DataView. `config.toolbox: true` chỉ thêm saveAsImage + restore.

Bỏ `dataView` khi option không có series array rõ ràng (gauge giá trị đơn, sankey node/link, tree hierarchical...).

---

## Series auto-enhancement

`f-echart` tự động áp style theo loại series — điều khiển bởi **enhancement policy** của theme:

| Policy | Áp cho | Hành vi |
|---|---|---|
| `lighten` | `bar`, `pie`, `funnel` | Fill màu nhạt 50% + viền màu gốc |
| `separator` | `treemap`, `sunburst` | Viền trắng mờ giữa các ô/lớp |
| `outline` | `scatter`, `effectScatter` | Viền trắng quanh điểm |

**`lighten` detail:**
- `bar` — per-series: một màu nhạt + viền cho toàn bộ cột
- `pie` / `funnel` — per-item: mỗi lát/phần tử lấy màu riêng từ palette rồi làm nhạt

**Override:**
- Tắt lighten cho bar: đặt `itemStyle.color` tường minh trong `option.series[]`
- Tắt lighten cho pie item: đặt `itemStyle.color` vào từng phần tử `data[]`
- Tắt separator/outline: đặt `itemStyle.borderWidth: 0` trong `option.series[]`

---

## Theme

3 theme nhúng sẵn trong `fechart.js` — không cần file ngoài:

| Theme | Màu | Đặc điểm |
|---|---|---|
| `'fui'` | 56 màu | **Mặc định** — palette rộng, nhiều series |
| `'shine'` | 8 màu | Classic axis style, màu đậm nét |
| `'v5'` | 9 màu | ECharts V5 default style |

```json
":config": "{ theme: 'shine' }"
":config": "{ theme: 'v5' }"
":config": "{ theme: null }"
```

`null` = không dùng theme (ECharts bare). Đăng ký theme custom trong `script.js`:

```js
echarts.registerTheme('myTheme', { color: ['#e63946', '#457b9d', '#2a9d8f'] });
```

Sau đó dùng: `":config": "{ theme: 'myTheme' }"`

---

## Events

| Event | Payload | Mô tả |
|---|---|---|
| `chart-click` | params | Click data point |
| `drilldown` | params | Alias của `chart-click` |
| `legend-change` | params | Chọn/bỏ legend item |
| `rendered` | — | Sau mỗi lần `setOption` |
| `finished` | — | Sau khi animation xong |

```json
{ "v-on:drilldown": "CALL(vueData.loadDetail, { row: $event })" }
```

---

## Exposed methods (`$refs`)

```js
this.$refs.myChart.getInstance()           // ECharts instance gốc
this.$refs.myChart.refresh()               // Force re-render
this.$refs.myChart.exportImage('chart.png')
this.$refs.myChart.resizeChart()
```

```js
// Native ECharts API
const chart = vueData.$refs.myChart.getInstance();
chart.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: 2 });
chart.on('mouseover', p => { vueData.hoverLabel = p.name; });
```

---

## FEchartFormatter (global, dùng trong script.js)

```js
FEchartFormatter.build('currency', { symbol: '₫', decimals: 0 })(1500000) // → '₫1,500,000'
FEchartFormatter.formatShort(1500000)   // → '1.5M' (co gọn — chỉ dùng khi cần tiết kiệm chỗ, vd axis label)
FEchartFormatter.formatNumber(1500000)  // → '1,500,000'
FEchartFormatter.formatFull(2535.678)   // → '2,535.68' (đầy đủ, tối đa 2 số thập phân — mặc định của tooltip)
// Tạo tooltip formatter từ config.tooltipFormat ('auto'/không khai → formatFull, số đầy đủ)
FEchartFormatter.buildTooltip({ tooltipFormat: 'currency', symbol: '₫' })
```

---

## Sort dữ liệu

Không có `config.sort`. Sort trong `script.js` trước khi gán:

```js
vueData.rows = (d.data || []).slice().sort((a, b) => b.doanhThu - a.doanhThu);
// String sort
vueData.rows = (d.data || []).slice().sort((a, b) => a.name.localeCompare(b.name));
```

> **Không dùng ECharts `dataset.transform sort`** với object-array — không ổn định với ECharts V5.

---

## Pattern trong module.json (controls)

```json
{
  "el": "f-echart",
  "w": "12",
  "attr": {
    ":config": "{ title: 'Tiêu đề', height: 350, dataView: true }",
    ":option": "vueData.chartOpt"
  }
}
```

`vueData.chartOpt` được build trong `script.js` (callback sau khi fetch data). `dataView: true` tự trích xuất dữ liệu từ `option` để hiển thị bảng.

> **Template từng loại chart (bar/line/pie/gauge/radar/heatmap/sankey/tree/graph...) + 5 pattern module.json (inline, vueData ref, dynamic height, conditional option, no-dataview):** xem [echart-templates.md](echart-templates.md).

---

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Giải pháp |
|---|---|---|
| Trang trắng / component không tồn tại | Thiếu `fechart.js` trong import | `file_import_list` → thêm nếu thiếu |
| `echarts is not defined` | `fechart.js` sort nhỏ hơn `echarts.min.js` | Đảo sort: `echarts.min.js` phải có số nhỏ hơn |
| Chart trống dù data có | Data nằm ngoài `option` (ví dụ cố truyền qua prop `data` không tồn tại) | Data chart phải trong `option.series` — không có prop `data` |
| Nút DataView không hiện | `option` không có series array hoặc axis data | DataView chỉ hiện khi tự trích được data từ `option` |
| Bar fill nhạt | Auto lighten enhancement (50%) | Set `itemStyle.color` tường minh trong `option.series[]` |
| Chart không update khi filter thay đổi | Gán lại object cũ (same reference) | Gán object mới: `vueData.chartOpt = { ...newOpt }` hoặc gọi `$refs.myChart.refresh()` |
| `config.type` không có tác dụng | f-echart không có config.type | Đặt `type` trong `option.series[].type` |
