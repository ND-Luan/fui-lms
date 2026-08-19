# Project Config — project.json & module set

> File này sở hữu: **`project.json`: menu, menuLeft, điều hướng, domainSetting, `right`, quan hệ với `set` của module**.

> Cơ chế trộn nền tảng: [platform-architecture.md](platform-architecture.md) §2.1. File này là **danh mục thuộc tính** đầy đủ của project.json và `set`.

## Quan hệ project.json ↔ module.json `set`

`project.json` là config mặc định cho toàn bộ project. Mỗi module có object `set` riêng — khi runtime render một module, `fastproject.js` merge **3 tầng** (tầng sau ghi đè tầng trước) rồi áp override theo domain:

```
$projectGroupSetting        (cấu hình nhóm project — thấp nhất)
  ⤵ override bởi
project.json (khối "data")
  ⤵ override bởi
module.json "set"           ← ưu tiên cao nhất
  ⤵ cuối cùng override bởi
domainSetting[domain hiện tại]   (nếu đang chạy trên domain đó)
```

Kết quả lưu ở `vueData.v_Set` — mọi nơi trong trang đọc qua `vueData.v_Set.*`.

**Kết quả:** Module kế thừa toàn bộ config project (menu, style, apiDomain...) nhưng có thể override bất kỳ field nào cho riêng trang đó. Trang bình thường **không cần `set`**.

### Danh mục thuộc tính `v_Set` (project.json.data hoặc module.set)

Runtime khởi tạo và sử dụng các field sau (nguồn: `fastproject.js`):

| Field | Kiểu | Tác động |
|---|---|---|
| `title` | string | Tiêu đề trang (thanh header) |
| `apiDomain` | string | Base URL tAPI — API path không `http` được prepend giá trị này |
| `login` | string | URL trang đăng nhập; runtime tự mở khi thiếu token / 401 |
| `userInfo` | string | Endpoint lấy thông tin user → `vueData.user`; rỗng = không fetch |
| `menu` | `false` \| array | Menu header ngang; `false` = ẩn (cao 48px khi hiện) |
| `menuLeft` | array | Menu sidebar trái |
| `menuComponent` | array | Custom component nhúng vào vùng menu |
| `menuStyle` | object | Màu top/left menu |
| `logo` | string | URL logo trên header |
| `userProfile` | object/string | Cấu hình khối profile user trên header |
| `themeStyle` | object | Truyền vào `new Vuetify(...)` — theme màu Vuetify của trang |
| `disableValidate` | boolean | `true` = bỏ qua validate form khi submit |
| `authDomain` | string | Domain để xóa cookie khi `logout()` |
| `fileDomain` | string | Base URL file server |
| `domainSetting` | object | Override config theo domain (đa domain) |
| `webSocket` | object | Cấu hình SignalR group real-time (xem [websocket-realtime.md](websocket-realtime.md)) |

**Ví dụ:** Project có `menuLeft` dài, nhưng một trang landing page muốn ẩn menu:

```json
// module.json — set của trang đó
"set": {
  "menu": false
}
```

→ Trang này không hiển thị header menu, các trang khác vẫn bình thường.

---

## Cấu trúc project.json

`project.json` chứa một object `data` duy nhất (không phải array như module.json):

```json
{
  "data": {
    "ProjectName": "...",
    "title":       "...",
    "apiDomain":   "...",
    "login":       "...",
    "userInfo":    "...",
    "apiFile":     "...",
    "menuStyle":   { ... },
    "menu":        false | [ ... ],
    "menuLeft":    [ ... ],
    "menuComponent": [ ... ],
    "domainSetting": { ... }
  }
}
```

### Các field trong `data`

| Field | Kiểu | Mô tả |
|---|---|---|
| `ProjectName` | string | Tên project hiển thị |
| `title` | string | Tiêu đề mặc định cho các trang |
| `logo` | string | URL ảnh logo trên thanh menu, ví dụ `"/images/fastUI_White.png"` |
| `apiDomain` | string | Base URL tAPI kèm apiName, ví dụ `https://tapi.example2.vn/` hoặc `https://tapi.example.vn/acc/` |
| `login` | string | URL trang đăng nhập |
| `userInfo` | string | Endpoint lấy thông tin user đã đăng nhập. FUI public: `"https://api.fui.vn/fp/userinfo"` |
| `apiFile` | string | Endpoint upload file (tùy chọn) |
| `fileDomain` | string | Base URL file server (tùy chọn) |
| `menuStyle` | object | Style cho menu top/left |
| `menu` | `false` hoặc array | Menu header ngang — `false` = ẩn hoàn toàn |
| `menuLeft` | array | Menu sidebar trái |
| `menuComponent` | array | Component tùy chỉnh nhúng vào vùng menu |
| `domainSetting` | object | Override config theo từng domain (đa domain) |

