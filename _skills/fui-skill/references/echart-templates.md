# f-echart — Chart Type Templates & Real-World Patterns

> File này sở hữu: **template `option` theo từng loại chart + pattern module.json đi kèm**. Import/props/config nền tảng xem [components-echart.md](components-echart.md).

Thư viện template cho từng loại biểu đồ + các pattern dùng `f-echart` trong module.json. Load file này khi đã biết cần vẽ loại chart nào.

> Nền tảng (import, props, config, theme, DataView, lỗi thường gặp): xem [components-echart.md](components-echart.md). **Luôn đọc file core trước** để biết cách import và cấu trúc `option`/`config`.

---

## Templates — Chart types

### Bar chart

```js
// script.js — callback sau fetch
vueData.chartOpt = {
  xAxis: { type: 'category', data: d.data.map(r => r.thang) },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: d.data.map(r => r.doanhThu), name: 'Doanh thu' }],
  tooltip: { trigger: 'axis' },
  legend: {}
};
vueData.rows = d.data;
```

### Line chart (có smooth)

```js
vueData.chartOpt = {
  xAxis: { type: 'category', data: d.data.map(r => r.thang) },
  yAxis: { type: 'value' },
  series: [{ type: 'line', data: d.data.map(r => r.val), smooth: true, areaStyle: {} }],
  tooltip: { trigger: 'axis' }
};
```

### Multi-series + Dual Y-axis

```js
vueData.chartOpt = {
  xAxis: { type: 'category', data: d.data.map(r => r.thang) },
  yAxis: [{ name: 'VNĐ' }, { name: '%', position: 'right' }],
  series: [
    { type: 'bar',  name: 'Doanh thu',   data: d.data.map(r => r.doanhThu),   yAxisIndex: 0 },
    { type: 'line', name: 'Tăng trưởng', data: d.data.map(r => r.tangTruong), yAxisIndex: 1, smooth: true }
  ],
  tooltip: { trigger: 'axis' },
  legend: {}
};
```

### Stacked bar

```js
vueData.chartOpt = {
  xAxis: { type: 'category', data: d.data.map(r => r.thang) },
  yAxis: { type: 'value' },
  series: [
    { type: 'bar', name: 'SP A', data: d.data.map(r => r.spA), stack: 'total' },
    { type: 'bar', name: 'SP B', data: d.data.map(r => r.spB), stack: 'total' },
    { type: 'bar', name: 'SP C', data: d.data.map(r => r.spC), stack: 'total' }
  ],
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: {}
};
```

### Pie chart

```js
vueData.chartOpt = {
  series: [{
    type: 'pie',
    data: d.data.map(r => ({ name: r.khoa, value: r.soLuong })),
    radius: '70%',
    label: { formatter: '{b}: {d}%' }
  }],
  tooltip: { trigger: 'item' },
  legend: { bottom: 0 }
};
```

Doughnut: `radius: ['40%', '70%']`

### Scatter plot

```js
vueData.chartOpt = {
  xAxis: { type: 'value', name: 'Điểm thi' },
  yAxis: { type: 'value', name: 'GPA' },
  series: [{ type: 'scatter', data: d.data.map(r => [r.diemThi, r.gpa, r.hoTen]), symbolSize: 8 }],
  tooltip: {
    formatter: p => `${p.value[2]}<br>Điểm: ${p.value[0]} — GPA: ${p.value[1]}`
  }
};
```

### Gauge

```js
vueData.chartOpt = {
  series: [{
    type: 'gauge',
    min: 0, max: 100,
    data: [{ value: vueData.cpuPercent, name: 'CPU %' }],
    detail: { formatter: '{value}%' },
    axisLabel: { color: 'auto' }
  }],
  tooltip: {}
};
```

### Radar

```js
vueData.chartOpt = {
  radar: {
    indicator: [
      { name: 'Toán', max: 10 }, { name: 'Lý', max: 10 },
      { name: 'Hóa', max: 10 }, { name: 'Văn', max: 10 }, { name: 'Anh', max: 10 }
    ]
  },
  series: [{
    type: 'radar',
    data: d.data.map(r => ({
      name: r.hoTen,
      value: [r.toan, r.ly, r.hoa, r.van, r.anh]
    }))
  }],
  tooltip: {},
  legend: {}
};
```

### Heatmap (Cartesian)

```js
// data: [{x: 'Mon', y: '8h', value: 5}, ...]
const xData = [...new Set(d.data.map(r => r.x))];
const yData = [...new Set(d.data.map(r => r.y))];
vueData.chartOpt = {
  xAxis: { type: 'category', data: xData },
  yAxis: { type: 'category', data: yData },
  visualMap: { min: 0, max: 10, calculable: true },
  series: [{
    type: 'heatmap',
    data: d.data.map(r => [xData.indexOf(r.x), yData.indexOf(r.y), r.value])
  }],
  tooltip: {}
};
```

