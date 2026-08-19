# FUI Script Map (Quick Lookup)

> File này sở hữu: **thư viện bundled sẵn (§0) và bản đồ source script FUI — hàm nào nằm ở file/dòng nào**. Cách dùng từng hàm xem [default-function.md](default-function.md).

Mục tiêu: tra cứu nhanh "hàm nào dùng để làm gì" theo từng file runtime trong `scripts/`.

> **Bản đồ file theo framework** — tra `_moduleInfo.json.Framework` (`"V2"` hoặc `"V3"`) rồi mở đúng cột:
>
> | Nội dung | File V2 | File V3 |
> |---|---|---|
> | Core engine (action, API, layout) | `scripts/fastproject.js` | `scripts/fastproject-3.0.js` |
> | Utility layer (router, export, auth, WS) | `scripts/defaultfunction.js` | `scripts/defaultfunction-3.0.js` |
> | Component registry (`f-*`, dialog, editor...) | `scripts/component.js` | `scripts/component-3.0.js` |
> | Table system (`f-table`, `t-*`) | `scripts/componentTable.js` | `scripts/componentTable-3.0.js` |
> | Biểu đồ (`f-echart`) | `scripts/fechart.js` | `scripts/fechart.js` |
> | Bảng tính nhập liệu (`f-sheet`) | `scripts/fsheet.js` (dùng chung, xem §5) | `scripts/fsheet.js` (dùng chung, xem §5) |