---

## menuStyle

Tùy chỉnh màu sắc cho top menu và left menu:

```json
"menuStyle": {
  "topmenu": {
    "bgcolor":   "#217D46",
    "textcolor": "white"
  },
  "leftmenu": {
    "bgcolor":   "#217D46",
    "textcolor": "white"
  }
}
```

---

## menu (top header)

- `false` → ẩn hoàn toàn thanh header chứa menu
- Array → danh sách menu item hiển thị ở thanh top

**Chiều cao cố định: 48px.** Khi `menu` đang hiển thị (không phải `false`), thanh menu chiếm 48px trên đầu trang. Bất kỳ tính toán chiều cao "full màn hình" nào cho vùng nội dung (`calc(100vh - Npx)`, `$(window).height() - N`, CSS `height: 100vh` trên container...) đều phải cộng thêm 48px vào phần trừ đi để tránh tràn/scroll ngoài ý muốn:

```css
/* Có menu hiển thị */
height: calc(100vh - 48px);

/* menu: false → không trừ phần này */
height: 100vh;
```

Áp dụng cho cả `module.json` (`:height` của `f-table`, `f-echart`...) lẫn CSS trong `header.html`/component cho trang `HTMLOnly=true`.

---

## menuLeft (sidebar)

Array các menu item hiển thị ở sidebar trái. Cấu trúc một item:

```json
{
  "name": "Tên mục",
  "icon": "mdi-folder-multiple",
  "url":  "/duong-dan-module",
  "submenu": [ ... ],
  "right": {
    "SystemRight":   [1, 2, 3, 5, 9],
    "FunctionRight": ["10", "20"]
  }
}
```

### Cấu trúc menu item

| Field | Bắt buộc | Mô tả |
|---|---|---|
| `name` | ✅ | Tên hiển thị |
| `url` | ❌ | Đường dẫn module (bỏ qua nếu chỉ là nhóm có submenu) |
| `icon` | ❌ | Icon Material Design (`mdi-*`) |
| `submenu` | ❌ | Mảng menu con (cùng cấu trúc) |
| `right` | ❌ | Điều kiện hiển thị theo quyền — thiếu = hiển thị cho tất cả |

### Kiểm tra quyền hiển thị menu (`right`)

> Phân biệt `SystemRight` (cấp bậc) vs `FunctionRight` (quyền theo chức năng) và cách quản lý định nghĩa quyền: xem [permission-system.md](permission-system.md).

```json
"right": {
  "SystemRight":   [1, 2, 5, 9],
  "FunctionRight": ["10", "20"]
}
```

- **`SystemRight`**: `user.SystemRight` (số) phải nằm trong mảng này mới thấy menu item
- **`FunctionRight`**: `user.FunctionRight` (mảng chuỗi) phải giao với mảng này (có ít nhất một mã) mới thấy
- **`UserID`**: chỉ các `UserID` liệt kê mới thấy — dùng cho menu nội bộ/DEV
- Khi khai báo nhiều key: user phải thỏa **tất cả** (hàm `rightTest` kiểm tra giao từng key với `vueData.user[key]`)
- Không khai báo `right` → item hiển thị cho tất cả user đã đăng nhập

**Ví dụ thực tế — menu DEV chỉ cho vài UserID:**
```json
{
  "name": "DEV",
  "right": { "UserID": ["NV0000177", "NV0001078", "NV0000605"] },
  "submenu": [
    { "name": "Tra cứu lịch sử OTP", "url": "/hoso-sms-history" }
  ]
}
```
> Menu top thường chỉ có `name` + `right` + `submenu` (không `url` ở cấp cha); `url` nằm ở từng mục `submenu`.

**Ví dụ thực tế — menu chỉ cho Tổ trưởng/BGH cấp 1:**
```json
{
  "name": "Cấp 1 - Tổ trưởng",
  "icon": "mdi-account-tie",
  "right": {
    "FunctionRight": ["10"],
    "SystemRight":   [5, 9]
  },
  "submenu": [ ... ]
}
```
→ Chỉ user có `FunctionRight` chứa `"10"` (cấp 1) VÀ `SystemRight` là 5 hoặc 9 mới thấy mục này.

