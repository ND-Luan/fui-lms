// Bộ cellRenderer dựng sẵn của FSheet (tương đương THtml/TLink/TButton/TMenu của
// componentTable-3.0 cũ) — đăng ký sẵn trong initGrid() nên bất kỳ colDef nào cũng
// dùng được ngay qua "cellRenderer": "fsXxxCellRenderer", không cần khai gì thêm
// trong script.js của module. Cấu hình qua cellRendererParams (object hoặc hàm,
// AG Grid tự merge vào params) — dùng lại openWindow/tableActionEvent, 2 hàm global
// gốc của FUI (giống hệt componentTable-3.0), không tự chế lại action engine.
window.fsHtmlCellRenderer = function (p) {
  var div = document.createElement('div')
  div.innerHTML = p.value != null ? String(p.value) : ''
  return div
}

window.fsLinkCellRenderer = function (p) {
  var url = p.urlField ? p.data[p.urlField] : p.value
  var text = p.textField ? p.data[p.textField] : p.value
  var a = document.createElement('a')
  a.style.color = '#1976d2'
  a.innerHTML = (p.icon ? '<i class="mdi ' + p.icon + '" style="margin-right:4px"></i>' : '') + (text != null ? text : '')
  if (p.target === 'dialog') {
    a.href = 'javascript:void(0)'
    a.addEventListener('click', function (e) {
      e.preventDefault()
      openWindow({ id: p.wid, title: p.title, url: url, onclose: p.onclose })
    })
  } else {
    a.href = url || 'javascript:void(0)'
    a.target = p.target || '_blank'
  }
  return a
}

window.fsButtonCellRenderer = function (p) {
  var color = p.color || '#1976d2'
  var btn = document.createElement('button')
  btn.innerHTML = (p.icon ? '<i class="mdi ' + p.icon + '"></i> ' : '') + (p.label || '')
  btn.style.cssText = 'font-size:11px;padding:1px 8px;cursor:pointer;border-radius:3px;border:1px solid ' + color + ';color:' + color + ';background:white;line-height:1.6'
  btn.addEventListener('click', function () {
    if (p.url) openWindow({ id: p.wid, title: p.title, url: p.url, onclose: p.onclose })
    else tableActionEvent({ action: p.action, item: p.data })
  })
  return btn
}

window.fsMenuCellRenderer = function (p) {
  var items = typeof p.items === 'function' ? p.items(p) : (p.items || [])
  var btn = document.createElement('button')
  btn.innerHTML = '<i class="mdi ' + (p.icon || 'mdi-dots-vertical') + '"></i>'
  btn.style.cssText = 'border:none;background:transparent;cursor:pointer;font-size:18px;line-height:1;padding:2px 6px'
  btn.addEventListener('click', function (e) {
    e.stopPropagation()
    openFsMenu(btn, items, p.data)
  })
  return btn
}

function openFsMenu(anchor, items, rowData) {
  closeFsMenu()
  var rect = anchor.getBoundingClientRect()
  var panel = document.createElement('div')
  panel.style.cssText = 'position:fixed;z-index:9999;background:#fff;border:1px solid #ddd;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.15);min-width:160px;top:' + rect.bottom + 'px;left:' + rect.left + 'px'
  items.forEach(function (item) {
    var row = document.createElement('div')
    row.style.cssText = 'padding:8px 12px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:8px;color:' + (item.color || '#333')
    row.innerHTML = (item.icon ? '<i class="mdi ' + item.icon + '"></i>' : '') + '<span>' + item.text + '</span>'
    row.addEventListener('mouseenter', function () { row.style.background = '#f5f5f5' })
    row.addEventListener('mouseleave', function () { row.style.background = '' })
    row.addEventListener('click', function () {
      closeFsMenu()
      tableActionEvent({ action: item.action, item: rowData })
    })
    panel.appendChild(row)
  })
  document.body.appendChild(panel)
  window.__fsOpenMenuPanel = panel
  setTimeout(function () { document.addEventListener('click', closeFsMenu, { once: true }) }, 0)
}

function closeFsMenu() {
  if (window.__fsOpenMenuPanel) { window.__fsOpenMenuPanel.remove(); window.__fsOpenMenuPanel = null }
}

// Menu chuột phải kiểu Excel (icon + nhãn + phím tắt căn phải). Dùng chung panel/close
// với openFsMenu (window.__fsOpenMenuPanel) vì chỉ một menu mở tại một thời điểm.
function openFsContextMenu(x, y, items) {
  closeFsMenu()
  var panel = document.createElement('div')
  panel.style.cssText = 'position:fixed;z-index:9999;background:#fff;border:1px solid #ddd;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.15);min-width:220px;padding:4px 0;top:' + y + 'px;left:' + x + 'px'
  items.forEach(function (item) {
    var row = document.createElement('div')
    row.style.cssText = 'padding:8px 12px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:10px;color:#333'
    row.innerHTML = '<i class="mdi ' + item.icon + '" style="width:16px;color:#666"></i>' +
      '<span style="flex:1">' + item.text + '</span>' +
      (item.shortcut ? '<span style="color:#999;font-size:12px">' + item.shortcut + '</span>' : '')
    row.addEventListener('mouseenter', function () { row.style.background = '#f5f5f5' })
    row.addEventListener('mouseleave', function () { row.style.background = '' })
    row.addEventListener('click', function () { closeFsMenu(); item.action() })
    panel.appendChild(row)
  })
  document.body.appendChild(panel)
  window.__fsOpenMenuPanel = panel
  setTimeout(function () { document.addEventListener('click', closeFsMenu, { once: true }) }, 0)
  // Giữ trong viewport khi bấm chuột phải gần mép phải/dưới màn hình.
  var rect = panel.getBoundingClientRect()
  if (rect.right > window.innerWidth) panel.style.left = Math.max(0, window.innerWidth - rect.width - 4) + 'px'
  if (rect.bottom > window.innerHeight) panel.style.top = Math.max(0, window.innerHeight - rect.height - 4) + 'px'
}

// Copy qua menu (không phải Ctrl+C) không có DOM ClipboardEvent thật để lấy e.clipboardData
// → phải tự ghi vào clipboard hệ thống. navigator.clipboard cần secure context; nơi nào
// không có (http nội bộ, trình duyệt cũ) thì rơi về execCommand('copy') qua textarea ẩn.
function fsFallbackCopy(text) {
  var ta = document.createElement('textarea')
  ta.value = text
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px'
  document.body.appendChild(ta)
  ta.select()
  try { document.execCommand('copy') } catch (err) {}
  document.body.removeChild(ta)
}

// Class của chính AG Grid dùng để tô vùng chọn.
var FS_RANGE_CLASSES = [
  'ag-cell-range-selected', 'ag-cell-range-single-cell',
  'ag-cell-range-top', 'ag-cell-range-right', 'ag-cell-range-bottom', 'ag-cell-range-left',
  'ag-selection-fill-top', 'ag-selection-fill-right', 'ag-selection-fill-bottom', 'ag-selection-fill-left'
]

