# DB Connection Workflow

> File này sở hữu: **kết nối DB, dbToken, schema cache, workflow làm việc với SP, rollback**. Mức rủi ro + guard từng tool xem [tools-registry.md](tools-registry.md); checklist SP xem [verification.md](verification.md).

Hướng dẫn toàn diện về kết nối database cho một FUI project — từ tìm thông tin kết nối, build token, đến quản lý schema và SP.

---

## 1. Thông tin kết nối lưu ở đâu

Mỗi project có thư mục `_db/` riêng trong workspace:

```
{FUI_MCP_WORKDIR}/{projectId}/
└── _db/
    ├── config.json     ← thông tin kết nối
    ├── schema.json     ← cache schema từ DB
    └── sp/{name}.sql   ← SP đã fetch về local
```

Bản cũ **không** nằm cạnh bản hiện tại: mọi thứ sắp bị ghi đè/xoá đi về một kho chung
`{FUI_MCP_WORKDIR}/_history/`, giữ nguyên hình dạng đường dẫn gốc:

```
{FUI_MCP_WORKDIR}/_history/{projectId}/_db/sp/{name}_{thời điểm}.sql
{FUI_MCP_WORKDIR}/_history/{projectId}/_db/sp/{name}_{thời điểm}_deleted.sql   ← SP bị DROP
```

Một kho duy nhất cho cả project lẫn DB: lúc cần bản cũ chỉ phải nhớ **một** chỗ, và mọi bản của cùng
một file nằm cạnh nhau (tìm theo tên file, không phải theo thời điểm). Kho này **không bao giờ tự
dọn** — user tự xoá tay khi thấy đủ.

**Cấu trúc `_db/config.json`:**

```json
{
  "apiDomain": "api.example3.vn",
  "apiName":   "acc",
  "sqlServer": "192.0.2.101",
  "database":  "AccountUser",
  "dbToken":   "<base64-encoded connection string>",
  "userToken": "<bearer token — tùy chọn>"
}
```

| Field | Bắt buộc | Mô tả |
|---|---|---|
| `apiDomain` | ✅ | Domain tAPI, ví dụ `api.example3.vn` |
| `apiName` | ❌ | Alias app trong tAPI, ví dụ `acc` |
| `sqlServer` | ❌* | Host SQL Server — cần có để dùng `db_token_rebuild` |
| `database` | ❌* | Tên database — cần có để dùng `db_token_rebuild` |
| `dbToken` | ✅ | Chuỗi kết nối SQL Server đã base64-encode |
| `userToken` | ❌ | Bearer token để test `spAPI_*` sau khi deploy |

*Nên truyền khi `db_connect` để sau này có thể `db_token_rebuild` mà không cần hỏi lại.

---

## 2. Tìm thông tin kết nối của một project

### 2a. Đọc `apiDomain` từ project.json

`project.json` của mỗi project thường có trường `data.apiDomain` — đây là base URL của tAPI server kèm apiName:

```json
"data": {
  "apiDomain": "https://tapi.example.vn/acc/",
  ...
}
```

Từ URL này:
- **`apiDomain`** → `tapi.example.vn`
- **`apiName`** → `acc` (phần path đầu tiên sau domain)

Một số project có nhiều domain, mỗi domain dùng một tAPI server riêng:

```json
"domainSetting": {
  "sec.example.vn": {
    "apiDomain": "https://tapi.example.vn/acc/"
  },
  "sec.example3.vn": {
    "apiDomain": "https://api.example3.vn/acc/"
  }
}
```

→ Hỏi user đang làm việc với domain nào để chọn `apiDomain` đúng.

### 2b. Tra cứu SQLServer + DatabaseName qua API Security Manager

Khi biết `apiName` nhưng chưa biết `SQLServer` và `DatabaseName`, gọi SM API để tra cứu.

**URL theo group:**

| Group | SM API URL |
|---|---|
| GroupA | `https://tapi.example.vn/acc/SM_Modules_ManagerSelect` |
| GroupB | `https://tapi.example2.vn/acc/SM_Modules_ManagerSelect` |
| GroupC | `https://api.example3.vn/acc/SM_Modules_ManagerSelect` |
| GroupD | `https://api.example4.vn/acc/SM_Modules_ManagerSelect` |

**Cần Bearer token** — lấy từ bất kỳ project nào đã có `userToken` trong cùng group (userToken dùng chung trong group).