---

## menuComponent

Mảng các custom Vue component được nhúng vào vùng menu (ví dụ: dropdown chọn niên khóa, chọn vai trò):

```json
"menuComponent": [
  { "el": "uc-nien-khoa" },
  { "el": "uc-vaitro" }
]
```

Component phải được đăng ký trong `components/_components.json` của project.

---

## userProfile (khối tài khoản trên header)

Cấu hình khối avatar/tài khoản góc phải header (đăng xuất, đổi mật khẩu, danh sách app):

```json
"userProfile": {
  "color": "white",
  "url-signout":          "https://app.example.vn/Signout",
  "url-change-password":  "https://app.example.vn/ChangePassword",
  "url-account":          "https://app.example.vn",
  "url-avatar":           "https://file.example.vn/me/avatarOrigin/",
  "url-app-list":         "https://tapi.example.vn/me/auth/ApplicationList"
}
```

| Field | Ý nghĩa |
|---|---|
| `color` | Màu chữ/icon khối profile |
| `url-signout` | URL đăng xuất |
| `url-change-password` | URL đổi mật khẩu |
| `url-account` | URL trang tài khoản |
| `url-avatar` | Base URL ảnh đại diện (ghép `UserID`) |
| `url-app-list` | Endpoint danh sách ứng dụng (menu chuyển app) |

> `menuLeft: false` = không dùng sidebar trái (chỉ menu top). `menuLeft: [ ... ]` = bật sidebar.

---

## domainSetting (đa domain)

Khi một project chạy trên nhiều domain khác nhau (mỗi domain có tAPI server và DB riêng), dùng `domainSetting` để override config theo domain:

```json
"domainSetting": {
  "sec.example.vn": {
    "apiDomain":  "https://tapi.example.vn/acc/",
    "fileDomain": "https://file.example.vn/acc/",
    "login":      "https://app.example.vn",
    "userInfo":   "https://tapi.example.vn/acc/UserInfo/acc"
  },
  "sec.example3.vn": {
    "apiDomain":  "https://api.example3.vn/acc/",
    "fileDomain": "https://file.example3.vn/acc/",
    "login":      "https://login.example3.vn",
    "userInfo":   "https://api.example3.vn/acc/UserInfo/acc"
  }
}
```

Key là hostname của domain. Runtime tự phát hiện domain hiện tại và áp dụng override tương ứng.

---

## module.json `set` — Override cho từng trang

`set` trong module.json có thể override bất kỳ field nào từ project.json. Các field thường dùng:

```json
"set": {
  "title":    "Trang quản lý sinh viên",
  "menu":     false,
  "menuLeft": [ ... ]
}
```

| Dùng `set` khi | Ví dụ |
|---|---|
| Trang có tiêu đề riêng | `"title": "Nhập điểm Tiểu học"` |
| Trang ẩn menu header | `"menu": false` |
| Trang cần menu sidebar khác | Override `"menuLeft"` với danh sách rút gọn |
| Trang landing / public | `"menu": false, "menuLeft": []` |

**Không cần ghi lại các field không thay đổi** — module chỉ cần khai báo những gì khác với project default.

---

## Tóm tắt quan hệ file

```
project.json.data          ← config mặc định cho toàn project
    ↓ bị override bởi
module.json.set             ← config riêng cho từng trang

Effective config = merge(project.json.data, module.json.set)
                   (module.set được ưu tiên)
```

---

## openWindow — Quy tắc truyền tham số URL

Khi mở sub-window bằng `openWindow`, URL chỉ truyền **ID của record cha** mà module con thực sự dùng để query DB. Không truyền name, label hay field nào có thể tra lại từ DB trong module con.

```json
// ✅ Đúng — chỉ truyền ID cần thiết
"url": "`/ContestDetail?ContestID={{sContestID}}"

// ❌ Sai — truyền thừa field có thể tra từ DB
"url": "`/ContestDetail?ContestID={{sContestID}}&ContestName={{sContestName}}"
```

**Lý do:** Module con load dữ liệu đầy đủ từ DB theo ID — truyền thêm field thừa làm URL dài, dữ liệu có thể lỗi thời, và tạo dependency không cần thiết giữa 2 module.