// CSS vùng chọn — vì sao f-sheet phải tự bơm:
// Bundle UMD của AG Grid có sẵn stylesheet legacy (community-modules/styles/ag-grid.css,
// gắn <style data-ag-scope="legacy"> vào head lúc load) và trong đó CÓ đủ CSS vùng chọn.
// NHƯNG ngay khi truyền theme:{...} (Theming API v33+), AG Grid gọi uninstallLegacyCSS()
// xoá sạch mấy <style data-ag-scope="legacy"> đó rồi bơm lại core.css + CSS của các module
// ĐANG đăng ký. Phần .ag-cell-range-*/.ag-selection-fill-*/.ag-fill-handle nằm trong CSS
// của CellSelectionModule (Enterprise) nên bản Community không bao giờ được bơm — gắn class
// vẫn thành công mà nhìn không thấy gì, đúng triệu chứng "không select được nhiều ô".
// Core.css chỉ giữ lại đúng .ag-cell-range-single-cell (viền ô đang focus) và
// .ag-cell{border:1px solid transparent} — nhờ vậy ở đây chỉ cần khai màu/kiểu viền.
// Viết theo biến CSS của theme nên màu vẫn đổi được bằng
// withParams({ rangeSelectionBackgroundColor, rangeSelectionBorderColor, rangeSelectionBorderStyle }).
// Mỗi var() đều kèm giá trị dự phòng: var() không giải được thì thuộc tính thành "invalid at
// computed-value time" → trong suốt, tức hỏng mà không báo gì. Có fallback thì xấu nhất vẫn nhìn thấy.
var FS_RANGE_BG = 'var(--ag-range-selection-background-color, rgba(33,150,243,.18))'
var FS_RANGE_BC = 'var(--ag-range-selection-border-color, #2196f3)'
var FS_RANGE_BS = 'var(--ag-range-selection-border-style, solid)'
function fsInstallRangeCss () {
  var st = document.getElementById('fsheet-range-css')
  if (!st) {
    st = document.createElement('style')
    st.id = 'fsheet-range-css'
    st.textContent = [
      // Nền vùng chọn. Chừa ô đang focus (giống Excel: ô neo vẫn nền trắng).
      '.ag-cell-range-selected:not(.ag-cell-focus){background-color:' + FS_RANGE_BG + '}',
      // Viền bao quanh khối. Ô đơn lẻ đã có viền sẵn từ core.css nên loại ra.
      '.ag-cell.ag-cell-range-selected:not(.ag-cell-range-single-cell).ag-cell-range-top{border-top-color:' + FS_RANGE_BC + ';border-top-style:' + FS_RANGE_BS + '}',
      '.ag-cell.ag-cell-range-selected:not(.ag-cell-range-single-cell).ag-cell-range-right{border-right-color:' + FS_RANGE_BC + ';border-right-style:' + FS_RANGE_BS + '}',
      '.ag-cell.ag-cell-range-selected:not(.ag-cell-range-single-cell).ag-cell-range-bottom{border-bottom-color:' + FS_RANGE_BC + ';border-bottom-style:' + FS_RANGE_BS + '}',
      '.ag-cell.ag-cell-range-selected:not(.ag-cell-range-single-cell).ag-cell-range-left{border-left-color:' + FS_RANGE_BC + ';border-left-style:' + FS_RANGE_BS + '}',
      // Viền đứt xem trước vùng sắp fill. Trái/phải phải !important vì .ag-cell đã bị
      // columnBorder của theme set border-right/left.
      '.ag-cell.ag-selection-fill-top{border-top:1px dashed ' + FS_RANGE_BC + '}',
      '.ag-cell.ag-selection-fill-bottom{border-bottom:1px dashed ' + FS_RANGE_BC + '}',
      '.ag-cell.ag-selection-fill-right{border-right:1px dashed ' + FS_RANGE_BC + '!important}',
      '.ag-cell.ag-selection-fill-left{border-left:1px dashed ' + FS_RANGE_BC + '!important}',
      // Nút vuông góc dưới-phải để kéo fill. .ag-cell là position:absolute (core.css) nên neo đúng.
      // Viền trắng bao quanh để nổi lên trên nền vùng chọn, z-index để ô kế bên không phủ mất.
      '.ag-fill-handle{position:absolute;bottom:-2px;right:-2px;width:8px;height:8px;z-index:1;cursor:crosshair;box-sizing:border-box;border:1px solid #fff;background-color:' + FS_RANGE_BC + '}',
      // Nháy báo đã copy: phủ một lớp xanh đậm (::after) NẰM TRÊN nền vùng chọn rồi mờ dần
      // opacity — không animate thẳng background-color của .ag-cell, vì màu đó đang bị luật
      // nền vùng chọn (.ag-cell-range-selected) tranh cùng thuộc tính, animation kết thúc là
      // "bật" ngược lại màu nền bên dưới, giật cục thay vì mờ dần mượt. ::after kế thừa
      // position:absolute từ .ag-cell (chính nó là containing block của pseudo-element) nên
      // inset:0 phủ khít, forwards giữ opacity 0 tới khi JS gỡ class, tránh chớp lại giữa lúc
      // animation xong và setTimeout gỡ class (flashCopy, cùng 800ms).
      '@keyframes fsCopyFlash{from{opacity:.6}to{opacity:0}}',
      '.ag-cell.ag-cell-copy-flash::after{content:"";position:absolute;inset:0;pointer-events:none;background-color:' + FS_RANGE_BC + ';animation:fsCopyFlash .8s ease-out forwards}'
    ].join('\n')
  }
  // appendChild trên node đã nằm trong head = DỜI xuống cuối, không nhân bản. Cần vậy vì
  // AG Grid bơm core.css lúc createGrid() (sau khi file này nạp), mà core.css có luật
  // .ag-cell.ag-cell-last-left-pinned:not(.ag-cell-range-right,…) cùng specificity (0,3,0)
  // với luật viền ở trên — ai đứng sau thì thắng, nên f-sheet phải đứng sau.
  document.head.appendChild(st)
}
fsInstallRangeCss()

// modulo luôn ra số dương (JS trả số âm với toán hạng âm) — dùng để lặp vòng khối nguồn khi fill.
function fsMod(a, n) { return ((a % n) + n) % n }

// Tách text clipboard (TSV của Excel/Sheets) thành mảng 2 chiều.
function fsParseClipboard(text) {
  var lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  while (lines.length && lines[lines.length - 1] === '') lines.pop()
  return lines.map(function (l) { return l.split('\t') })
}

var fsheetTheme = window.agGrid.themeQuartz
  .withPart(window.agGrid.iconSetQuartzLight)
  .withParams({
    borderRadius: 3,
    browserColorScheme: 'light',
    columnBorder: true,
    fontFamily: 'inherit',
    iconSize: 16,
    wrapperBorder: true,
    wrapperBorderRadius: 4
  })