**Gọi bằng PowerShell:**
```powershell
$token = "<userToken từ project cùng group>"
$headers = @{ "Authorization" = "Bearer $token" }
$r = Invoke-WebRequest -Uri "https://tapi.example.vn/acc/SM_Modules_ManagerSelect" -Headers $headers -UseBasicParsing
$data = ($r.Content | ConvertFrom-Json).data
$data | Where-Object { $_.APIName -like "*<alias>*" } | ConvertTo-Json
```

**Response trả về:**
```json
{
  "APIName":      "basic",
  "SQLServer":    "192.0.2.20",
  "DatabaseName": "BasicData",
  "ModuleName":   "Basic Data"
}
```

> ⚠️ Field `Password` trong response là **hash nội bộ của tAPI**, không phải SQL Server password thực — không dùng được để build dbToken.

### 2c. Lấy UID/PWD và build dbToken mới từ project cùng group

Trong cùng một group (ví dụ GroupA), các server thường dùng **cùng UID/PWD**. Quy trình an toàn (không hiện password ra màn hình):

**Bước 1:** Đọc dbToken từ `_db/config.json` của project đã có config trong cùng group:
```
{FUI_MCP_WORKDIR}/{projectId}/_db/config.json  → lấy field "dbToken"
```

**Bước 2:** Decode + build dbToken mới bằng PowerShell — chỉ thay `Server` và `Database`, giữ nguyên `UID`/`PWD`:
```powershell
$existing = [System.Text.Encoding]::UTF8.GetString(
    [Convert]::FromBase64String("<dbToken của project cùng group>")
)
$uid = ($existing -split ";") | Where-Object { $_ -match "UID=" } | ForEach-Object { ($_ -split "=",2)[1].Trim() }
$pwd = ($existing -split ";") | Where-Object { $_ -match "PWD=" } | ForEach-Object { ($_ -split "=",2)[1].Trim() }

$newConn = "Server=<SQLServer>; Database=<DatabaseName>; UID=$uid; PWD=$pwd; Encrypt=True; TrustServerCertificate=True;"
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($newConn))
```

**Bước 3:** Dùng token vừa build để gọi `db_connect` (xem mục 4).

### 2d. Workflow đầy đủ — kết nối DB lần đầu cho project mới trong cùng group

```
1. project_sync(projectId)
      → ghi project.json xuống {FUI_MCP_WORKDIR}/{projectId}/project.json
      → đọc file này lấy apiDomain
      → tách apiName từ path URL (phần sau domain, trước dấu / thứ 2)

2. Tìm userToken từ workspace:
      → Glob "{FUI_MCP_WORKDIR}/**/_db/config.json"
      → Đọc file của project cùng GroupName có "userToken" set

3. Gọi SM_Modules_ManagerSelect với userToken
      → Lọc theo APIName == alias
      → Lấy SQLServer + DatabaseName

4. Đọc dbToken từ _db/config.json của project cùng group
      → Decode → extract UID + PWD (bằng PowerShell, không hiển thị plain text)
      → Build dbToken mới với SQLServer + DatabaseName mới

5. db_connect(projectId, apiDomain, apiName, sqlServer, database, dbToken, userToken)
      → Schema tự động fetch và lưu
      → KHÔNG gọi db_schema_get thêm
```

---

## 3. Build dbToken

`dbToken` là chuỗi kết nối SQL Server được **base64-encode**. Chuỗi gốc:

```
Server={sqlServer};Database={database};UID={uid};PWD={pwd};Encrypt=True;TrustServerCertificate=True;
```

**Build bằng JavaScript:**
```js
Buffer.from("Server=192.0.2.101;Database=AccountUser;UID=sa;PWD=MyPass;Encrypt=True;TrustServerCertificate=True;").toString("base64")
```

**Build bằng PowerShell:**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("Server=192.0.2.101;Database=AccountUser;UID=sa;PWD=MyPass;Encrypt=True;TrustServerCertificate=True;"))
```

---

## 4. Workflow kết nối lần đầu

### Xác định projectId trước khi kết nối

Thông tin kết nối DB được lưu vào `{FUI_MCP_WORKDIR}/{projectId}/_db/config.json`. **`projectId` thường tương ứng với `apiName` của database** (ví dụ alias `acc` → projectId `security-manager` hoặc project nào dùng alias đó).

**Quy tắc bắt buộc:** Nếu user không chỉ rõ projectId, hoặc alias/database chưa rõ thuộc project nào → **phải hỏi xác nhận** trước khi gọi `db_connect`:

> _"Thông tin kết nối DB này sẽ được lưu vào project nào? (projectId)"_

Không tự đoán projectId rồi gọi luôn — lưu sai project sẽ khiến schema/SP bị đặt nhầm chỗ và khó tìm lại.

```
db_connect(apiDomain, dbToken, [sqlServer, database, apiName, userToken])
  → schema tự động được fetch và lưu vào _db/schema.json
  → KHÔNG gọi db_schema_get thêm sau bước này
