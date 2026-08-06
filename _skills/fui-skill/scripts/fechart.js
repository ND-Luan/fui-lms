/* ============================================================
 * FEchart V5 — Direct Mode
 * Vue 2 + Apache ECharts + Lodash
 *
 * Architecture:
 *   FEchartFormatter  — value formatters (public, dùng trong script.js)
 *   Vue.component('f-echart') — direct-mode chart wrapper
 *
 * Theme mặc định: 'shine' (nhúng sẵn, không cần load file ngoài).
 * Đăng ký theme khác: gọi echarts.registerTheme(...) trước khi mount.
 *
 * Props:
 *   data   {Array}   flat array — optional, chỉ dùng cho DataView table
 *   config {Object}  meta / shortcut settings (xem danh sách bên dưới)
 *   option {Object}  full ECharts option — primary; thắng mọi config shortcut
 *
 * config keys:
 *   height           number|string  chiều cao (default 400px hoặc '50vh')
 *   theme            string         tên theme (default 'shine'); null = không dùng theme
 *   title            string         → option.title.text
 *   subtitle         string         → option.title.subtext
 *   titleLeft        string         'left'|'center'|'right'
 *   titleStyle       Object         ECharts textStyle cho title
 *   color            string[]       override color palette
 *   backgroundColor  string         override background (default 'transparent')
 *   animation        boolean        false = tắt animation
 *   animationDuration number        ms
 *   animationEasing  string         ECharts easing name
 *   legend           false|Object   false = ẩn; Object = merge vào default legend
 *   legendConfig     Object         extra legend props (merge thêm)
 *   tooltip          Object         merge vào default tooltip { confine: true }
 *   tooltipFormat    string         'number'|'percent'|'currency'|'short'|'auto'
 *                                   'auto' (mặc định) = số đầy đủ có phân cách nghìn (1,500,000);
 *                                   'short' = co gọn (1.5M) — chỉ khi khai báo tường minh
 *   tooltipFormatter Function       custom tooltip fn
 *
 * Tooltip mặc định (không cần cấu hình): title canh giữa, mỗi dòng series
 * label canh trái + giá trị canh phải (số đầy đủ, phân cách nghìn).
 *   toolbox          boolean        true = hiện toolbox (saveAsImage + restore); ẩn mặc định
 *   toolboxConfig    Object         override/extend toolbox feature config
 *   dataView         boolean        true = thêm nút DataView; implies toolbox: true
 *   zoom             boolean        true = thêm dataZoom (inside + slider)
 *   zoomConfig       Array          override dataZoom config
 *   refreshInterval  number         ms — auto-refresh interval
 *
 * Bar series — tự động (không cần cấu hình thêm):
 *   Fill màu nhạt hơn bộ màu theme, viền giữ nguyên màu gốc.
 *   Override bằng cách set itemStyle.color trong option.series[].
 *
 * Events:
 *   chart-click  (params)   click trên data point
 *   drilldown    (params)   alias của chart-click
 *   legend-change (params)  chọn/bỏ legend item
 *   rendered     ()         sau mỗi lần setOption thành công
 *   finished     ()         sau khi animation hoàn thành
 *
 * Exposed (via $refs):
 *   getInstance()     → ECharts instance gốc
 *   refresh()         → force re-render
 *   exportImage(name) → download PNG
 *   resizeChart()     → manual resize
 * ============================================================ */


/* ============================================================
 * Chart theme system
 * Themes: 'fui' (default, 56 màu) · 'shine' (8 màu cổ điển) · 'v5' (ECharts V5 default)
 * config.theme: 'fui' | 'shine' | 'v5'  — mặc định 'fui'
 * ============================================================ */

// Pha màu với trắng: amount = 0 (không đổi) → 1 (trắng hoàn toàn)
const _lightenHex = (hex, amount) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const m = v => Math.round(v + (255 - v) * amount).toString(16).padStart(2, '0');
  return '#' + m(r) + m(g) + m(b);
};

const _paletteFui = [
  '#1e90ff','#ffa64d','#6fdc6f','#f14aff','#9966ff','#02e8e8','#402b58','#3b8d74',
  '#095fa4','#b63639','#c84f7a','#a8b236','#90692f','#b42e89','#ff9966','#4db8ff',
  '#1c8540','#ff6699','#5666ad','#b2b266','#e2976b','#84c887','#4d9dd0','#a187f7',
  '#d9745b','#862929','#ea80fc','#8c4391','#ff8c00','#53915b','#6dcbab','#7b7353',
  '#d4e157','#cc242f','#c69e31','#fdd835',
  '#4E79A7','#A0CBE8','#F28E2B','#FFBE7D','#59A14F','#8CD17D','#B6992D','#F1CE63',
  '#499894','#86BCB6','#E15759','#FF9D9A','#79706E','#BAB0AC','#D37295','#FABFD2',
  '#B07AA1','#D4A6C8','#9D7660','#D7B5A6'
];
const _paletteShine = ['#c12e34','#e6b600','#0098d9','#2b821d','#005eaa','#339ca8','#cda819','#32a487'];
const _paletteV5    = ['#5470c6','#91cc75','#fac858','#ee6666','#73c0de','#3ba272','#fc8452','#9a60b4','#ea7ccc'];