Vue.component('FSheet', {
    template: `<div class="f-sheet-root"> <div class="d-flex align-center mb-2"> <span v-if="label" class="text-subtitle-1 font-weight-bold text-primary">{{ label }}</span> <v-spacer></v-spacer> <span v-if="changedCount > 0" class="text-caption text-orange mr-3">{{ changedCount }} dòng thay đổi</span> <v-btn icon variant="text" density="comfortable" color="primary" class="mr-2" title="Xuất Excel" @click="exportExcel"> <v-icon>mdi-microsoft-excel</v-icon> </v-btn> <v-btn v-if="allowAdd" icon variant="text" density="comfortable" color="primary" class="mr-2" title="Thêm dòng" @click="addRow"> <v-icon>mdi-plus</v-icon> </v-btn> <v-btn v-if="changedCount > 0" icon variant="text" density="comfortable" color="success" :loading="saving" :disabled="!updateApi" class="mr-2" title="Lưu thay đổi" @click="saveAll"> <v-icon>mdi-content-save</v-icon> </v-btn> <v-btn v-if="changedCount > 0" icon variant="text" density="comfortable" class="mr-2" title="Huỷ thay đổi" @click="discardAll"> <v-icon>mdi-undo-variant</v-icon> </v-btn> <v-btn v-if="allowDelete && selectedRows.length > 0" icon variant="text" density="comfortable" color="error" title="Xoá dòng đã chọn" @click="deleteSelected"> <v-icon>mdi-delete</v-icon> </v-btn> </div> <div ref="gridEl" :style="gridStyle"></div> </div>`, props: {
    label: {}, columns: {}, items: {}, rowKey: {},
    height: {},
    allowAdd: {}, allowDelete: {}, readonly: {},
    updateApi: {}, saveExtra: {}, defaultItem: {}, deleteApi: {}
  },
    data: function () {
      return {
        gridApi: null,
        changedRows: {},
        selectedRows: [],
        saving: false,
        localCounter: 0,
        fillHeight: 0
      }
    },
    computed: {
      changedCount: function () {
        return Object.keys(this.changedRows).length
      },
      // null = không khai height → lưới tự giãn theo số dòng (domLayout 'autoHeight')
      heightNum: function () {
        if (this.height === undefined || this.height === null || this.height === '') return null
        var n = Number(this.height)
        return isNaN(n) ? null : n
      },
      gridStyle: function () {
        if (this.heightNum === null) return { width: '100%' }
        var h = (this.heightNum > 0) ? this.heightNum : this.fillHeight
        if (!h) return { width: '100%' }
        return { height: h + 'px', width: '100%' }
      }
    },
    watch: {
      items: function (val) {
        if (this.gridApi) {
          this.buildOriginalData(val)
          if (!this.columns || !this.columns.length) {
            this.gridApi.setGridOption('columnDefs', this.buildColDefs(null))
          }
          this.gridApi.setGridOption('rowData', val || [])
          this.changedRows = {}
          this.selectedRows = []
          this.localCounter = 0
          // dữ liệu mới → vùng chọn cũ trỏ vào dòng không còn tồn tại, bỏ đi
          this.clearRange()
        }
      },
      columns: function (val) {
        if (this.gridApi) {
          this.gridApi.setGridOption('columnDefs', this.buildColDefs(val))
        }
      }
    },
    mounted: function () {
      this.initGrid()
      if (this.heightNum !== null && this.heightNum <= 0) {
        this.updateFillHeight()
        this.resizeHandler = this.updateFillHeight.bind(this)
        window.addEventListener('resize', this.resizeHandler)
      }
    },
    beforeDestroy: function () { this.destroyGrid() },
    beforeUnmount: function () { this.destroyGrid() },
    methods: {
      destroyGrid: function () {
        if (this.resizeHandler) {
          window.removeEventListener('resize', this.resizeHandler)
          this.resizeHandler = null
        }
        if (this.mouseUpHandler) {
          document.removeEventListener('mouseup', this.mouseUpHandler)
          this.mouseUpHandler = null
        }
        if (this.mouseDownHandler) {
          document.removeEventListener('pointerdown', this.mouseDownHandler, true)
          document.removeEventListener('mousedown', this.mouseDownHandler, true)
          this.mouseDownHandler = null
        }
        if (this.keyStateHandler) {
          document.removeEventListener('keydown', this.keyStateHandler, true)
          document.removeEventListener('keyup', this.keyStateHandler, true)
          this.keyStateHandler = null
        }
        if (this.rangeObserver) {
          this.rangeObserver.disconnect()
          this.rangeObserver = null
        }
        if (this.$refs.gridEl) {
          if (this.copyHandler) this.$refs.gridEl.removeEventListener('copy', this.copyHandler)
          if (this.pasteHandler) this.$refs.gridEl.removeEventListener('paste', this.pasteHandler)
          if (this.keyDownHandler) this.$refs.gridEl.removeEventListener('keydown', this.keyDownHandler)
          if (this.contextMenuHandler) this.$refs.gridEl.removeEventListener('contextmenu', this.contextMenuHandler)
        }
        this.copyHandler = null
        this.pasteHandler = null
        this.keyDownHandler = null
        this.contextMenuHandler = null
        if (this.copyFlashTimer) { clearTimeout(this.copyFlashTimer); this.copyFlashTimer = null }
        if (this.gridApi) {
          this.gridApi.destroy()
          this.gridApi = null
        }
      },
      updateFillHeight: function () {
        var self = this
        self.$nextTick(function () {
          requestAnimationFrame(function () {
            var el = self.$refs.gridEl
            if (!el) return
            var top = el.getBoundingClientRect().top
            var bottomMargin = Math.abs(self.heightNum)
            self.fillHeight = Math.max(200, window.innerHeight - top - bottomMargin)
          })
        })
      },
      buildOriginalData: function (rows) {
        var keyField = this.rowKey || 'id'
        this.originalData = {}
        this.originalRows = (rows || []).map(function (row) {
          var copy = Object.assign({}, row)
          var key = row[keyField]
          if (key !== undefined && key !== null) {
            this.originalData[String(key)] = copy
          }
          return copy
        }, this)
      },
      autoColDefs: function () {
        var sample = this.items && this.items[0]
        if (!sample) return []
        return Object.keys(sample).map(function (key) {
          return { field: key, headerName: key }
        })
      },
      changeCellStyle: function (params) {
        var self = this
        var keyField = self.rowKey || 'id'
        var field = params.colDef.field
        if (!field) return null
        var key = params.data && params.data[keyField]
        if (key === undefined || key === null) return null
        if (typeof key === 'number' && key < 0) {
          return { backgroundColor: '#e8f5e9' }
        }
        var orig = self.originalData && self.originalData[String(key)]
        if (orig && orig.hasOwnProperty(field) && params.value !== orig[field]) {
          return { backgroundColor: '#fff8e1' }
        }
        return null
      },
      parseByType: function (type, val) {
        if (type === 'number') {
          if (val === '' || val === null || val === undefined) return null
          if (typeof val === 'number') return val
          var num = Number(val)
          return isNaN(num) ? null : num
        }
        return val
      },

      // ===== Chọn vùng nhiều ô + fill handle + clipboard =====
      // AG Grid gate Cell Selection vào bản Enterprise (cả JS lẫn CSS của module đó), nên
      // f-sheet tự viết phần ĐIỀU KHIỂN rồi gắn đúng bộ class của AG Grid
      // (.ag-cell-range-*, .ag-selection-fill-*, .ag-fill-handle); CSS cho mấy class này
      // được bơm ở đầu file (xem khối #fsheet-range-css).
      // Tô vùng chọn bằng cách sửa class trực tiếp trên DOM (paintRange), KHÔNG dùng
      // refreshCells: refreshCells dựng lại cellRenderer của cả lưới, rê chuột một cái là
      // giật và làm rớt trạng thái ô đang sửa.
      // Giá trị ghi qua node.setDataValue nên onCellValueChanged vẫn chạy → phần
      // changedRows/highlight/lưu bên dưới không cần biết gì về đoạn này.
      colIndex: function (column) {
        if (!this.gridApi || !column) return -1
        return this.gridApi.getAllDisplayedColumns().indexOf(column)
      },
      rangeBounds: function () {
        var a = this.rangeStart, b = this.rangeEnd
        if (!a || !b) return null
        return {
          top: Math.min(a.row, b.row), bottom: Math.max(a.row, b.row),
          left: Math.min(a.col, b.col), right: Math.max(a.col, b.col)
        }
      },
      // Vùng SẼ được fill khi thả chuột (chỉ để vẽ viền đứt xem trước, chưa ghi gì).
      // Kéo chéo thì bám trục có độ lệch lớn hơn, giống Excel.
      fillTarget: function () {
        var r = this.rangeBounds()
        var e = this.fillEnd
        if (!r || !e) return null
        var dRow = e.row > r.bottom ? e.row - r.bottom : (e.row < r.top ? e.row - r.top : 0)
        var dCol = e.col > r.right ? e.col - r.right : (e.col < r.left ? e.col - r.left : 0)
        if (!dRow && !dCol) return null
        if (Math.abs(dRow) >= Math.abs(dCol)) {
          return dRow > 0
            ? { top: r.bottom + 1, bottom: e.row, left: r.left, right: r.right }
            : { top: e.row, bottom: r.top - 1, left: r.left, right: r.right }
        }
        return dCol > 0
          ? { top: r.top, bottom: r.bottom, left: r.right + 1, right: e.col }
          : { top: r.top, bottom: r.bottom, left: e.col, right: r.left - 1 }
      },
      schedulePaint: function () {
        var self = this
        if (self.paintPending) return
        self.paintPending = true
        requestAnimationFrame(function () { self.paintPending = false; self.paintRange() })
      },
      paintRange: function () {
        var self = this
        var el = self.$refs.gridEl
        if (!el || !self.gridApi) return
        var r = self.rangeBounds()
        var f = self.filling ? self.fillTarget() : null
        var single = !!r && r.top === r.bottom && r.left === r.right
        var columns = self.gridApi.getAllDisplayedColumns()
        var idx = {}
        columns.forEach(function (c, i) { idx[c.getColId()] = i })
        var corner = null
        var cells = el.querySelectorAll('.ag-cell')
        var matched = 0

        Array.prototype.forEach.call(cells, function (cell) {
          cell.classList.remove.apply(cell.classList, FS_RANGE_CLASSES)
          // closest chứ không phải parentElement: từ v36 AG Grid bọc ô trong cell-section
          // (.ag-row > .ag-grid-pinned-left-cells|.ag-grid-scrolling-cells >
          // .ag-grid-container-wrapper > .ag-cell), row-index vẫn nằm trên .ag-row nên
          // parentElement trỏ vào wrapper và tra ra null → NaN → rụng sạch mọi ô.
          var rowEl = cell.closest('.ag-row')
          var row = rowEl ? parseInt(rowEl.getAttribute('row-index'), 10) : NaN
          var col = idx[cell.getAttribute('col-id')]
          if (isNaN(row) || col === undefined) return
          matched++
          if (r && row >= r.top && row <= r.bottom && col >= r.left && col <= r.right) {
            cell.classList.add('ag-cell-range-selected')
            if (single) {
              cell.classList.add('ag-cell-range-single-cell')
            } else {
              if (row === r.top) cell.classList.add('ag-cell-range-top')
              if (row === r.bottom) cell.classList.add('ag-cell-range-bottom')
              if (col === r.left) cell.classList.add('ag-cell-range-left')
              if (col === r.right) cell.classList.add('ag-cell-range-right')
            }
            if (row === r.bottom && col === r.right) corner = cell
          }
          if (f && row >= f.top && row <= f.bottom && col >= f.left && col <= f.right) {
            if (row === f.top) cell.classList.add('ag-selection-fill-top')
            if (row === f.bottom) cell.classList.add('ag-selection-fill-bottom')
            if (col === f.left) cell.classList.add('ag-selection-fill-left')
            if (col === f.right) cell.classList.add('ag-selection-fill-right')
          }
        })

        // .ag-fill-handle là element con thật (AG Grid style sẵn position/size/cursor),
        // không phải pseudo-element, nên phải gắn/gỡ DOM. Ô .ag-cell đã là position:absolute
        // nên nó tự neo đúng góc dưới-phải.
        Array.prototype.forEach.call(el.querySelectorAll('.ag-fill-handle'), function (h) { h.remove() })
        // Cột không cho sửa (colDef.editable:false) thì cũng không cho kéo fill xuống/ngang
        // — isCellEditable() là API sẵn có của AG Grid, đã dùng đúng chỗ này ở doFill/pasteText.
        var cornerCol = r ? columns[r.right] : null
        var cornerNode = r ? self.gridApi.getDisplayedRowAtIndex(r.bottom) : null
        if (corner && !self.readonly && cornerCol && cornerNode && cornerCol.isCellEditable(cornerNode)) {
          var handle = document.createElement('div')
          handle.className = 'ag-fill-handle'
          corner.appendChild(handle)
        }

        // Có vùng chọn mà không khớp ô nào = cấu trúc DOM của AG Grid đã đổi (row-index/col-id
        // nằm chỗ khác). Kêu đúng một lần kèm số liệu cần thiết, khỏi phải dò lại từ đầu.
        if (r && matched === 0 && cells.length && !self.rangeWarned) {
          self.rangeWarned = true
          var c0 = cells[0]
          console.warn('[f-sheet] paintRange khớp 0 ô — DOM của AG Grid có thể đã đổi.', {
            cells: cells.length,
            parent: c0.parentElement && c0.parentElement.className,
            rowIndex: c0.closest('.ag-row') && c0.closest('.ag-row').getAttribute('row-index'),
            colId: c0.getAttribute('col-id'),
            colIds: Object.keys(idx)
          })
        }
      },
      // Chặn bôi đen chữ khi đang rê chọn vùng.
      lockSelect: function (on) {
        var el = this.$refs.gridEl
        if (el) el.style.userSelect = on ? 'none' : ''
      },
      clearRange: function () {
        this.rangeStart = null
        this.rangeEnd = null
        this.fillEnd = null
        this.paintRange()
      },
      doFill: function () {
        var self = this
        var r = self.rangeBounds()
        var t = self.fillTarget()
        if (!r || !t || self.readonly) return
        var cols = self.gridApi.getAllDisplayedColumns()
        var spanR = r.bottom - r.top + 1
        var spanC = r.right - r.left + 1
        for (var row = t.top; row <= t.bottom; row++) {
          var node = self.gridApi.getDisplayedRowAtIndex(row)
          if (!node) continue
          // lặp lại tuần tự khối nguồn (kiểu copy), không tự suy diễn dãy số tăng dần
          var srcNode = self.gridApi.getDisplayedRowAtIndex(r.top + fsMod(row - r.top, spanR))
          if (!srcNode) continue
          for (var col = t.left; col <= t.right; col++) {
            var column = cols[col]
            var srcCol = cols[r.left + fsMod(col - r.left, spanC)]
            if (!column || !srcCol) continue
            var cd = column.getColDef()
            var sf = srcCol.getColDef().field
            if (!cd.field || !sf || !column.isCellEditable(node)) continue
            node.setDataValue(cd.field, srcNode.data ? srcNode.data[sf] : null)
          }
        }
        // vùng chọn mới bao trùm cả khối nguồn lẫn phần vừa fill
        self.rangeStart = { row: Math.min(r.top, t.top), col: Math.min(r.left, t.left) }
        self.rangeEnd = { row: Math.max(r.bottom, t.bottom), col: Math.max(r.right, t.right) }
      },
      // Vùng đang chọn, hoặc nếu không có thì ô đang focus (dùng chung cho copy/cut/paste
      // dù gọi từ phím tắt hay từ menu chuột phải).
      currentRangeOrFocus: function () {
        var self = this
        var r = self.rangeBounds()
        if (r) return r
        var fc = self.gridApi.getFocusedCell()
        if (!fc) return null
        var ci = self.colIndex(fc.column)
        return { top: fc.rowIndex, bottom: fc.rowIndex, left: ci, right: ci }
      },
      // Dựng text TSV cho một vùng — dùng chung cho Ctrl+C và menu Copy/Copy with Headers.
      rangeText: function (r, withHeaders) {
        var self = this
        var cols = self.gridApi.getAllDisplayedColumns()
        var out = []
        if (withHeaders) {
          var head = []
          for (var hc = r.left; hc <= r.right; hc++) {
            var hcol = cols[hc]
            head.push(hcol ? (hcol.getColDef().headerName || hcol.getColDef().field || '') : '')
          }
          out.push(head.join('\t'))
        }
        for (var i = r.top; i <= r.bottom; i++) {
          var node = self.gridApi.getDisplayedRowAtIndex(i)
          if (!node) continue
          var line = []
          for (var c = r.left; c <= r.right; c++) {
            var column = cols[c]
            if (!column) continue
            var f = column.getColDef().field
            var v = (f && node.data) ? node.data[f] : ''
            line.push(v === null || v === undefined ? '' : String(v))
          }
          out.push(line.join('\t'))
        }
        return out.join('\n')
      },
      // Ghi clipboard hệ thống khi KHÔNG có ClipboardEvent thật (bấm menu, không phải Ctrl+C).
      writeClipboard: function (text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(function () { fsFallbackCopy(text) })
        } else {
          fsFallbackCopy(text)
        }
      },
      // Nháy nền vùng vừa copy để báo hiệu — gỡ rồi gắn lại class để animation chạy lại
      // được cả khi copy liên tiếp cùng một vùng (đổi class suông không tự restart animation).
      flashCopy: function (r) {
        var self = this
        var el = self.$refs.gridEl
        if (!el || !self.gridApi) return
        var cols = self.gridApi.getAllDisplayedColumns()
        var idx = {}
        cols.forEach(function (c, i) { idx[c.getColId()] = i })
        var hit = []
        Array.prototype.forEach.call(el.querySelectorAll('.ag-cell'), function (cell) {
          var rowEl = cell.closest('.ag-row')
          var row = rowEl ? parseInt(rowEl.getAttribute('row-index'), 10) : NaN
          var col = idx[cell.getAttribute('col-id')]
          if (isNaN(row) || col === undefined) return
          if (row >= r.top && row <= r.bottom && col >= r.left && col <= r.right) hit.push(cell)
        })
        if (!hit.length) return
        clearTimeout(self.copyFlashTimer)
        hit.forEach(function (cell) { cell.classList.remove('ag-cell-copy-flash'); void cell.offsetWidth })
        hit.forEach(function (cell) { cell.classList.add('ag-cell-copy-flash') })
        self.copyFlashTimer = setTimeout(function () {
          hit.forEach(function (cell) { cell.classList.remove('ag-cell-copy-flash') })
        }, 800)
      },
      doCopy: function (e) {
        var self = this
        var r = self.currentRangeOrFocus()
        if (!r) return
        var text = self.rangeText(r, false)
        if (!text) return
        e.clipboardData.setData('text/plain', text)
        e.preventDefault()
        self.flashCopy(r)
      },
      // Copy / Copy with Headers từ menu chuột phải — không có ClipboardEvent nên tự ghi clipboard.
      menuCopy: function (withHeaders) {
        var self = this
        var r = self.currentRangeOrFocus()
        if (!r) return
        var text = self.rangeText(r, withHeaders)
        if (!text) return
        self.writeClipboard(text)
        self.flashCopy(r)
      },
      // Cut từ menu chuột phải: copy rồi xoá giá trị các ô trong vùng (chỉ ô sửa được).
      menuCut: function () {
        var self = this
        if (self.readonly) return
        var r = self.currentRangeOrFocus()
        if (!r) return
        var text = self.rangeText(r, false)
        if (!text) return
        self.writeClipboard(text)
        self.flashCopy(r)
        var cols = self.gridApi.getAllDisplayedColumns()
        for (var i = r.top; i <= r.bottom; i++) {
          var node = self.gridApi.getDisplayedRowAtIndex(i)
          if (!node) continue
          for (var c = r.left; c <= r.right; c++) {
            var column = cols[c]
            if (!column) continue
            var cd = column.getColDef()
            if (!cd.field || !column.isCellEditable(node)) continue
            node.setDataValue(cd.field, null)
          }
        }
      },
      // Lõi dán dùng chung cho Ctrl+V (ClipboardEvent) và menu Paste (Clipboard API).
      pasteText: function (text) {
        var self = this
        if (self.readonly || !text) return
        var r = self.currentRangeOrFocus()
        if (!r) return
        var startRow = r.top, startCol = r.left
        var grid = fsParseClipboard(text)
        var cols = self.gridApi.getAllDisplayedColumns()
        grid.forEach(function (rowVals, i) {
          var node = self.gridApi.getDisplayedRowAtIndex(startRow + i)
          if (!node) return
          rowVals.forEach(function (val, j) {
            var column = cols[startCol + j]
            if (!column) return
            var cd = column.getColDef()
            if (!cd.field || !column.isCellEditable(node)) return
            node.setDataValue(cd.field, cd.type === 'number' ? self.parseByType('number', val) : val)
          })
        })
        self.rangeStart = { row: startRow, col: startCol }
        self.rangeEnd = {
          row: startRow + grid.length - 1,
          col: startCol + (grid[0] ? grid[0].length : 1) - 1
        }
        self.schedulePaint()
      },
      doPaste: function (e) {
        var self = this
        if (self.readonly) return
        var cb = e.clipboardData || window.clipboardData
        var text = cb ? cb.getData('text') : ''
        if (!text) return
        e.preventDefault()
        self.pasteText(text)
      },
      // Paste từ menu chuột phải: không có ClipboardEvent nên phải chủ động đọc clipboard
      // (Clipboard API, cần secure context + có thể xin quyền lần đầu).
      menuPaste: function () {
        var self = this
        if (self.readonly) return
        if (navigator.clipboard && navigator.clipboard.readText) {
          navigator.clipboard.readText().then(function (text) { self.pasteText(text) }).catch(function () {
            Vue.$toast.error('Không đọc được clipboard — thử Ctrl+V hoặc cấp quyền clipboard cho trang.', { position: 'top' })
          })
        } else {
          Vue.$toast.error('Trình duyệt không hỗ trợ đọc clipboard qua menu — dùng Ctrl+V.', { position: 'top' })
        }
      },
      buildColDefs: function (cols) {
        var self = this
        var source = (cols && cols.length) ? cols : self.autoColDefs()
        var defs = []
  
        if (self.allowDelete && !self.readonly) {
          defs.push({
            headerName: '',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            width: 44,
            minWidth: 44,
            maxWidth: 44,
            sortable: false,
            filter: false,
            resizable: false,
            editable: false,
            pinned: 'left'
          })
        }
  
        source.forEach(function (col) {
          var def = Object.assign({}, col)
          if (self.readonly) def.editable = false
          // colDef có thể khai cellEditorParams bằng tên string trỏ tới hàm global (vd
          // script.js của module) khi cần giá trị động (vd danh sách chọn lấy từ vueData) —
          // AG Grid hỗ trợ cellEditorParams là function (gọi lại lúc bắt đầu sửa) nên chỉ cần
          // resolve tên thành function thật, không cần cơ chế đăng ký riêng như cellRenderer.
          ;['cellEditorParams', 'cellRendererParams'].forEach(function (key) {
            if (typeof def[key] === 'string' && typeof window[def[key]] === 'function') {
              def[key] = window[def[key]]
            }
          })
          var userCellStyle = def.cellStyle
          var isNumber = def.type === 'number'
          // Nền vùng chọn do paintRange gắn class lo, không đụng vào cellStyle. Nhờ vậy
          // nền vàng/xanh của ô đã sửa (style inline) vẫn thắng nền vùng chọn (CSS class)
          // → quét chọn ngang qua không làm mất dấu ô đang có thay đổi chưa lưu.
          def.cellStyle = function (params) {
            var change = self.changeCellStyle(params)
            var extra = (typeof userCellStyle === 'function') ? userCellStyle(params) : userCellStyle
            if (!extra && isNumber) extra = { textAlign: 'right' }
            if (change && extra) return Object.assign({}, extra, change)
            return change || extra || null
          }
          if (isNumber && !def.valueFormatter) {
            def.valueFormatter = function (params) {
              if (params.value === null || params.value === undefined || params.value === '') return ''
              var n = Number(params.value)
              if (isNaN(n)) return String(params.value)
              return n.toLocaleString('en-US', { maximumFractionDigits: 10 })
            }
          }
          if (isNumber && !def.valueParser) {
            def.valueParser = function (params) { return self.parseByType('number', params.newValue) }
          }
          defs.push(def)
        })
  
        return defs
      },
      initGrid: function () {
        var self = this
        var keyField = self.rowKey || 'id'
        self.buildOriginalData(self.items)

        // Trạng thái vùng chọn — cố ý KHÔNG khai trong data(): đổi liên tục khi rê chuột,
        // để reactive chỉ tốn công theo dõi mà template không hề dùng tới. Việc vẽ lại
        // do paintRange() chủ động gọi.
        self.rangeStart = null
        self.rangeEnd = null
        self.selecting = false
        self.filling = false
        self.fillEnd = null
        self.paintPending = false
        self.handleGrab = false
        self.shiftGrab = false
        self.rightClick = false
        self.rangeWarned = false
        self.copyFlashTimer = null

        var colDefs = self.buildColDefs(self.columns)
        // colDef có thể khai cellRenderer/cellEditor bằng tên string trỏ tới class/hàm
        // global (vd script.js của module) — AG Grid cần đăng ký tường minh trong
        // components thì mới resolve được, không tự dò theo window[name].
        // Tên editor có sẵn của AG Grid (vd agDateStringCellEditor) không cần đăng ký,
        // chỉ những hàm global tự viết (window[name] là function) mới được thêm vào đây.
        // Column group (headerName + children) phải quét đệ quy vì colDef thật nằm
        // trong children, không phải ở object group.
        var components = {
          fsHtmlCellRenderer: fsHtmlCellRenderer,
          fsLinkCellRenderer: fsLinkCellRenderer,
          fsButtonCellRenderer: fsButtonCellRenderer,
          fsMenuCellRenderer: fsMenuCellRenderer
        }
        function collectComponents(defs) {
          (defs || []).forEach(function (def) {
            if (def.children) { collectComponents(def.children); return }
            ['cellRenderer', 'cellEditor'].forEach(function (key) {
              var name = def[key]
              if (typeof name === 'string' && !components[name] && typeof window[name] === 'function') {
                components[name] = window[name]
              }
            })
          })
        }
        collectComponents(colDefs)

        self.gridApi = window.agGrid.createGrid(self.$refs.gridEl, {
          theme: fsheetTheme,
          components: components,
          columnDefs: colDefs,
          rowData: self.items || [],
          domLayout: (self.heightNum === null) ? 'autoHeight' : 'normal',
          columnTypes: {
            number: { filter: 'agNumberColumnFilter' }
          },
          rowSelection: (self.allowDelete && !self.readonly) ? 'multiple' : undefined,
          suppressRowClickSelection: true,
          defaultColDef: {
            // AG Grid mặc định editable=false; f-sheet là lưới NHẬP LIỆU nên bật sẵn,
            // cột nào chỉ đọc thì khai editable:false trong colDef.
            editable: !self.readonly,
            sortable: true,
            filter: true,
            resizable: true,
            flex: 1,
            minWidth: 80
          },
          rowHeight: 36,
          headerHeight: 36,
          animateRows: true,
          stopEditingWhenCellsLoseFocus: true,
          onSelectionChanged: function () {
            self.selectedRows = self.gridApi.getSelectedRows()
          },
          // Bấm trúng chính element .ag-fill-handle thì là kéo fill, còn lại là quét chọn
          // vùng mới. Nhận diện bằng e.target (cờ handleGrab đặt ở pha capture bên dưới)
          // chứ không đo toạ độ góc ô — handle là element thật nên hỏi thẳng nó.
          // Bỏ qua cột không có field (cột checkbox chọn dòng).
          onCellMouseDown: function (params) {
            var e = params.event
            if (!e || e.button !== 0) return
            if (!params.column.getColDef().field) return
            var row = params.node.rowIndex
            var col = self.colIndex(params.column)
            if (self.handleGrab) {
              self.filling = true
              self.fillEnd = { row: row, col: col }
              self.lockSelect(true)
              return
            }
            if (e.shiftKey && self.rangeStart) {
              self.rangeEnd = { row: row, col: col }
            } else {
              self.rangeStart = { row: row, col: col }
              self.rangeEnd = { row: row, col: col }
            }
            self.selecting = true
            self.lockSelect(true)
            self.paintRange()
          },
          onCellMouseOver: function (params) {
            if (!params.node || params.node.rowIndex == null) return
            var pos = { row: params.node.rowIndex, col: self.colIndex(params.column) }
            if (self.filling) { self.fillEnd = pos; self.schedulePaint(); return }
            if (!self.selecting) return
            if (!params.column.getColDef().field) return
            self.rangeEnd = pos
            self.schedulePaint()
          },
          // Di chuyển ô bằng bàn phím → thu vùng chọn về đúng ô đang focus (giống Excel),
          // TRỪ khi đang giữ Shift thì kéo dài vùng chọn tới ô mới (Shift+mũi tên kiểu Excel)
          // thay vì thu về 1 ô — self.shiftGrab phản ánh trạng thái Shift tại thời điểm
          // mousedown/keydown gần nhất (xem mouseDownHandler/keyStateHandler bên dưới).
          // Trong lúc đang rê chuột thì bỏ qua, nếu không sẽ đạp lên vùng vừa quét.
          onCellFocused: function (params) {
            if (self.selecting || self.filling || self.handleGrab || self.rightClick) return
            if (params.rowIndex == null || !params.column || typeof params.column === 'string') return
            var col = self.colIndex(params.column)
            if (self.shiftGrab && self.rangeStart) {
              self.rangeEnd = { row: params.rowIndex, col: col }
            } else {
              self.rangeStart = { row: params.rowIndex, col: col }
              self.rangeEnd = { row: params.rowIndex, col: col }
            }
            // paintRange() thẳng chứ không schedulePaint(): AG Grid tự gỡ .ag-cell-focus khỏi
            // ô cũ NGAY trong cùng thao tác focus, còn schedulePaint() hoãn việc gỡ
            // .ag-cell-range-selected sang khung hình animation kế tiếp — trong khoảng hở đó ô
            // cũ khớp ".ag-cell-range-selected:not(.ag-cell-focus)" nên nền chớp sáng lên rồi
            // mới tắt. Gọi đồng bộ giống onCellMouseDown thì không còn khoảng hở đó nữa.
            self.paintRange()
          },
          // Cuộn/ảo hoá cột/sắp xếp/lọc đều dựng lại DOM ô → class tô vùng chọn bị mất,
          // phải vẽ lại. Sắp xếp và lọc không phát hai event kia nên cần onModelUpdated.
          onBodyScroll: function () { self.schedulePaint() },
          onVirtualColumnsChanged: function () { self.schedulePaint() },
          onModelUpdated: function () { self.schedulePaint() },
          onCellValueChanged: function (params) {
            var field = params.colDef.field
            if (field && params.colDef.type === 'number') {
              var coerced = self.parseByType('number', params.newValue)
              if (coerced !== params.newValue) {
                params.data[field] = coerced
                params.newValue = coerced
              }
            }
            var key = params.data[keyField]
            if (key !== undefined && key !== null) {
              var next = {}
              for (var k in self.changedRows) {
                if (Object.prototype.hasOwnProperty.call(self.changedRows, k)) next[k] = self.changedRows[k]
              }
              next[String(key)] = params.data
              self.changedRows = next
            }
            // refreshCells dựng lại DOM ô → mất class vùng chọn, vẽ lại ngay sau đó
            self.gridApi.refreshCells({ force: true })
            self.schedulePaint()
            self.$emit('change', params.data, params.colDef.field, params.newValue)
          }
        })

        // createGrid() vừa bơm core.css của AG Grid vào cuối <head> → dời style của f-sheet
        // xuống sau nó, nếu không mấy luật viền cùng specificity sẽ bị đè.
        fsInstallRangeCss()

        // Ghi nhận ở pha CAPTURE nên chắc chắn chạy trước mọi handler của AG Grid: thứ tự
        // giữa onCellMouseDown và onCellFocused không được đảm bảo, mà nếu onCellFocused
        // chạy trước thì nó thu vùng chọn về 1 ô → kéo fill mất sạch khối nguồn.
        self.mouseDownHandler = function (e) {
          var t = e.target
          self.handleGrab = !!(t && t.classList && t.classList.contains('ag-fill-handle'))
          self.shiftGrab = !!e.shiftKey
          self.rightClick = e.button === 2
        }
        // AG Grid tự focus lại ô ngay khi bấm chuột (kể cả chuột phải, vì bản Community
        // không có rangeSvc thật nên nhánh "giữ nguyên vùng chọn khi chuột phải trong vùng"
        // của chính AG Grid không có tác dụng) — nhưng việc đó chạy trên sự kiện
        // "pointerdown" (Pointer Events, feature-detect trong RowContainerEventsFeature),
        // KHÔNG PHẢI "mousedown". pointerdown luôn bắn TRƯỚC mousedown trong cùng một cú
        // bấm, nên nếu chỉ nghe mousedown thì self.rightClick được set quá trễ — AG Grid đã
        // kịp đổi focus (và bắn mutation cho rangeObserver) trước khi cờ kịp bật. Nghe thêm
        // pointerdown ở pha capture trên document để chắc chắn chạy trước AG Grid dù nó
        // dùng loại event nào (giữ luôn mousedown làm phương án dự phòng cho trình duyệt/
        // input không hỗ trợ Pointer Events).
        document.addEventListener('pointerdown', self.mouseDownHandler, true)
        document.addEventListener('mousedown', self.mouseDownHandler, true)
        // Cùng cờ shiftGrab ở trên nhưng cập nhật theo bàn phím: AG Grid tự di chuyển focus
        // khi bấm mũi tên (kể cả giữ Shift, Cell Selection Enterprise mới có kiểu "kéo dài
        // vùng chọn" sẵn — bản Community không có nên f-sheet tự làm ở onCellFocused), nên
        // cần biết Shift có đang giữ hay không NGAY LÚC bắt phím, trước khi onCellFocused chạy.
        self.keyStateHandler = function (e) { self.shiftGrab = !!e.shiftKey }
        document.addEventListener('keydown', self.keyStateHandler, true)
        document.addEventListener('keyup', self.keyStateHandler, true)
        // AG Grid gọi các callback gridOptions.onXxx (onCellFocused, onCellMouseDown...)
        // qua một hàng đợi setTimeout(0) riêng (mọi "grid event" public đều async, trừ đúng
        // 3 cái không liên quan tới đây), TRỄ hơn hẳn việc chính AG Grid gỡ/gắn class
        // .ag-cell-focus lên DOM — việc đó chạy ĐỒNG BỘ ngay trong lúc xử lý mousedown/phím
        // mũi tên (RowRenderer.updateCellFocus). Khoảng hở này là lý do onCellFocused gọi
        // paintRange() đồng bộ (bên trên) vẫn chớp: lúc callback của AG Grid chạy tới thì
        // trình duyệt đã kịp vẽ một khung hình với ô cũ mất .ag-cell-focus mà vẫn còn
        // .ag-cell-range-selected. MutationObserver không lệ thuộc hàng đợi đó — callback của
        // nó luôn chạy ở microtask ngay sau khi DOM đổi, tức luôn trước khung hình kế tiếp —
        // nên bắt trực tiếp lúc .ag-cell-focus đổi rồi tự suy ra ô đang focus qua DOM
        // (giống contextMenuHandler bên dưới) mà không cần chờ AG Grid gọi lại callback.
        self.rangeObserver = new MutationObserver(function (records) {
          if (self.selecting || self.filling || self.handleGrab || self.rightClick) return
          var focusChanged = records.some(function (m) {
            if (m.attributeName !== 'class' || !m.target.classList) return false
            var had = (m.oldValue || '').indexOf('ag-cell-focus') !== -1
            return had !== m.target.classList.contains('ag-cell-focus')
          })
          if (!focusChanged) return
          var el = self.$refs.gridEl
          var focusedCell = el && el.querySelector('.ag-cell-focus')
          if (!focusedCell) return
          var rowEl = focusedCell.closest('.ag-row')
          var row = rowEl ? parseInt(rowEl.getAttribute('row-index'), 10) : NaN
          var columns = self.gridApi.getAllDisplayedColumns()
          var idx = {}
          columns.forEach(function (c, i) { idx[c.getColId()] = i })
          var col = idx[focusedCell.getAttribute('col-id')]
          if (isNaN(row) || col === undefined) return
          if (self.shiftGrab && self.rangeStart) {
            self.rangeEnd = { row: row, col: col }
          } else {
            self.rangeStart = { row: row, col: col }
            self.rangeEnd = { row: row, col: col }
          }
          self.paintRange()
        })
        self.rangeObserver.observe(self.$refs.gridEl, { attributes: true, attributeFilter: ['class'], attributeOldValue: true, subtree: true })
        // mouseup nghe ở document (không phải ở lưới) để thả chuột ngoài lưới vẫn kết thúc
        // được thao tác, tránh kẹt trạng thái đang quét.
        self.mouseUpHandler = function () {
          if (self.filling) {
            self.filling = false
            self.doFill()
            self.fillEnd = null
          }
          self.selecting = false
          self.handleGrab = false
          self.shiftGrab = false
          self.lockSelect(false)
          self.paintRange()
        }
        document.addEventListener('mouseup', self.mouseUpHandler)
        // copy/paste gắn ở gridEl: sự kiện nổi lên từ ô đang focus của AG Grid, nên chỉ
        // chạy khi người dùng thực sự đang ở trong lưới này.
        self.copyHandler = function (e) { self.doCopy(e) }
        self.pasteHandler = function (e) { self.doPaste(e) }
        self.keyDownHandler = function (e) { if (e.key === 'Escape') self.clearRange() }
        self.$refs.gridEl.addEventListener('copy', self.copyHandler)
        self.$refs.gridEl.addEventListener('paste', self.pasteHandler)
        self.$refs.gridEl.addEventListener('keydown', self.keyDownHandler)
        // Chuột phải trong ô: nếu ô đó nằm ngoài vùng đang chọn thì thu vùng chọn về đúng
        // ô đó trước (giống Excel), rồi mở menu Cut/Copy/Copy with Headers/Paste tại vị trí
        // con trỏ. Bỏ qua cột không có field (vd cột checkbox) để không đạp lên vùng đang chọn.
        self.contextMenuHandler = function (e) {
          var cellEl = e.target && e.target.closest && e.target.closest('.ag-cell')
          if (!cellEl) return
          e.preventDefault()
          var rowEl = cellEl.closest('.ag-row')
          var row = rowEl ? parseInt(rowEl.getAttribute('row-index'), 10) : NaN
          var cols = self.gridApi.getAllDisplayedColumns()
          var idx = {}
          cols.forEach(function (c, i) { idx[c.getColId()] = i })
          var col = idx[cellEl.getAttribute('col-id')]
          if (isNaN(row) || col === undefined) return
          var r = self.rangeBounds()
          var inside = !!r && row >= r.top && row <= r.bottom && col >= r.left && col <= r.right
          var hasField = cols[col] && cols[col].getColDef().field
          if (!inside && hasField) {
            self.rangeStart = { row: row, col: col }
            self.rangeEnd = { row: row, col: col }
            self.paintRange()
          }
          var items = []
          if (!self.readonly) {
            items.push({ icon: 'mdi-content-cut', text: 'Cut', shortcut: 'Ctrl+X', action: function () { self.menuCut() } })
          }
          items.push({ icon: 'mdi-content-copy', text: 'Copy', shortcut: 'Ctrl+C', action: function () { self.menuCopy(false) } })
          items.push({ icon: 'mdi-content-duplicate', text: 'Copy with Headers', action: function () { self.menuCopy(true) } })
          if (!self.readonly) {
            items.push({ icon: 'mdi-content-paste', text: 'Paste', shortcut: 'Ctrl+V', action: function () { self.menuPaste() } })
          }
          openFsContextMenu(e.clientX, e.clientY, items)
        }
        self.$refs.gridEl.addEventListener('contextmenu', self.contextMenuHandler)
      },
      getChangedRows: function () {
        var rows = []
        for (var k in this.changedRows) {
          if (Object.prototype.hasOwnProperty.call(this.changedRows, k)) rows.push(this.changedRows[k])
        }
        return rows
      },
      addRow: function () {
        if (!this.gridApi) return
        this.localCounter--
        var newRow = {}
        mapData(this.defaultItem || {}, newRow, vueData)
        newRow[this.rowKey || 'id'] = this.localCounter
        this.gridApi.applyTransaction({ add: [newRow], addIndex: 0 })
        var next = {}
        for (var k in this.changedRows) {
          if (Object.prototype.hasOwnProperty.call(this.changedRows, k)) next[k] = this.changedRows[k]
        }
        next[String(this.localCounter)] = newRow
        this.changedRows = next
        this.gridApi.refreshCells({ force: true })
      },
      deleteRow: function (row) {
        var self = this
        var keyField = self.rowKey || 'id'
        var key = row[keyField]
        var isNew = typeof key === 'number' && key < 0
  
        function removeFromGrid() {
          self.gridApi.applyTransaction({ remove: [row] })
          var next = {}
          for (var k in self.changedRows) {
            if (Object.prototype.hasOwnProperty.call(self.changedRows, k) && k !== String(key)) next[k] = self.changedRows[k]
          }
          self.changedRows = next
          if (self.originalData) delete self.originalData[String(key)]
        }
  
        if (isNew) { removeFromGrid(); return }
        if (!self.deleteApi) { removeFromGrid(); return }
        var extra = {}
        mapData(self.saveExtra || {}, extra, vueData)
        ajaxCALL(self.deleteApi, Object.assign({}, extra, row), function (res) {
          var r = res && res.data && res.data[0] ? res.data[0] : null
          if (r && r.Message) {
            if (r.Success) { Vue.$toast.success(r.Message, { position: 'top' }); removeFromGrid() }
            else Vue.$toast.error(r.Message, { position: 'top' })
          } else {
            removeFromGrid()
          }
        }, function () {
          Vue.$toast.error('Lỗi khi xoá dữ liệu', { position: 'top' })
        })
      },
      deleteSelected: function () {
        var self = this
        var rows = self.selectedRows.slice()
        if (!rows.length) return
        var hasApi = self.deleteApi
        var newRows = rows.filter(function (r) {
          return typeof r[self.rowKey || 'id'] === 'number' && r[self.rowKey || 'id'] < 0
        })
        var existRows = rows.filter(function (r) {
          return !(typeof r[self.rowKey || 'id'] === 'number' && r[self.rowKey || 'id'] < 0)
        })
  
        newRows.forEach(function (r) { self.deleteRow(r) })
  
        if (!existRows.length) return
        if (hasApi) {
          confirm({
            title: 'Xoá dữ liệu',
            message: 'Xoá ' + existRows.length + ' dòng đã chọn?',
            action: function () {
              existRows.forEach(function (r) { self.deleteRow(r) })
              self.selectedRows = []
            }
          })
        } else {
          existRows.forEach(function (r) { self.deleteRow(r) })
          self.selectedRows = []
        }
      },
      saveAll: function () {
        var self = this
        var keyField = self.rowKey || 'id'
        var rows = self.getChangedRows()
        self.$emit('save', rows)
        if (!self.updateApi || rows.length === 0) return
        self.saving = true
        var pending = rows.length
        var hasError = false
  
        rows.forEach(function (row) {
          var extra = {}
          mapData(self.saveExtra || {}, extra, vueData)
          var payload = Object.assign({}, extra, row)
          if (typeof payload[keyField] === 'number' && payload[keyField] < 0) payload[keyField] = 0
          ajaxCALL(self.updateApi, payload, function (res) {
            pending--
            var r = res && res.data && res.data[0] ? res.data[0] : null
            if (r && r.Message) {
              if (r.Success) Vue.$toast.success(r.Message, { position: 'top' })
              else { Vue.$toast.error(r.Message, { position: 'top' }); hasError = true }
            }
            if (pending === 0) {
              self.saving = false
              if (!hasError) {
                var current = []
                self.gridApi.forEachNode(function (node) {
                  current.push(Object.assign({}, node.data))
                })
                self.buildOriginalData(current)
                self.gridApi.setGridOption('rowData', current)
                self.changedRows = {}
                self.localCounter = 0
                self.$emit('saved')
              }
            }
          }, function () {
            pending--
            hasError = true
            Vue.$toast.error('Lỗi khi lưu dữ liệu', { position: 'top' })
            if (pending === 0) self.saving = false
          })
        })
      },
      discardAll: function () {
        this.changedRows = {}
        this.localCounter = 0
        this.selectedRows = []
        if (this.gridApi) {
          var restored = (this.originalRows || []).map(function (r) { return Object.assign({}, r) })
          this.gridApi.setGridOption('rowData', restored)
          this.gridApi.refreshCells({ force: true })
          this.clearRange()
        }
      },
      exportExcel: function () {
        var self = this
        var cols = self.gridApi.getAllDisplayedColumns().filter(function (col) {
          var f = col.getColDef().field
          return f && f !== '_del'
        })
        var rows = []
        self.gridApi.forEachNode(function (node) {
          var row = {}
          cols.forEach(function (col) {
            var def = col.getColDef()
            row[def.headerName || def.field] = node.data[def.field]
          })
          rows.push(row)
        })
        jsonToExcel({
          data: rows,
          filename: self.label || 'export',
          worksheet: self.label || 'Sheet1'
        })
      }
    }
  });