Lưu ý dùng đúng chuẩn FUI:
- Metadata chính là `module.json` (không dùng `controls.json`).
- Logic action gọi qua `CALL(vueData.actionName)` hoặc Action Protocol.
- Layout trong `controls` luôn theo grid wrapper `container > rows > cols`.
- Event trong JSON dùng `v-on:...` (không dùng `@...`).
- Literal forcing (`` ` `` or `'...'`) is for Action `IN` mapping, not normal static component props.

## Table of Contents
- [0) Thư viện nhúng sẵn (FUI V2)](#0-thu-vien-nhung-san-fui-v2)
- [1) scripts/fastproject.js](#1-scriptsfastprojectjs)
- [2) scripts/defaultfunction.js](#2-scriptsdefaultfunctionjs)
- [3) scripts/component.js](#3-scriptscomponentjs)
- [4) scripts/componentTable.js](#4-scriptscomponenttablejs)
- [4b) scripts/componentTable-3.0.js](#4b-scriptscomponenttable-30js)
- [5) scripts/fsheet.js](#5-scriptsfsheetjs)
- [6) Tra cứu theo tác vụ](#6-tra-cuu-theo-tac-vu)

## 0) Thư viện nhúng sẵn (FUI V2)

FUI tự động nhúng các thư viện sau vào **mọi** module — **không cần import thêm**. Luôn tận dụng
chúng thay vì thêm thư viện tương đương. **Không thêm CDN** cho bất kỳ thư viện nào trong danh sách
— thêm lại gây xung đột.

### CSS (tự động load)

Roboto font · Material Design Icons (`mdi-*`) · Vuetify CSS · vue-toast-notification CSS · jquery-confirm CSS · FUI projectdefaultstyle.css

### JavaScript globals

| Global | Thư viện | Công dụng |
|---|---|---|
| `$`, `jQuery` | jQuery 3.6.0 | DOM, AJAX |
| `$.confirm()` / `$.dialog()` | jquery-confirm | Dialog xác nhận / thông báo có style (thay cho `window.confirm`) |
| `_` | Lodash 4.17 | Utility: sort, filter, group, clone array/object |
| `moment` | Moment.js (vi) | Parse và format ngày giờ, locale tiếng Việt sẵn |
| `numeral` | Numeral.js | Format số và tiền tệ |
| `Vue.$toast` | vue-toast-notification | Toast thông báo góc màn hình |

### FUI built-in JS (luôn load sau các thư viện trên)

`defaultfunction.js` — hàm tiện ích FUI (`jsonToExcel`, `pushRouter`, `openWindow`, `CALL`, `confirm`, `showMessage`, ...)
`component.js` — đăng ký toàn bộ FUI components (`f-table`, `f-form`, `f-echart`, ...)
`componentTable.js` — FUI table helpers · `fastproject.js` — FUI project bootstrapper

### Ví dụ dùng phổ biến trong FUI

```js
// Toast thông báo
Vue.$toast.success('Lưu thành công', { position: 'top' });
Vue.$toast.error('Có lỗi xảy ra', { position: 'top' });

// Dialog xác nhận (FUI wrapper — dùng hàm confirm() từ defaultfunction.js)
confirm({
    title: 'Xác nhận xóa',
    message: 'Bạn có chắc muốn xóa không?',
    action: function() { /* xử lý khi OK */ }
});

// Dialog thông báo (FUI wrapper)
showMessage({ title: 'Thông báo', message: 'Đã lưu thành công' });

// Lodash — dùng trong script.js / vueData
_.find(vueData.list, { id: 5 })
_.groupBy(vueData.data, 'loai')
_.sumBy(items, 'soLuong')
_.cloneDeep(vueData.formData)
_.debounce(fn, 300)

// Moment — format ngày
moment(val).format('DD/MM/YYYY')
moment(val).format('DD/MM/YYYY HH:mm')
moment().subtract(7, 'days').format('YYYY-MM-DD')

// Numeral — format số
numeral(value).format('0,0')        // 1,234,567
numeral(value).format('0,0.0')      // 1,234,567.8
numeral(_.sumBy(items, key)).format('0,0')  // tổng cột trong bảng
```

> Component `f-*` nào cần import thêm JS/CSS ngoài danh sách trên: xem
> [component-quickref.md](component-quickref.md) §Components cần import JS/CSS.

## 1) scripts/fastproject.js — V3: fastproject-3.0.js

Vai trò: core engine để khởi tạo module, dựng DOM từ `module.json.controls`, chạy action, map data và gọi API.

Luồng khởi tạo chính:
1. `$(document).ready` -> `loadModuleInfo()`
2. `loadModuleInfo()` -> merge config + đọc URL/user info
3. `createModuleDom()` -> `runAction($moduleUI.data)` + render controls
4. `createWatch()` -> gắn watcher từ `$moduleUI.watch`
5. Vue instance mount và module chạy

| Line | Hàm | Dùng để làm gì |
|---:|---|---|
| 65 | `buildParamURL()` | Đọc query string và đẩy params vào `vueData`. |
| 77 | `loadModuleInfo()` | Nạp config project/module, user info, chuẩn bị tạo app. |
| 122 | `createModuleDom()` | Tạo layout Vue chính, render controls, init watch. |
| 210 | `buildModuleUI(controlsList, target)` | Recursively build UI từ JSON controls. |
| 233 | `buildControl(controlsList, flex, target)` | Render từng control, bind attr/event/import. |
| 299 | `addImport(importArr)` | Nạp script/css phụ thuộc theo control. |
| 310 | `createWatch_Data(obj)` | Khởi tạo dữ liệu cho watch config. |
| 320 | `createWatch(obj)` | Gắn watcher Vue theo config `watch`. |
| 345 | `buildVisualValForObj(controlAttr, target)` | Bind giá trị động vào attr control. |
| 373 | `runAction(obj, includeData)` | Action engine tổng: chạy object/array action. |
| 407 | `vueAction(objAction, includeData, callBack)` | Chạy 1 action cụ thể (IF/API/CALL/EXE/...). |
| 485 | `mapData(map, target, src, includeData)` | Map dữ liệu giữa object theo rule FUI. |
| 527 | `defProp(obj)` | Chuẩn hoá property object theo context. |
| 537 | `bindData(obj)` | Resolve biến động (string/object) từ context hiện tại. |
| 542 | `getVueData(key, src)` | Lấy value theo path (`vueData.x.y`, `item.x`, template...). Literal forcing is for `IN` mapping; static component props without `:` are already plain strings. |
| 578 | `setValue(target, key, value, srcData, index)` | Gán dữ liệu theo path vào target object/window. |
| 612 | `bindDataToString(str, data)` | Resolve template string với dữ liệu runtime. |
| 619 | `templateCompiled(str, data)` | Compile template lodash-style cho chuỗi động. |
| 624 | `getWindowData(value)` | Lấy dữ liệu từ window/iframe context. |
| 638 | `setWindowData(key, value)` | Set dữ liệu cho window/iframe context. |
| 657 | `runFunction(obj, callback)` | Gọi function JS đã khai báo theo action config. |
| 665 | `tableActionEvent(ctrl)` | Xử lý action event liên quan table/control. |
| 687 | `callAPI(objApi, callBack, includeData)` | Gọi API theo cấu hình action (`IN/OUT/CALLBACK`). |
| 743 | `loginFUN()` | Luồng đăng nhập/chuyển hướng login. |
| 761 | `errorMess(code, message)` | Hiển thị lỗi chuẩn theo status/message. |

## 2) scripts/defaultfunction.js — V3: defaultfunction-3.0.js

Vai trò: utility layer dùng chung cho runtime (router, messaging, data transform, AJAX, export, auth, websocket...).

| Line | Hàm | Dùng để làm gì |
|---:|---|---|
| 35 | `extractHostname(url)` | Lấy hostname từ URL. |
| 53 | `getDomainWithoutSubdomain(url)` | Lấy domain gốc không subdomain. |
| 62 | `loadScripts(scriptsArray, callbackFunc)` | Nạp nhiều script động rồi callback. |
| 75 | `pushRouter(router)` | Push route vào browser history. |
| 82 | `CALL(obj, includeData)` | Alias gọi `runAction(...)`. |
| 86 | `windowSendMessage(window, cmd, data)` | `postMessage` sang parent/window/iframe. |
| 100 | `appCommand(cmdData)` | Gửi lệnh về native wrapper (RN/WebKit). |
| 106 | `buildHeader(obj, mapCol)` | Tạo header table từ dataset/map cột. |
| 130 | `fillData(obj)` | Fill/map dữ liệu từ source sang destination. |
| 162 | `groupBy(arrayObj, groupField, sumArr)` | Group mảng theo field + cộng tổng cột. |
| 188 | `chartDataBuild(obj)` | Chuẩn hoá data cho chart tổng quát. |
| 219 | `chartQABuild(obj)` | Build data chart chuyên QA/report. |
| 239 | `confirm(obj)` | Hiển thị dialog confirm. |
| 259 | `showMessage(obj)` | Hiển thị dialog/toast message. |
| 283 | `rightTest(rightObject)` | Kiểm tra quyền theo user rights. |
| 301 | `openWindow(obj)` | Mở popup/dialog window FUI. |
| 326 | `redirect(obj, query)` | Điều hướng trang theo URL/config. |
| 339 | `reload()` | Reload trang hiện tại. |
| 343 | `findInArray(obj)` | Tìm phần tử theo điều kiện giá trị. |
| 348 | `fixURL(url)` | Chuẩn hoá URL (ghép domain API nếu cần). |
| 354 | `stringAttrToJson(str, removeVueEvent)` | Parse chuỗi attr HTML thành JSON object. |
| 371 | `json_data_parse(obj, level)` | Parse đệ quy field có prefix `json_data:`. |
| 407 | `ajaxCALL(URL, DATA, callBack, errorCallBack, header)` | Gọi AJAX POST helper. |
| 449 | `capacityText(numb)` | Format dung lượng bytes -> KB/MB text. |
| 454 | `generateID()` | Sinh ID ngẫu nhiên. |
| 467 | `printPDF(obj)` | Render/in/download PDF bằng `pdfMake`. |
| 499 | `colorLib(color)` | Bộ công cụ convert/manipulate màu. |
| 645 | `transparentize(value, opacity)` | Tạo màu trong suốt (alpha). |
| 745 | `jsonToExcel(Obj)` | Xuất dữ liệu JSON ra Excel. |
| 841 | `copyToClipboard(textToCopy)` | Copy text vào clipboard. |
| 865 | `fileNameClear(fname)` | Làm sạch tên file không hợp lệ. |
| 870 | `hashCode(s)` | Sinh hash code từ string. |
| 880 | `getCookie(cname)` | Đọc cookie theo tên. |
| 895 | `setCookie(name, value, days, domain)` | Set cookie có expiry/domain. |
| 909 | `logout(cookiesName, domain, url)` | Xoá cookie và logout/redirect. |
| 922 | `webSocketJoinGroup(groupObj, timeout, callBackFunc)` | Join WS group theo payload. |
| 946 | `webSocketConnection(wsURL, WS, wsState)` | Khởi tạo/duy trì WS connection. |
| 987 | `webSocket_Send(obj)` | Gửi payload qua websocket hiện tại. |

> **Real-time messaging (SignalR)**: hướng dẫn dùng đầy đủ 3 hàm trên — import bắt buộc, khai báo group trong `data[]`, nhận/gửi tin nhắn, ví dụ `module.json` hoàn chỉnh — xem [websocket-realtime.md](websocket-realtime.md).

## 3) scripts/component.js — V3: component-3.0.js

Vai trò: đăng ký FUI base components và các component nghiệp vụ (dialog, editor, PDF, excel, chart, media...).

Ghi chú:
- File này cũng chứa `defaultControlAttr` để set attr mặc định theo từng `el`.
- Nhiều component yêu cầu import ngoài (CKEditor, pdfMake, cropper, chart, ...).

| Line | Component | Dùng để làm gì |
|---:|---|---|
| 317 | `f-label` | Hiển thị label/text theo format FUI. |
| 332 | `f-box` | Khối hiển thị dữ liệu dạng box/card đơn giản. |
| 390 | `f-header` | Header block nhẹ cho section/module. |
| 399 | `f-title` | Title component chuẩn UI. |
| 408 | `f-radiobox` | Radio group wrapper. |
| 438 | `f-menu` | Menu list/navigation control. |
| 485 | `f-search` | Input tìm kiếm dùng lại. |
| 549 | `f-button` | Button wrapper chuẩn attr FUI. |
| 620 | `f-slider` | Slider input/display. |
| 631 | `f-file-upload` | Upload file cơ bản. |
| 781 | `f-qrcode` | Render QR code. |
| 856 | `f-qrcode-reader` | Quét/đọc QR code. |
| 927 | `f-image-update` | Dialog crop/rotate/upload ảnh. |
| 1174 | `f-date` | Date picker wrapper. |
| 1447 | `f-time` | Time picker wrapper. |
| 1652 | `f-time-counter` | Counter/countdown/clock hiển thị thời gian. |
| 1788 | `fp-profile` | User profile menu trên header. |
| 2033 | `header-bar` | Thanh header/menu chính của app/module. |
| 2429 | `f-window` | Dynamic window/dialog host. |
| 2493 | `f-editor` | WYSIWYG editor wrapper (CKEditor). |
| 2631 | `f-editor-dialog` | Dialog chứa editor toàn màn hình. |
| 2727 | `f-dialog` | Dialog dynamic dựng form từ `controls`. |
| 2939 | `f-pdfmake` | Viewer/render PDF bằng `printPDF`. |
| 2974 | `f-excel-reader` | Upload/đọc Excel, emit action xử lý data. |

## 4) scripts/componentTable.js — V3: componentTable-3.0.js (xem §4b)

Vai trò: table system cho FUI, gồm component table chính và cell renderer `t-*`.

| Line | Component | Dùng để làm gì |
|---:|---|---|
| 1 | `f-table` | Data table duy nhất (CRUD lẫn readonly): search, select, CRUD (`update-api`, `update-form`), export, auto-build headers khi không truyền `headers`, sum row/sum line qua `sumFormat` (object/string), `:height` (xem bên dưới). |
| 416 | `t-html` | Render ô dạng HTML. |
| 420 | `t-label` | Render text label thường. |
| 424 | `t-num` | Render/format số. |
| 442 | `t-time` | Render/format thời gian. |
| 452 | `t-boolean` | Render bool bằng icon/màu. |
| 473 | `t-check` | Cell checkbox có thể tương tác. |
| 501 | `t-text` | Cell text input inline. |
| 523 | `t-select` | Cell select inline. |
| 544 | `t-combobox` | Cell combobox/autocomplete inline. |
| 616 | `t-menu` | Cell menu action. |
| 654 | `t-link` | Cell link điều hướng/open dialog. |
| 678 | `t-button` | Cell button action custom. |

**`:height` (`f-table`)** — computed `heightNum`/`tableHeight` + method `updateFillHeight()`: bỏ trống = tự giãn theo số dòng; `<=0` = đo `getBoundingClientRect()` thật rồi fill tới đáy màn hình chừa `abs(n)` px (có `window.resize` listener); `>0` = px cố định.

## 4b) scripts/componentTable-3.0.js

Bản **V3** (Vue 3 + Vuetify 3) của cùng bộ component trên — tên đăng ký PascalCase (`FTable`, `THtml`, `TNum`, ...). Framework version của module quyết định file nào được nạp (`_moduleInfo.json`).

Khác biệt phải nhớ khi sửa **cả hai** file:
- Lifecycle: V3 dùng `beforeUnmount` (các component khai cả hai để chạy được ở cả V2 lẫn V3).
- Class Vuetify: V3 là `text-primary` / `text-subtitle-1` / `text-caption`, V2 là `primary--text` / `subtitle-1` / `caption`; `v-btn outlined` (V2) → `variant="outlined"` (V3).
- Wrapper cuộn của `v-data-table`: V2 `.v-data-table__wrapper`, V3 `.v-table__wrapper`.
- Tên biến/computed **không được bắt đầu bằng `_`** nếu bind thẳng trong template V3 (proxy `has` trap chặn) — V3 dùng hậu tố kiểu `hideDefaultFooter_cacl`.
- `headers` của `f-table`: V2 dùng `{ text, value }`, V3 dùng `{ title, key }` (chuẩn Vuetify 3); slot `body.append` V2 nhận `{ headers }`, V3 nhận `{ columns }`.

Kiểm chứng bản V3 sau khi sửa: `node test/v3-table-harness.mjs [sum|fill|auto]` — nạp framework V3 thật từ `https://fui.vn` trong chromium headless nhưng **thay `componentTable-3.0.js` bằng file local**, mọi API bị chặn + trả mock. In ra lỗi JS/`[Vue warn]`, chiều cao thật, nội dung dòng tổng, ô AG Grid, và chụp `test/v3-{mode}.png`.

## 5) scripts/fsheet.js — dùng chung V2 + V3

Vai trò: toàn bộ component `f-sheet`, một file **duy nhất** dùng chung cho cả V2 và V3 (khai cả `beforeDestroy` lẫn `beforeUnmount` để chạy được ở cả hai runtime) — không tách theo framework version như các file khác trong bảng ở đầu tài liệu.

Import bắt buộc (2 file, trích từ `component.js` `defaultControlAttr["f-sheet"].import`), **đúng thứ tự**:
```
/include/ag-grid/ag-grid-community.min.js
/include/ag-grid/fsheet.js
```

| Nội dung | Ghi chú |
|---|---|
| `Vue.component('FSheet', {...})` | Component chính — props/cột/wiring API chi tiết ở [fsheet.md](fsheet.md) |
| 4 cell renderer dựng sẵn (`fsHtmlCellRenderer`/`fsLinkCellRenderer`/`fsButtonCellRenderer`/`fsMenuCellRenderer`) | Tương đương `t-html`/`t-link`/`t-button`/`t-menu` của `f-table` — xem [fsheet.md](fsheet.md) |
| Hệ thống chọn vùng nhiều ô + fill handle + clipboard TSV tự viết | AG Grid Community không có Cell Selection (thuộc bản Enterprise) nên f-sheet tự điều khiển rồi gắn đúng bộ class CSS của AG Grid (`.ag-cell-range-*`, `.ag-selection-fill-*`, `.ag-fill-handle`) |

`:height` dùng cùng 3 chế độ (tự giãn / fill đáy / px cố định) — chi tiết: [fsheet.md](fsheet.md) §Chiều cao.

Kiểm chứng `fsheet.js`: `component_preview` (render `f-sheet` cô lập với dữ liệu mẫu, không cần push lên server) hoặc `module_simulate({renderUI:true})` (kiểm trong module thật) — cả hai chạy browser thật, không cần harness riêng.

## 6) Tra cứu theo tác vụ

> Cột "Mở file trước" ghi tên file V2. Nếu module là **V3**, thay bằng file `-3.0` tương ứng (xem quy tắc ở đầu tài liệu).

| Tác vụ cần làm | Mở file trước (V2 / V3) | Xem mục chính |
|---|---|---|
| Module không render đúng layout | `fastproject.js` / `fastproject-3.0.js` | `buildModuleUI`, `buildControl`, `bindData`. |
| Action không chạy hoặc chạy sai nhánh | `fastproject.js` / `fastproject-3.0.js` | `runAction`, `vueAction`, `mapData`, `getVueData`. |
| API không ra dữ liệu `OUT` | `fastproject.js` + `defaultfunction.js` (cùng bản V2/V3) | `callAPI`, `fixURL`, `ajaxCALL`. |
| Table CRUD lỗi Add/Edit/Delete | `componentTable.js` / `componentTable-3.0.js` | `f-table` + `update-api`, `update-form`. |
| Dialog dynamic không bind dữ liệu | `component.js` / `component-3.0.js` | `f-dialog`, `buildModuleUI` (ở fastproject). |
| Upload ảnh, crop, lưu file | `component.js` / `component-3.0.js` | `f-image-update`. |
| Export Excel/PDF | `defaultfunction.js` + `component.js` (cùng bản V2/V3) | `jsonToExcel`, `printPDF`, `f-pdfmake`, `f-excel-reader`. |
| Sự cố đăng nhập/quyền/menu | `fastproject.js` + `defaultfunction.js` (cùng bản V2/V3) | `loadModuleInfo`, `loginFUN`, `rightTest`. |
| `f-sheet` không hiện / báo "FSheet is not defined" | `fsheet.js` (dùng chung V2+V3) | Thiếu import — xem [component-quickref.md](component-quickref.md) hoặc [fsheet.md](fsheet.md). |