### Candlestick (OHLC)

```js
vueData.chartOpt = {
  xAxis: { type: 'category', data: d.data.map(r => r.date) },
  yAxis: { type: 'value', scale: true },
  series: [{
    type: 'candlestick',
    data: d.data.map(r => [r.open, r.close, r.low, r.high])
  }],
  tooltip: { trigger: 'axis' }
};
```

### Funnel

```js
vueData.chartOpt = {
  series: [{
    type: 'funnel',
    data: d.data.map(r => ({ name: r.buoc, value: r.soLuong })).sort((a, b) => b.value - a.value),
    label: { formatter: '{b}: {d}%' }
  }],
  tooltip: { trigger: 'item' },
  legend: {}
};
```

### Treemap

```js
// data là hierarchical: { name, value, children: [...] }
vueData.chartOpt = {
  series: [{
    type: 'treemap',
    data: vueData.budgetTree,   // hierarchical array
    roam: false,
    leafDepth: 2,
    label: { show: true }
  }],
  tooltip: {}
};
```

### Tree (org chart, org tree)

```js
vueData.chartOpt = {
  series: [{
    type: 'tree',
    data: [vueData.orgTree],    // single root node
    orient: 'TB',               // 'LR' | 'TB' | 'RL' | 'BT'
    expandAndCollapse: true,
    initialTreeDepth: 2,
    label: { position: 'top' },
    leaves: { label: { position: 'bottom' } }
  }],
  tooltip: { trigger: 'item' }
};
```

### Sankey

```js
// nodes: [{name: '...'}], links: [{source: '...', target: '...', value: N}]
vueData.chartOpt = {
  series: [{
    type: 'sankey',
    data: vueData.sankeyNodes,   // [{name: 'A'}, {name: 'B'}, ...]
    links: vueData.sankeyLinks,  // [{source: 'A', target: 'B', value: 5}, ...]
    emphasis: { focus: 'adjacency' },
    lineStyle: { color: 'gradient' }
  }],
  tooltip: { trigger: 'item' }
};
```

### Graph (network)

```js
vueData.chartOpt = {
  series: [{
    type: 'graph',
    layout: 'force',            // 'force' | 'circular' | 'none'
    data: vueData.nodes,        // [{name, value, category}, ...]
    links: vueData.edges,       // [{source, target}, ...]
    categories: vueData.categories,  // [{name}, ...]
    roam: true,
    label: { show: true },
    force: { repulsion: 1000 }
  }],
  legend: {},
  tooltip: {}
};
```

### Calendar heatmap

```js
// data: [{date: '2024-01-01', count: 5}, ...]
vueData.chartOpt = {
  calendar: { range: '2024', cellSize: ['auto', 20] },
  visualMap: { min: 0, max: 30, type: 'piecewise', orient: 'horizontal', left: 'center' },
  series: [{
    type: 'heatmap',
    coordinateSystem: 'calendar',
    data: d.data.map(r => [r.date, r.count])
  }],
  tooltip: { formatter: p => `${p.value[0]}: ${p.value[1]}` }
};
```

---

## Zoom + Tooltip format

```js
// Zoom (trong option)
vueData.chartOpt = {
  ...baseOpt,
  dataZoom: [{ type: 'inside' }, { type: 'slider', height: 20 }]
};
// Hoặc dùng config shortcut:
// config: { zoom: true }
```

```js
// Tooltip tiền tệ — dùng config shortcut
// config: { tooltipFormat: 'currency', symbol: '₫', decimals: 0 }

// Hoặc custom formatter trong option
tooltip: {
  formatter: p => {
    const fmt = FEchartFormatter.build('currency', { symbol: '₫', decimals: 0 });
    return `${p.name}: ${fmt(p.value)}`;
  }
}
```

---

## Dataset + encode (khi cần map cột tùy ý)

```js
// script.js — build option dùng dataset (không map thủ công)
vueData.chartOpt = {
  dataset: { source: vueData.rows },
  series: [
    { type: 'bar',  name: 'Doanh thu', encode: { x: 'thang', y: 'doanhThu' } },
    { type: 'line', name: 'Chi phí',   encode: { x: 'thang', y: 'chiPhi' }, yAxisIndex: 1 }
  ],
  xAxis: { type: 'category' },
  yAxis: [{}, { position: 'right' }],
  tooltip: { trigger: 'axis' }
};
```

---

## Patterns thực tế

Hai pattern chính khi dùng `f-echart` trong module.json:

| Pattern | Khi nào dùng |
|---|---|
| **Inline** — viết `option` thẳng vào attr | Chart đơn giản, data đã có trong `vueData`, không cần biến trung gian |
| **vueData ref** — `option` build trong `script.js` | Data cần fetch từ API; option phức tạp; cần sort/transform trước khi render |

---

### Pattern 1 — Inline pie (không cần script.js)