```

**Tham số đầy đủ nên truyền:**

```json
{
  "projectId":  "my-project",
  "apiDomain":  "tapi.example.vn",
  "apiName":    "acc",
  "sqlServer":  "192.0.2.101",
  "database":   "MyDatabase",
  "dbToken":    "<base64>",
  "userToken":  "<bearer token nếu có>"
}
```

Truyền `sqlServer` + `database` ngay từ đầu để sau này dùng được `db_token_rebuild` mà không cần hỏi lại.

---

## 5. Khi đổi mật khẩu — db_token_rebuild

Khi UID hoặc PWD thay đổi nhưng Server và Database vẫn giữ nguyên:

**Bước 1:** Xác nhận config đã có `sqlServer` và `database`
```
db_config_read(projectId)
```

**Bước 2:** Rebuild token — server tự lấy `sqlServer`/`database` từ config, chỉ cần truyền thông tin thay đổi
```
db_token_rebuild({ projectId, uid, password })
```

Tool sẽ tự build lại `dbToken`, test kết nối, và lưu. Nếu `sqlServer`/`database` chưa có trong config → phải dùng `db_connect` đầy đủ thay thế.

---

## 6. userToken — Mục đích và chia sẻ

### Mục đích

`userToken` là **Bearer token của người dùng** — dùng để gọi các `spAPI_*` endpoint sau khi deploy, nhằm test API như một user thực. Khác với `dbToken` là kết nối trực tiếp vào SQL Server.

```
dbToken   → kết nối SQL Server để chạy schema/SP
userToken → gọi REST API của tAPI như một end-user (test spAPI_*)
```

### Chia sẻ userToken giữa các project

**userToken có thể dùng chung** cho các project trong cùng một **GroupName** (xem trong `_projectInfo.json`):

```json
{ "GroupName": "GroupA" }
```

Nếu đã có `userToken` từ project GroupA khác → có thể set thẳng cho project mới mà không cần đăng nhập lại:

```
db_user_token_set(projectId, userToken)
```

Hoặc bỏ qua `userToken` khi gọi tool — MCP sẽ tự scan workspace tìm token từ project cùng group.

### Set userToken sau khi kết nối

Nếu chưa có lúc `db_connect`, set riêng sau:
```
db_user_token_set({ projectId, userToken })
```

---

## 7. Refresh schema

| Khi nào | Tool |
|---|---|
| Sau `db_connect` | **Không cần** — schema đã tự fetch |
| User yêu cầu refresh | `db_schema_get(projectId)` |
| Vừa tạo/đổi tên/xóa table hoặc SP | `db_schema_get(projectId)` |
| Schema local trông cũ/thiếu | `db_schema_get(projectId)` |

Đọc schema đã cache (nhanh, không gọi DB):
```
db_schema_read(projectId, objectType?)
```
`objectType`: `Table`, `View`, `API`, `API File`, `Procedure`, `Function`

**Tự dọn SP/function mồ côi khi refresh:** `db_connect`/`db_schema_get` so sánh danh sách SP/function
trong schema CŨ (trước khi ghi đè) với schema MỚI vừa fetch từ DB thực — SP/function nào đã bị người
khác `DROP` trên server (biến mất khỏi schema mới) mà local vẫn còn `_db/sp/{name}.sql` thì file đó
được **archive vào `_history/{projectId}/_db/sp/{name}_{thời điểm}_deleted.sql`** rồi xóa khỏi `_db/sp/` (cùng cơ
chế `db_sp_delete` dùng khi tự tay xóa) — không để lại file cũ tưởng là định nghĩa còn hiệu lực. Kết
quả tool trả về dòng `📋 Archived orphaned local SP file(s)...` nếu có. Không đụng file `.sql` nào
chưa từng có trong schema cũ (khả năng là SP mới soạn local qua `db_sp_save`, chưa deploy).

---

## 8. Workflow làm việc với SP

```
1. db_sp_list(projectId)              → xem danh sách SP từ schema local
2. db_sp_get(name, projectId)         → fetch định nghĩa SP từ DB → lưu _db/sp/{name}.sql
3. [sửa file _db/sp/{name}.sql]
4. db_sp_save(name, sql, projectId)   → lưu SQL vào local, chưa deploy
5. db_sp_deploy(name, projectId)      → deploy lên DB
                                         (bản ĐANG CHẠY trên server tự lưu vào _history/
                                          trước khi ghi — đây là bản để rollback)
                                         nếu tên là spAPI_*/spAPIFILE_* → tự gọi /help xoá
                                         cache tAPI (một lần, hỏng thì bỏ qua — không chặn
                                         deploy, không cần gọi lại)
