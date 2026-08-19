# Default Functions

> File này sở hữu: **hàm tiện ích FUI dùng được trong `FUN`/`EXE`/`script.js`** (openWindow, ajaxCALL, jsonToExcel, groupBy...). Vị trí trong source xem [script-map.md](script-map.md).

Các hàm và biến global được định nghĩa trong `defaultfunction.js` — tự động load trong mọi module FUI V2.

---

## Global Variables

| Variable | Mô tả |
|---|---|
| `$isMobile` | `true` nếu user agent là thiết bị mobile |
| `$isPhone` | `true` nếu là điện thoại (không tính tablet) |
| `$isApple` | `true` nếu là thiết bị Apple (iPad, iPhone, iPod) |

---

## Dialog & Thông báo

### confirm(obj)

Hiển thị hộp thoại xác nhận OK/Cancel có style. Wrapper của `$.confirm` (jquery-confirm).

| Param | Mô tả |
|---|---|
| `title` | Tiêu đề dialog |
| `message` | Nội dung |
| `action` | Function chạy khi nhấn OK |
| `cancel` | Function chạy khi nhấn Cancel (tùy chọn) |
| `type` | Màu: `'blue'` (mặc định), `'red'`, `'green'`, `'orange'` |
| `icon` | Icon class, ví dụ `'mdi mdi-delete'` |

```js
confirm({
    title: 'Xác nhận xóa',
    message: 'Bạn có chắc muốn xóa bản ghi này không?',
    type: 'red',
    icon: 'mdi mdi-delete',
    action: function() {
        CALL(vueData.actDelete);
    }
});
```

---

### showMessage(obj)

Hiển thị hộp thoại thông báo (chỉ có nút Close). Wrapper của `$.dialog`.

| Param | Mô tả |
|---|---|
| `title` | Tiêu đề |
| `message` | Nội dung |
| `type` | Màu: `'blue'`, `'red'`, `'green'` |
| `icon` | Icon class |
| `onclose` | FUI action object chạy sau khi đóng dialog |

```js
showMessage({ title: 'Thông báo', message: 'Lưu thành công!' });

showMessage({
    title: 'Lỗi',
    message: 'Không tìm thấy dữ liệu',
    type: 'red',
    icon: 'mdi mdi-alert-circle'
});

// Chạy action sau khi đóng
showMessage({
    title: 'Hoàn tất',
    message: 'Import xong!',
    onclose: vueData.actReload
});
```

---

## Navigation & Window

### pushRouter(router)

Cập nhật URL trên thanh địa chỉ trình duyệt (không reload trang). Dùng để đồng bộ URL với trạng thái UI hiện tại.

```js
pushRouter('/fp/don-hang/danh-sach');
```

---

### openWindow(obj)

Mở một cửa sổ FUI (`f-window`) overlay trên trang hiện tại.

| Param | Mô tả |
|---|---|
| `url` | URL nội dung cửa sổ (bắt buộc) |
| `title` | Tiêu đề cửa sổ |
| `id` | ID định danh (tự sinh nếu bỏ qua) — dùng để tránh mở trùng |
| `width` | Chiều rộng (px hoặc %) |
| `height` | Chiều cao |

```js
// Cách đơn giản — chỉ truyền URL
openWindow('/fp/san-pham/chi-tiet?id=123');

// Đầy đủ options
openWindow({
    id: 'winChiTiet',
    url: '/fp/san-pham/chi-tiet?id=' + vueData.selectedId,
    title: 'Chi tiết sản phẩm',
    width: '80%'
});
```

> Nếu gọi từ bên trong một `f-window` (iframe), FUI tự động chuyển sang `windowSendMessage('#PARENT', 'openWindow', obj)` để mở ở cửa sổ cha.

---

### redirect(obj, query)

Chuyển hướng trang hiện tại sang URL khác.