Khi data đã có trong `vueData.rows`, viết `option` thẳng vào attr — không cần biến `chartOpt` hay script.js.

**module.json controls:**
```json
{
  "el": "f-echart", "w": "6",
  "attr": {
    ":config": "{ title: 'Cơ cấu sinh viên', height: 350 }",
    ":option": "{
      series: [{
        type: 'pie',
        data: vueData.rows.map(r => ({ name: r.khoa, value: r.soLuong })),
        radius: ['40%', '70%'],
        label: { formatter: '{b}: {d}%' }
      }],
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0 }
    }"
  }
}
```

> `vueData.rows` phải được gán trước (ví dụ: từ callback fetch của control khác trong cùng module).

---

### Pattern 2 — Inline horizontal bar

Horizontal bar: đổi `xAxis`/`yAxis`, dùng `inverse: true` và `containLabel: true`.

**module.json controls:**
```json
{
  "el": "f-echart", "w": "12",
  "attr": {
    ":config": "{ height: Math.max(300, vueData.rows.length * 36) }",
    ":option": "{
      xAxis: { type: 'value' },
      yAxis: {
        type: 'category',
        data: vueData.rows.map(r => r.tenKhoa),
        inverse: true
      },
      grid: { containLabel: true, left: '10px', right: '30px', top: '10px', bottom: '10px' },
      series: [{
        type: 'bar',
        data: vueData.rows.map(r => r.soLuong),
        name: 'Sinh viên',
        label: { show: true, position: 'right' }
      }],
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } }
    }"
  }
}
```

**Lưu ý:**
- `containLabel: true` trong `grid` — bắt buộc cho horizontal bar để nhãn `yAxis` không bị cắt.
- `inverse: true` → item lớn nhất hiển thị ở trên cùng.
- `height: Math.max(300, rows.length * 36)` — tự co dãn theo số hàng.

---

### Pattern 3 — vueData ref + dynamic height (fetch từ API)

Dùng khi option phức tạp hoặc data cần fetch từ API riêng.

**module.json controls:**
```json
{
  "el": "f-echart", "w": "12",
  "attr": {
    ":config": "{ title: 'Doanh thu theo tháng', height: 400, dataView: true }",
    ":option": "vueData.chartOpt"
  }
}
```

**script.js:**
```js
// Trong callback fetch data
vueData.rows = d.data.slice().sort((a, b) => a.thang.localeCompare(b.thang));
vueData.chartOpt = {
  xAxis: { type: 'category', data: vueData.rows.map(r => r.thang) },
  yAxis: [
    { type: 'value', name: 'Triệu đồng', axisLabel: { formatter: v => FEchartFormatter.formatShort(v) } },
    { type: 'value', name: '%', position: 'right', max: 100 }
  ],
  series: [
    { type: 'bar',  name: 'Doanh thu', data: vueData.rows.map(r => r.doanhThu), yAxisIndex: 0 },
    { type: 'line', name: 'Tăng trưởng', data: vueData.rows.map(r => r.tangTruong), yAxisIndex: 1, smooth: true }
  ],
  grid: { containLabel: true },
  tooltip: { trigger: 'axis' },
  legend: {}
};
```

---

### Pattern 4 — Conditional option (null guard)

Khi option được build từ nhiều nguồn data, dùng điều kiện để tránh render chart với data rỗng.

**module.json controls:**
```json
{
  "el": "f-echart", "w": "12",
  "attr": {
    ":config": "{ height: 350 }",
    ":option": "vueData.baseOpt ? Object.assign({}, vueData.baseOpt, { series: vueData.series }) : null"
  }
}
```

**script.js:**
```js
// Base option — khởi tạo một lần
vueData.baseOpt = {
  xAxis: { type: 'category', data: [] },
  yAxis: { type: 'value' },
  tooltip: { trigger: 'axis' },
  legend: {},
  grid: { containLabel: true }
};

// Khi fetch data xong — reactive update
vueData.baseOpt.xAxis.data = d.data.map(r => r.thang);
vueData.series = d.data.map((r, i) => ({
  type: 'bar', name: r.name, data: r.values, stack: 'total'
}));
// Object.assign trong :option tạo object mới → Vue trigger re-render
```

> `Object.assign({}, base, override)` trong `:option` expression — tạo object mới mỗi lần evaluate, đảm bảo Vue detect change.

---

### Pattern 5 — Chart không có DataView (phổ biến nhất)

Đa số chart production không cần DataView — bỏ `dataView` để gọn. Không cần `:data` prop (không tồn tại).

```json
{
  "el": "f-echart", "w": "6",
  "attr": {
    ":config": "{ height: 300 }",
    ":option": "vueData.pieOpt"
  }
}
```

Chỉ thêm `dataView: true` vào config khi user cần xem bảng số liệu — DataView tự trích xuất từ `option`.