/* ============================================================
 * FEchartFormatter
 * Utility: format values for tooltip, label, axis tick
 * ============================================================ */
const FEchartFormatter = (() => {
  const _formatNumber = (val, decimals = 0) => {
    if (val == null || isNaN(val)) return val;
    return Number(val).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const _formatPercent = (val, decimals = 1) =>
    val == null ? val : Number(val).toFixed(decimals) + '%';

  const _formatCurrency = (val, symbol = '₫', decimals = 0) =>
    val == null ? val : symbol + _formatNumber(val, decimals);

  const _formatShort = (val) => {
    if (val == null || isNaN(val)) return val;
    const abs = Math.abs(val);
    if (abs >= 1e9) return (val / 1e9).toFixed(1) + 'B';
    if (abs >= 1e6) return (val / 1e6).toFixed(1) + 'M';
    if (abs >= 1e3) return (val / 1e3).toFixed(1) + 'K';
    return String(val);
  };

  // Số đầy đủ, phân cách nghìn, giữ tối đa 2 chữ số thập phân (2535 → '2,535'; 12.345 → '12.35')
  const _formatFull = (val) => {
    if (val == null || isNaN(val)) return val;
    return Number(val).toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  /**
   * Build an ECharts formatter function.
   * @param {string|Function} fmt  - 'number'|'percent'|'currency'|'short'|'auto'|custom fn
   * @param {Object} opts          - { decimals, symbol }
   * @returns {Function}
   */
  const build = (fmt, opts = {}) => {
    if (typeof fmt === 'function') return fmt;
    const { decimals, symbol } = opts;
    switch (fmt) {
      case 'percent':  return v => _formatPercent(v, decimals);
      case 'currency': return v => _formatCurrency(v, symbol, decimals);
      case 'short':    return v => _formatShort(v);
      case 'number':   return v => _formatNumber(v, decimals);
      case 'auto':
      default:         return v => _formatFull(v); // số đầy đủ — muốn co gọn dùng 'short'
    }
  };

  /**
   * Build an ECharts tooltip formatter from config.
   * Hỗ trợ cả dataset mode (p.value là object row) và series.data mode (p.value là số).
   * @param {Object} config  - { tooltipFormat, tooltipFormatter }
   * @returns {Function|undefined}
   */
  const buildTooltip = (config) => {
    if (config.tooltipFormatter) return config.tooltipFormatter;
    if (!config.tooltipFormat) return undefined;

    const fmt = build(config.tooltipFormat, config);
    return params => _renderTooltip(params, fmt);
  };

  // Trích giá trị số từ ECharts params (mọi mode: dataset object/array, series.data)
  const _extractVal = (p) => {
    const v = p.value;
    if (v == null) return null;
    if (typeof v === 'number') return v;
    if (typeof v === 'object' && !Array.isArray(v)) {
      const dims = p.dimensionNames;
      const yIdx = p.encode?.y?.[0] ?? null;
      if (yIdx != null && dims?.[yIdx] != null) { const n = v[dims[yIdx]]; if (typeof n === 'number') return n; }
      if (p.seriesName && typeof v[p.seriesName] === 'number') return v[p.seriesName];
      return Object.values(v).find(x => typeof x === 'number') ?? null;
    }
    if (Array.isArray(v)) { const y = p.encode?.y?.[0]; return y != null ? v[y] : v[v.length - 1]; }
    return null;
  };

  // Layout tooltip chuẩn (dùng chung cho mọi tooltipFormat lẫn mặc định):
  // title canh giữa, mỗi dòng series: chấm màu + label canh trái, giá trị canh phải.
  const _renderTooltip = (params, fmt) => {
    const arr   = Array.isArray(params) ? params : [params];
    const title = arr[0]?.name || arr[0]?.axisValueLabel || '';
    const rows  = arr.map(p => {
      const raw = _extractVal(p);
      const val = raw != null ? fmt(raw) : (p.value != null ? p.value : '–');
      return `<div style="display:flex;align-items:center;justify-content:space-between;gap:24px;margin-top:4px">` +
             `<span style="display:flex;align-items:center;gap:6px;flex:1;text-align:left">` +
             `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};flex-shrink:0"></span>` +
             `<span>${p.seriesName || p.name || ''}</span></span>` +
             `<b style="text-align:right">${val}</b></div>`;
    });
    return `<div style="font-size:13px;text-align:left;min-width:130px">` +
           (title ? `<div style="font-weight:600;text-align:center;margin-bottom:5px">${title}</div>` : '') +
           rows.join('') + `</div>`;
  };

  // Formatter mặc định — số đầy đủ có phân cách nghìn (không co gọn kiểu 1.2K).
  const buildDefault = () => (params) => _renderTooltip(params, _formatFull);

  return { build, buildTooltip, buildDefault, formatNumber: _formatNumber, formatShort: _formatShort, formatFull: _formatFull };
})();


// Build shine-style theme from a color palette (classic axis style)
const _mkShineTheme = (colors) => ({
  color: colors,
  backgroundColor: 'rgba(0,0,0,0)',
  textStyle: {},
  title: { textStyle: { color: '#333333' }, subtextStyle: { color: '#aaa' } },
  line:    { itemStyle: { borderWidth: 1 }, lineStyle: { width: 2 }, symbolSize: 4, symbol: 'emptyCircle', smooth: false },
  radar:   { itemStyle: { borderWidth: 1 }, lineStyle: { width: 2 }, symbolSize: 4, symbol: 'emptyCircle', smooth: false },
  bar:     { itemStyle: { barBorderWidth: 0, barBorderColor: '#ccc' } },
  pie:     { itemStyle: { borderWidth: 0, borderColor: '#ccc' } },
  scatter: { itemStyle: { borderWidth: 0, borderColor: '#ccc' } },
  boxplot: { itemStyle: { borderWidth: 0, borderColor: '#ccc' } },
  parallel:{ itemStyle: { borderWidth: 0, borderColor: '#ccc' } },
  sankey:  { itemStyle: { borderWidth: 0, borderColor: '#ccc' } },
  funnel:  { itemStyle: { borderWidth: 0, borderColor: '#ccc' } },
  gauge:   { itemStyle: { borderWidth: 0, borderColor: '#ccc' } },
  candlestick: { itemStyle: { color: '#c12e34', color0: '#2b821d', borderColor: '#c12e34', borderColor0: '#2b821d', borderWidth: 1 } },
  graph: {
    itemStyle: { borderWidth: 0, borderColor: '#ccc' },
    lineStyle: { width: 1, color: '#aaa' },
    symbolSize: 4, symbol: 'emptyCircle', smooth: false,
    color: colors, label: { color: '#eee' }
  },
  map: {
    itemStyle: { areaColor: '#ddd', borderColor: '#eee', borderWidth: 0.5 },
    label: { color: '#c12e34' },
    emphasis: { itemStyle: { areaColor: '#e6b600', borderColor: '#ddd', borderWidth: 1 }, label: { color: '#c12e34' } }
  },
  geo: {
    itemStyle: { areaColor: '#ddd', borderColor: '#eee', borderWidth: 0.5 },
    label: { color: '#c12e34' },
    emphasis: { itemStyle: { areaColor: '#e6b600', borderColor: '#ddd', borderWidth: 1 }, label: { color: '#c12e34' } }
  },
  categoryAxis: {
    axisLine:  { show: true,  lineStyle: { color: '#333' } },
    axisTick:  { show: true,  lineStyle: { color: '#333' } },
    axisLabel: { show: true,  color: '#333' },
    splitLine: { show: false, lineStyle: { color: ['#ccc'] } },
    splitArea: { show: false, areaStyle: { color: ['rgba(250,250,250,0.3)','rgba(200,200,200,0.3)'] } }
  },
  valueAxis: {
    axisLine:  { show: true, lineStyle: { color: '#333' } },
    axisTick:  { show: true, lineStyle: { color: '#333' } },
    axisLabel: { show: true, color: '#333' },
    splitLine: { show: true, lineStyle: { color: ['#ccc'] } },
    splitArea: { show: false, areaStyle: { color: ['rgba(250,250,250,0.3)','rgba(200,200,200,0.3)'] } }
  },
  logAxis: {
    axisLine:  { show: true, lineStyle: { color: '#333' } },
    axisTick:  { show: true, lineStyle: { color: '#333' } },
    axisLabel: { show: true, color: '#333' },
    splitLine: { show: true, lineStyle: { color: ['#ccc'] } },
    splitArea: { show: false, areaStyle: { color: ['rgba(250,250,250,0.3)','rgba(200,200,200,0.3)'] } }
  },
  timeAxis: {
    axisLine:  { show: true, lineStyle: { color: '#333' } },
    axisTick:  { show: true, lineStyle: { color: '#333' } },
    axisLabel: { show: true, color: '#333' },
    splitLine: { show: true, lineStyle: { color: ['#ccc'] } },
    splitArea: { show: false, areaStyle: { color: ['rgba(250,250,250,0.3)','rgba(200,200,200,0.3)'] } }
  },
  toolbox: { iconStyle: { borderColor: '#06467c' }, emphasis: { iconStyle: { borderColor: '#4187c2' } } },
  legend:  { textStyle: { color: '#333333' }, left: 'center', right: 'auto', top: 0, bottom: 10 },
  tooltip: { axisPointer: { lineStyle: { color: '#cccccc', width: 1 }, crossStyle: { color: '#cccccc', width: 1 } } },
  timeline: {
    lineStyle: { color: '#005eaa', width: 1 }, itemStyle: { color: '#005eaa', borderWidth: 1 },
    controlStyle: { color: '#005eaa', borderColor: '#005eaa', borderWidth: 0.5 },
    checkpointStyle: { color: '#005eaa', borderColor: 'rgba(49,107,194,0.5)' },
    label: { color: '#005eaa' },
    emphasis: {
      itemStyle: { color: '#005eaa' },
      controlStyle: { color: '#005eaa', borderColor: '#005eaa', borderWidth: 0.5 },
      label: { color: '#005eaa' }
    }
  },
  visualMap: { color: ['#1790cf','#a2d4e6'] },
  markPoint: { label: { color: '#eee' }, emphasis: { label: { color: '#eee' } } },
  grid: { left: '10%', right: '10%', top: 60, bottom: 70 }
});

// Enhancement policy — phần của theme, kiểm soát cách áp style lên từng series type.
// lighten  : fill nhạt + viền màu gốc (per-item với pie/funnel, per-series với bar)
// separator: viền trắng mờ phân cách (per-series, dùng cho khối phân cấp)
// outline  : viền trắng quanh điểm (per-series, dùng cho scatter)
const _mkEnhance = (lightenAmount = 0.5, separatorColor = 'rgba(255,255,255,0.75)') => ({
  lighten:        ['bar', 'pie', 'funnel'],
  separator:      ['treemap', 'sunburst'],
  outline:        ['scatter', 'effectScatter'],
  lightenAmount,
  separatorColor,
  outlineColor:  'rgba(255,255,255,0.8)',
  outlineWidth:   1.5
});

const _themes = {
  fui:   { colors: _paletteFui,   def: _mkShineTheme(_paletteFui),   enhance: _mkEnhance() },
  shine: { colors: _paletteShine, def: _mkShineTheme(_paletteShine), enhance: _mkEnhance() },
  v5: {
    colors: _paletteV5,
    enhance: _mkEnhance(0.45, 'rgba(255,255,255,0.8)'),
    def: {
      color: _paletteV5,
      backgroundColor: 'rgba(0,0,0,0)',
      textStyle: {},
      title: { textStyle: { color: '#464646' }, subtextStyle: { color: '#6E7079' } },
      line:    { itemStyle: { borderWidth: 1 }, lineStyle: { width: 2 }, symbolSize: 4, symbol: 'emptyCircle', smooth: false },
      radar:   { itemStyle: { borderWidth: 1 }, lineStyle: { width: 2 }, symbolSize: 4, symbol: 'emptyCircle', smooth: false },
      bar:     { itemStyle: { barBorderWidth: 0, barBorderColor: '#ccc' } },
      pie:     { itemStyle: { borderWidth: 0, borderColor: '#ccc' } },
      scatter: { itemStyle: { borderWidth: 0, borderColor: '#ccc' } },
      boxplot: { itemStyle: { borderWidth: 0, borderColor: '#ccc' } },
      parallel:{ itemStyle: { borderWidth: 0, borderColor: '#ccc' } },
      sankey:  { itemStyle: { borderWidth: 0, borderColor: '#ccc' } },
      funnel:  { itemStyle: { borderWidth: 0, borderColor: '#ccc' } },
      gauge:   { itemStyle: { borderWidth: 0, borderColor: '#ccc' } },
      candlestick: { itemStyle: { color: '#eb5454', color0: '#47b262', borderColor: '#eb5454', borderColor0: '#47b262', borderWidth: 1 } },
      graph: {
        itemStyle: { borderWidth: 0, borderColor: '#ccc' },
        lineStyle: { width: 1, color: '#aaa' },
        symbolSize: 4, symbol: 'emptyCircle', smooth: false,
        color: _paletteV5, label: { color: '#eee' }
      },
      map: {
        itemStyle: { areaColor: '#eee', borderColor: '#444', borderWidth: 0.5 },
        label: { color: '#000' },
        emphasis: { itemStyle: { areaColor: 'rgba(255,215,0,0.8)', borderColor: '#444', borderWidth: 1 }, label: { color: 'rgb(100,0,0)' } }
      },
      geo: {
        itemStyle: { areaColor: '#eee', borderColor: '#444', borderWidth: 0.5 },
        label: { color: '#000' },
        emphasis: { itemStyle: { areaColor: 'rgba(255,215,0,0.8)', borderColor: '#444', borderWidth: 1 }, label: { color: 'rgb(100,0,0)' } }
      },
      categoryAxis: {
        axisLine:  { show: true,  lineStyle: { color: '#6E7079' } },
        axisTick:  { show: true,  lineStyle: { color: '#6E7079' } },
        axisLabel: { show: true,  color: '#6E7079' },
        splitLine: { show: false, lineStyle: { color: ['#E0E6F1'] } },
        splitArea: { show: false, areaStyle: { color: ['rgba(250,250,250,0.2)','rgba(210,219,238,0.2)'] } }
      },
      valueAxis: {
        axisLine:  { show: false, lineStyle: { color: '#6E7079' } },
        axisTick:  { show: false, lineStyle: { color: '#6E7079' } },
        axisLabel: { show: true,  color: '#6E7079' },
        splitLine: { show: true,  lineStyle: { color: ['#E0E6F1'] } },
        splitArea: { show: false, areaStyle: { color: ['rgba(250,250,250,0.2)','rgba(210,219,238,0.2)'] } }
      },
      logAxis: {
        axisLine:  { show: false, lineStyle: { color: '#6E7079' } },
        axisTick:  { show: false, lineStyle: { color: '#6E7079' } },
        axisLabel: { show: true,  color: '#6E7079' },
        splitLine: { show: true,  lineStyle: { color: ['#E0E6F1'] } },
        splitArea: { show: false, areaStyle: { color: ['rgba(250,250,250,0.2)','rgba(210,219,238,0.2)'] } }
      },
      timeAxis: {
        axisLine:  { show: true,  lineStyle: { color: '#6E7079' } },
        axisTick:  { show: true,  lineStyle: { color: '#6E7079' } },
        axisLabel: { show: true,  color: '#6E7079' },
        splitLine: { show: false, lineStyle: { color: ['#E0E6F1'] } },
        splitArea: { show: false, areaStyle: { color: ['rgba(250,250,250,0.2)','rgba(210,219,238,0.2)'] } }
      },
      toolbox: { iconStyle: { borderColor: '#999' }, emphasis: { iconStyle: { borderColor: '#666' } } },
      legend:  { textStyle: { color: '#333' }, left: 'center', right: 'auto', top: 0, bottom: 10 },
      tooltip: { axisPointer: { lineStyle: { color: '#ccc', width: 1 }, crossStyle: { color: '#ccc', width: 1 } } },
      timeline: {
        lineStyle: { color: '#DAE1F5', width: 2 }, itemStyle: { color: '#A4B1D7', borderWidth: 1 },
        controlStyle: { color: '#A4B1D7', borderColor: '#A4B1D7', borderWidth: 1 },
        checkpointStyle: { color: '#316bf3', borderColor: '#fff' },
        label: { color: '#A4B1D7' },
        emphasis: {
          itemStyle: { color: '#FFF' },
          controlStyle: { color: '#A4B1D7', borderColor: '#A4B1D7', borderWidth: 1 },
          label: { color: '#A4B1D7' }
        }
      },
      visualMap: { color: ['#bf444c','#d88273','#f6efa6'] },
      markPoint: { label: { color: '#eee' }, emphasis: { label: { color: '#eee' } } },
      grid: { left: '10%', right: '10%', top: 60, bottom: 70 }
    }
  }
};

const DEFAULT_THEME = 'fui';
const _registeredThemes = new Set();

// Đăng ký theme với ECharts (lazy, mỗi tên chỉ một lần)
const _ensureTheme = (name) => {
  const t = (_themes[name] ? name : DEFAULT_THEME);
  if (!_registeredThemes.has(t)) {
    echarts.registerTheme(t, _themes[t].def);
    _registeredThemes.add(t);
  }
  return t;
};


/* ============================================================
 * Vue.component('f-echart')
 * Direct mode: option prop là primary — truyền thẳng vào ECharts.
 * config chỉ dùng cho meta/shortcut (height, theme, title, toolbox...).
 * Bar series: tự động fill nhạt + viền màu gốc (override bằng itemStyle.color).
 * ============================================================ */
Vue.component('f-echart', {
  props: {
    config: { type: Object, default: () => ({}) },
    option: { type: Object, default: () => ({}) }
  },

  template: `
<div :style="{ width: '100%', height: heightStyle, position: 'relative' }">
  <div ref="chart" style="width:100%;height:100%;"></div>
  <div v-if="canShowDataView" class="fc-dv-btn" title="Xem dữ liệu" @click="toggleDataView">
    <span class="mdi mdi-table"></span>
  </div>
  <div v-if="showDataView" class="fc-dv-overlay">
    <div class="fc-dv-header">
      <span>{{ dvTitle }}</span>
      <button class="fc-dv-close" @click="showDataView = false">&#x2715;</button>
    </div>
    <div class="fc-dv-body">
      <table class="fc-dv-table">
        <thead>
          <tr><th v-for="col in tableCols" :key="col.key">{{ col.label }}</th></tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in tableData" :key="ri">
            <td v-for="col in tableCols" :key="col.key">{{ row[col.key] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>`,

  data() {
    return { chartInstance: null, timer: null, showDataView: false, activeTheme: null };
  },

  computed: {
    // Note: Vue 3 reserves the "_"/"$" prefix for internal instance internals —
    // any data/computed/method name starting with "_" referenced directly in the
    // template (not via `this.`) throws "ReferenceError: X is not defined".
    heightStyle() {
      const h = this.config.height || 400;
      return typeof h === 'number' ? h + 'px' : h;
    },

    tableData() {
      if (!this.config.dataView) return [];
      return this.extractDataRows(this.option) || [];
    },

    tableCols() {
      if (!this.tableData.length) return [];
      return Object.keys(this.tableData[0]).map(k => ({ key: k, label: k }));
    },

    canShowDataView() {
      return !!this.config.dataView && this.tableData.length > 0;
    },

    dvTitle() {
      const t = this.tableData.length;
      const c = this.tableCols.length;
      return (this.config.title || 'Dữ liệu') + ' — ' + t + ' h\xe0ng \xd7 ' + c + ' cột';
    }
  },

  mounted() {
    this.injectDvStyles();
    const t = _ensureTheme(('theme' in this.config ? this.config.theme : null) || DEFAULT_THEME);
    this.activeTheme = t;
    this.chartInstance = echarts.init(this.$refs.chart, t);
    this.bindEvents();
    this.renderChart();
    window.addEventListener('resize', this.resizeChart);
    if (this.config.refreshInterval) {
      this.timer = setInterval(() => this.refresh(), this.config.refreshInterval);
    }
  },

  // Cả hai tên hook: Vue 2 gọi beforeDestroy, Vue 3 (non-compat) gọi beforeUnmount —
  // thiếu beforeUnmount làm rò rỉ resize-listener + không dispose chart trên Vue 3 thuần.
  beforeDestroy() { this.teardown(); },
  beforeUnmount() { this.teardown(); },

  watch: {
    config: {
      deep: true,
      handler() {
        const t = _ensureTheme(('theme' in this.config ? this.config.theme : null) || DEFAULT_THEME);
        if (t !== this.activeTheme) {
          this.activeTheme = t;
          if (this.chartInstance) this.chartInstance.dispose();
          this.chartInstance = echarts.init(this.$refs.chart, t);
          this.bindEvents();
        }
        this.renderChart();
      }
    },
    option: { deep: true, handler() { this.renderChart(); } }
  },

  methods: {
    renderChart() {
      if (!this.chartInstance) return;
      try {
        const opt = this.buildOption();
        this.chartInstance.setOption(opt, true);
        this.$emit('rendered');
      } catch (e) {
        console.warn('[f-echart] renderChart error:', e);
      }
    },

    // Assembles final ECharts option: config shortcuts as defaults, option wins
    buildOption() {
      const c    = this.config;
      const base = {};

      // Background
      base.backgroundColor = c.backgroundColor || 'transparent';

      // Animation
      if (c.animation === false) {
        base.animation = false;
      } else {
        if (c.animationDuration != null) base.animationDuration = c.animationDuration;
        if (c.animationEasing)           base.animationEasing   = c.animationEasing;
      }

      // Color palette
      if (c.color) base.color = c.color;

      // Title shortcut
      if (c.title || c.subtitle) {
        base.title = {
          text:      c.title     || '',
          subtext:   c.subtitle  || '',
          left:      c.titleLeft || 'left',
          textStyle: c.titleStyle || { fontSize: 14, fontWeight: 'bold' }
        };
      }

      // Legend: false = hide, object = merge with defaults
      if (c.legend === false) {
        base.legend = { show: false };
      } else if (c.legend || c.legendConfig) {
        base.legend = _.merge(
          { type: 'scroll', bottom: 0, left: 'center' },
          typeof c.legend === 'object' ? c.legend : {},
          c.legendConfig || {}
        );
      }

      // Tooltip — luôn inject để đảm bảo layout chuẩn, không bị page CSS override.
      // Ưu tiên: tooltipFormatter > tooltipFormat > buildDefault (title canh giữa,
      // label trái / giá trị phải, số đầy đủ formatFull).
      // User vẫn có thể override hoàn toàn qua option.tooltip.formatter.
      {
        const tt = _.merge({ confine: true }, typeof c.tooltip === 'object' ? c.tooltip : {});
        const fn = FEchartFormatter.buildTooltip(c);
        tt.formatter = fn || FEchartFormatter.buildDefault();
        base.tooltip = tt;
      }

      // Toolbox (opt-in: false by default; dataView handled by Vue overlay, not ECharts toolbox)
      const showToolbox = c.toolbox === true || !!c.toolboxConfig;
      if (showToolbox) {
        base.toolbox = _.merge(
          { feature: { saveAsImage: {}, restore: {} } },
          c.toolboxConfig || {}
        );
      }

      // DataZoom shortcut
      if (c.zoom) {
        base.dataZoom = c.zoomConfig || [
          { type: 'inside' },
          { type: 'slider', height: 20 }
        ];
      }

      // option prop thắng mọi config shortcut
      const opt = _.merge(base, this.option);

      // Series style enhancement
      this.enhanceSeriesStyle(opt);

      return opt;
    },

    // Đọc enhance policy từ theme → áp style thống nhất cho các series type có dạng "khối".
    // Policy được định nghĩa trong _themes[t].enhance — mỗi theme tự quyết lightenAmount, color, v.v.
    enhanceSeriesStyle(opt) {
      const t       = (this.activeTheme && _themes[this.activeTheme]) ? this.activeTheme : DEFAULT_THEME;
      const palette = (opt.color && opt.color.length) ? opt.color : _themes[t].colors;
      const e       = _themes[t].enhance || {};
      const lightenSet   = new Set(e.lighten    || []);
      const separatorSet = new Set(e.separator  || []);
      const outlineSet   = new Set(e.outline    || []);
      const amount    = e.lightenAmount  ?? 0.5;
      const sepColor  = e.separatorColor ?? 'rgba(255,255,255,0.75)';
      const outColor  = e.outlineColor   ?? 'rgba(255,255,255,0.8)';
      const outWidth  = e.outlineWidth   ?? 1.5;

      let idx = 0;
      (opt.series || []).forEach(s => {
        if (!s) { idx++; return; }

        if (lightenSet.has(s.type)) {
          if (s.type === 'bar') {
            // Bar: per-series — một màu duy nhất cho toàn bộ series
            const hasExplicit = s.itemStyle && s.itemStyle.color != null;
            if (!hasExplicit) {
              const orig = palette[idx % palette.length];
              s.itemStyle = _.merge({ color: _lightenHex(orig, amount), borderColor: orig, borderWidth: 1 }, s.itemStyle || {});
            }
          } else if (Array.isArray(s.data)) {
            // Pie / funnel: per-item — mỗi lát/phần tử lấy màu riêng từ palette
            s.data.forEach((item, i) => {
              if (!item || typeof item !== 'object') return;
              if (!item.itemStyle) item.itemStyle = {};
              if (item.itemStyle.color == null) {
                const orig = palette[i % palette.length];
                item.itemStyle.color       = _lightenHex(orig, amount);
                item.itemStyle.borderColor = orig;
                item.itemStyle.borderWidth = 1;
              }
            });
          }
        } else if (separatorSet.has(s.type)) {
          // Treemap / sunburst: viền trắng phân cách giữa các ô/lớp
          if (!s.itemStyle) s.itemStyle = {};
          if (s.itemStyle.borderWidth == null) s.itemStyle.borderWidth = 1;
          if (s.itemStyle.borderColor == null) s.itemStyle.borderColor = sepColor;
        } else if (outlineSet.has(s.type)) {
          // Scatter / effectScatter: viền trắng quanh điểm để tách biệt khi chồng lên nhau
          if (!s.itemStyle) s.itemStyle = {};
          if (s.itemStyle.borderWidth == null) s.itemStyle.borderWidth = outWidth;
          if (s.itemStyle.borderColor == null) s.itemStyle.borderColor = outColor;
        }

        idx++;
      });
    },

    // Trích dữ liệu dạng [{col: val}] từ ECharts option để hiển thị DataView table.
    // Hỗ trợ: dataset.source (object-array hoặc array-of-arrays) và series[].data + xAxis.data.
    extractDataRows(opt) {
      // Case 1: dataset.source
      const ds = Array.isArray(opt.dataset) ? opt.dataset[0] : opt.dataset;
      if (ds && ds.source && ds.source.length) {
        const src = ds.source;
        // Object-array: [{field: val}] → dùng trực tiếp
        if (typeof src[0] === 'object' && !Array.isArray(src[0])) return src;
        // Array-of-arrays: first row = headers → convert
        if (Array.isArray(src[0])) {
          const [headers, ...rows] = src;
          return rows.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
        }
      }

      // Case 2: series[].data + category axis
      const series = (opt.series || []).filter(s => s && Array.isArray(s.data));
      if (!series.length) return null;
      const categories = (Array.isArray(opt.xAxis) ? opt.xAxis[0] : opt.xAxis)?.data
                      || (Array.isArray(opt.yAxis) ? opt.yAxis[0] : opt.yAxis)?.data
                      || [];
      if (categories.length) {
        return categories.map((cat, i) => {
          const row = { Danh_mục: cat };
          series.forEach(s => {
            const v = s.data[i];
            row[s.name || 'Giá trị'] = (v != null && typeof v === 'object') ? (v.value ?? v) : v;
          });
          return row;
        });
      }

      // Case 3: single series, no category — dùng index làm key
      if (series.length === 1 && series[0].data.length) {
        return series[0].data.map((v, i) => ({
          STT: i + 1,
          [series[0].name || 'Giá trị']: (typeof v === 'object' && v != null) ? (v.value ?? v) : v
        }));
      }

      return null;
    },

    toggleDataView() { this.showDataView = !this.showDataView; },

    injectDvStyles() {
      if (document.getElementById('fc-dv-style')) return;
      const s = document.createElement('style');
      s.id = 'fc-dv-style';
      s.textContent = [
        '.fc-dv-btn{position:absolute;top:6px;right:6px;z-index:1;width:26px;height:26px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.85);border:1px solid #ddd;border-radius:4px;cursor:pointer;font-size:16px;color:#555;}',
        '.fc-dv-btn:hover{background:#fff;color:#333;border-color:#aaa;}',
        '.fc-dv-overlay{position:absolute;inset:0;z-index:1;background:#fff;display:flex;flex-direction:column;border:1px solid #e0e0e0;border-radius:4px;overflow:hidden;}',
        '.fc-dv-header{display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:#f5f5f5;border-bottom:1px solid #ddd;font-size:12px;font-weight:600;color:#444;flex-shrink:0;}',
        '.fc-dv-close{background:none;border:none;font-size:14px;cursor:pointer;color:#666;padding:0 4px;line-height:1;}',
        '.fc-dv-close:hover{color:#d32f2f;}',
        '.fc-dv-body{overflow:auto;flex:1;}',
        '.fc-dv-table{width:100%;border-collapse:collapse;font-size:12px;}',
        '.fc-dv-table th{position:sticky;top:0;background:#f9f9f9;border:1px solid #e0e0e0;padding:5px 8px;text-align:left;font-weight:600;white-space:nowrap;}',
        '.fc-dv-table td{border:1px solid #f0f0f0;padding:4px 8px;white-space:nowrap;text-align:left;}',
        '.fc-dv-table tr:nth-child(even) td{background:#fafafa;}',
        '.fc-dv-table tr:hover td{background:#e8f4fd;}'
      ].join('');
      document.head.appendChild(s);
    },

    teardown() {
      window.removeEventListener('resize', this.resizeChart);
      if (this.timer) clearInterval(this.timer);
      if (this.chartInstance) this.chartInstance.dispose();
    },

    refresh()     { this.renderChart(); },
    resizeChart() { if (this.chartInstance) this.chartInstance.resize(); },
    getInstance() { return this.chartInstance; },

    exportImage(name = 'chart.png') {
      if (!this.chartInstance) return;
      const a = document.createElement('a');
      a.href     = this.chartInstance.getDataURL({ pixelRatio: 2, backgroundColor: '#fff' });
      a.download = name;
      a.click();
    },

    bindEvents() {
      this.chartInstance.on('click', p => {
        this.$emit('chart-click', p);
        this.$emit('drilldown',   p);
      });
      this.chartInstance.on('legendselectchanged', p => {
        this.$emit('legend-change', p);
      });
      this.chartInstance.on('finished', () => {
        this.$emit('finished');
      });
    }
  }
});