```js
redirect('/fp/trang-chu');
redirect({ url: '/fp/don-hang', query: true }); // giữ lại query params hiện tại
```

---

### reload()

Tải lại trang hiện tại.

```js
reload();
```

---

### windowSendMessage(window, cmd, data)

Gửi `postMessage` đến một cửa sổ/iframe khác. Dùng để giao tiếp giữa các `f-window`.

| Param | Mô tả |
|---|---|
| `window` | Object window, `'#PARENT'` (cửa sổ cha), hoặc `'#iframeId'` (ID của iframe) |
| `cmd` | Tên lệnh |
| `data` | Dữ liệu gửi kèm |

```js
// Gửi lên cửa sổ cha
windowSendMessage('#PARENT', 'refreshData', { id: vueData.selectedId });

// Gửi đến iframe có id="iframeChild"
windowSendMessage('#iframeChild', 'loadItem', { itemId: 5 });
```

---

## AJAX

### ajaxCALL(URL, DATA, callBack, errorCallBack, header)

Gọi API bằng AJAX POST. URL chỉ cần truyền path — hệ thống tự ghép domain qua `fixURL`.

```js
ajaxCALL('/SP_GetDonHang', { maKH: vueData.maKH }, function(res) {
    vueData.danhSach = res.data;
});

// Với error handler
ajaxCALL('/SP_SaveDonHang', vueData.form,
    function(res) { Vue.$toast.success('Lưu thành công', { position: 'top' }); },
    function(err) { showMessage({ title: 'Lỗi', message: err.message, type: 'red' }); }
);
```

---

## Xuất file

### jsonToExcel(Obj)

Xuất dữ liệu JSON ra file `.xlsx`. Tự động load ExcelJS nếu chưa có.

**Single sheet:**
```js
jsonToExcel({
    data: vueData.danhSach,       // Array of objects
    filename: 'danh-sach.xlsx',
    worksheet: 'DanhSach'
});
```

**Multi sheet:**
```js
jsonToExcel({
    filename: 'bao-cao.xlsx',
    sheets: [
        { name: 'Sheet1', data: vueData.list1 },
        { name: 'Sheet2', data: vueData.list2 }
    ]
});
```

---

## Data Utilities

### groupBy(arrayObj, groupField, sumArr)

Group mảng object theo một field và tính tổng các cột số. Trả về mảng đã group kèm `count`.

```js
// groupBy(data, 'Khoa', ['SLNghiHoc', 'SLTotNghiep'])
var result = groupBy(vueData.data, 'phongBan', ['soLuong', 'doanhThu']);
// result: [{ phongBan: 'A', soLuong: 10, doanhThu: 5000, count: 3 }, ...]
```

> Với nhu cầu group phức tạp hơn, dùng `_.groupBy` của Lodash trực tiếp.

---

### findInArray(obj)

Tìm phần tử trong mảng theo điều kiện.

```js
var item = findInArray({ array: vueData.list, value: { id: 5 } });
```

> Thường dùng `_.find(array, condition)` của Lodash thay thế vì ngắn gọn hơn.

---

### fillData(obj)

Copy dữ liệu từ mảng nguồn vào object đích theo key và mapping.

- **Parameters:** `{ src, des, key, map }` — src: array nguồn, des: object đích, key: giá trị khớp, map: mapping field

---

### buildHeader(obj, mapCol)

Tự sinh mảng `headers` cho `f-table` từ dữ liệu. Không truyền `mapCol` → suy header từ key của bản ghi đầu tiên (cột số tự gán `el: 't-num'`); có `mapCol` → map từ `{ text, value }`.

```js
// Tự dựng header từ dữ liệu API
vueData.headers = buildHeader(vueData.dsData);
```

### capacityText(numb)

Đổi số byte → chuỗi dung lượng (`'1.5 Mb'`, `'320 Kb'`) — dùng hiển thị kích thước file.

### appCommand(cmdData)