6. db_sp_help(name, projectId)        → BẮT BUỘC gọi thủ công khi SP được ALTER/deploy bằng
                                         con đường khác ngoài db_sp_deploy (ví dụ:
                                         db_sql_execute_nonquery chạy ALTER PROCEDURE
                                         trực tiếp) — đường đó không có auto-clear.
                                         Cũng dùng khi muốn xem tham số đầu vào của API
                                         trước khi wire IN/OUT vào module.json.
                                         Tool gọi MỘT lần theo URL chuẩn, hỏng thì chỉ báo
                                         một dòng thông tin — ĐỪNG thử URL biến thể khác
7. db_sp_verify(name, params)         → kiểm chứng TĨNH contract API vừa deploy (đọc hay ghi đều
                                         qua tool này) — KHÔNG gọi HTTP/SQL nào cả, chỉ đọc thân SP
                                         thật và suy luận response shape, contract lỗi, phân loại
                                         đọc/ghi, sinh sẵn snippet apiMocks cho module_simulate
```

> Cách suy luận của `db_sp_verify` (đọc thân SP thật, không đoán theo tên, lỗi cứng khi không đọc
> được thân SP) và cách kiểm tra API ghi bằng module_simulate: xem
> [tools-registry.md](tools-registry.md#quy-tắc-bắt-buộc-cho-db-tools). Các guard `DROP`/`ALTER
> TABLE`, `DELETE`/`UPDATE` không `WHERE` đều enforce ở code level, không bypass được; lệnh ghi qua
> `db_sql_execute`/`db_sql_execute_nonquery` cần `confirmWrite: true`.

**Rollback SP:**
1. Đọc file trong `{FUI_MCP_WORKDIR}/_history/{projectId}/_db/sp/{name}_{thời điểm}.sql`
2. `db_sp_save(name, oldSql)` — ghi lại bản cũ vào local
3. `db_sp_deploy(name)` — deploy lại

---

## 9. Kiểm tra nhanh config hiện tại

```
db_config_read(projectId)
```

Trả về tất cả metadata (`apiDomain`, `apiName`, `sqlServer`, `database`) và trạng thái token (có/không — **không trả giá trị token**).

---

## 10. Cheat sheet — Tool theo tình huống

| Tình huống | Tool cần dùng |
|---|---|
| Kết nối DB lần đầu | `db_connect` |
| Kiểm tra config đang có | `db_config_read` |
| Đổi UID/PWD, server/database giữ nguyên | `db_token_rebuild` |
| Set userToken sau khi connect | `db_user_token_set` |
| Xem danh sách tables/SPs | `db_sp_list` |
| Lấy nội dung SP từ DB | `db_sp_get` |
| Refresh schema từ DB thực | `db_schema_get` |
| Đọc schema đã cache | `db_schema_read` |
| Lưu SQL chỉnh sửa vào local | `db_sp_save` |
| Deploy SP lên DB (tự xoá cache tAPI nếu là spAPI_*/spAPIFILE_*) | `db_sp_deploy` |
| Xem tham số đầu vào của API đã deploy (trước khi wire vào module.json) | `db_sp_help` |
| Xoá cache tAPI thủ công sau khi ALTER qua `db_sql_execute_nonquery` (đường đó không có auto-clear) | `db_sp_help` **(bắt buộc)** |
| Kiểm chứng tĩnh API vừa deploy (trước khi wire vào UI, không gọi sống) | `db_sp_verify` |
| Xóa SP khỏi DB | `db_sp_delete` |
| Đổi tên SP | `db_sp_rename` |
| Tìm SQLServer + DatabaseName của alias | Gọi SM API (xem mục 2b) |
| Build dbToken từ project cùng group | Decode dbToken cũ + đổi Server/DB (xem mục 2c) |

---

## 11. Quy tắc thiết kế bảng

Quy ước đặt tên bảng, khóa chính, trường timestamp và cột audit đã tách sang **[db-table-design.md](db-table-design.md)** — load file đó khi thiết kế schema mới.