Gửi lệnh sang app native (React Native / iOS webkit / Android) khi trang FUI nhúng trong app di động.

---

## PDF

### printPDF(obj)

Tạo và in/tải PDF dùng `pdfMake`. Tự động load pdfMake nếu chưa có.

```js
printPDF({
    data: docDefinition,   // pdfMake docDefinition object
    download: true,        // true = tải file, false = mở viewer
    callBack: function() { console.log('Done'); }
});
```

---

## Clipboard & String

### copyToClipboard(textToCopy)

Copy chuỗi vào clipboard. Tự động dùng `navigator.clipboard` nếu có (HTTPS), fallback về `execCommand`.

```js
copyToClipboard(vueData.maHoaDon);
copyToClipboard(JSON.stringify(vueData.data));
```

---

### fileNameClear(fname)

Xóa các ký tự đặc biệt khỏi tên file (chỉ giữ chữ, số, khoảng trắng, dấu gạch).

```js
var safeName = fileNameClear(vueData.tenFile); // "report (2025)!" → "report 2025"
```

---

### hashCode(s)

Tạo hash số nguyên từ chuỗi (dùng để generate key duy nhất).

```js
var key = hashCode('unique-string-' + Date.now());
```

---

### generateID()

Tạo ID ngẫu nhiên dạng chuỗi.

```js
var newId = 'win_' + generateID();
```

---

## Cookie & Auth

### getCookie(cname) / setCookie(name, value, days, domain)

Đọc/ghi cookie trình duyệt.

```js
var token = getCookie('awt');
setCookie('theme', 'dark', 30);              // hết hạn sau 30 ngày
setCookie('lang', 'vi', 365, '.fui.vn');    // share cookie toàn domain
```

---

### logout(cookiesName, domain, url)

Xóa cookie và chuyển hướng đến trang login.

```js
logout();                          // xóa cookie 'awt', redirect về login mặc định
logout('myToken', '.fui.vn', '/login');
```

---

## Quyền hạn

### rightTest(rightObject)

Kiểm tra user hiện tại có quyền hạn yêu cầu không. So sánh với `vueData.user`.

```js
// Kiểm tra user có role 'admin' hoặc 'manager'
if (rightTest({ role: ['admin', 'manager'] })) {
    vueData.showDelete = true;
}

// Kiểm tra nhiều điều kiện cùng lúc (AND)
if (rightTest({ dept: 'IT', level: [1, 2] })) { ... }
```

---

## Color Utilities

### colorLib(color)

Utility xử lý màu sắc (hex, rgb, hsl). Dùng chủ yếu trong chart.

```js
var c = colorLib('#4e73df');
c.hexString()           // '#4e73df'
c.rgbString()           // 'rgb(78, 115, 223)'
c.lighten(0.2)          // làm sáng 20%
c.darken(0.1)           // làm tối 10%
c.alpha(0.5).rgbString() // 'rgba(78, 115, 223, 0.5)'
```

### transparentize(value, opacity)

Shortcut tạo màu trong suốt từ mã màu.

```js
transparentize('#4e73df', 0.5)  // 'rgba(78, 115, 223, 0.5)'
```

---

## Script Loader

### loadScripts(scriptsArray, callbackFunc)

Load thêm script từ URL và chạy callback khi xong. Dùng để load thư viện on-demand.

```js
loadScripts(['/include/pdfmake/pdfmake.min.js', '/include/pdfmake/vfs_fonts.js'], function() {
    printPDF({ data: docDef, download: true });
});
```

---

## Device Detection

### extractHostname(url) / getDomainWithoutSubdomain(url)

Trích xuất hostname/domain từ URL. Dùng nội bộ, ít dùng trực tiếp.

```js
extractHostname('https://api.fui.vn/fp/test') // 'api.fui.vn'
getDomainWithoutSubdomain('https://api.fui.vn') // 'fui.vn'
```
