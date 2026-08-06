# SQL CLR Functions — Hàm mở rộng nhúng DLL trong SQL Server

> File này sở hữu: **hàm SQL CLR: httpCall, sendMail, ImageResize, FileReader, RegexMatch...**

Database của project có thể đã cài sẵn các **SQL CLR scalar function** (hàm SQL được backing bởi DLL .NET biên dịch sẵn, đăng ký qua `CREATE ASSEMBLY` + `CREATE FUNCTION ... EXTERNAL NAME`). Khi thấy các hàm này trong `db_schema_read` hoặc trong định nghĩa SP hiện có, có thể **gọi trực tiếp trong T-SQL** như hàm built-in bình thường — không cần cài đặt lại, không cần biết code C# bên trong.

Nếu hàm cần dùng không có trong danh sách dưới đây (không tồn tại trong DB), **không tự bịa ra** — báo cho user biết là DB chưa có hàm này.

---

## 1. `SQLImageHelper` — Xử lý ảnh

### `dbo.ImageResize`

```sql
dbo.ImageResize(@extension nvarchar(10), @OriginalImage varbinary(max), @maxWidth int, @maxHeight int, @preserverAspectRatio bit, @quality int)
RETURNS varbinary(max)
```

Resize ảnh nhị phân về kích thước tối đa `@maxWidth` x `@maxHeight`.

| Tham số | Ý nghĩa |
|---|---|
| `@extension` | Định dạng ảnh output, ví dụ `'jpg'`, `'png'` |
| `@OriginalImage` | Dữ liệu ảnh gốc dạng `varbinary` |
| `@maxWidth`, `@maxHeight` | Kích thước tối đa (px) |
| `@preserverAspectRatio` | `1` = giữ tỉ lệ khung hình, resize theo cạnh dài nhất; `0` = resize ép đúng `maxWidth`x`maxHeight` |
| `@quality` | Chất lượng nén (thường 1-100) |

Trả về `varbinary` — ảnh đã resize, ghi thẳng vào cột `varbinary`/file hoặc trả qua tAPI File.

### `dbo.ImageCrop`

```sql
dbo.ImageCrop(@OriginalImage varbinary(max), @StartAtX int, @StartAtY int, @Width int, @Height int)
RETURNS varbinary(max)
```

Cắt (crop) một vùng chữ nhật từ ảnh gốc, bắt đầu tại `(@StartAtX, @StartAtY)`, kích thước `@Width` x `@Height`.

---

## 2. `SQLHttpHelper` — HTTP call, public value store, gửi mail

### `dbo.publicValueUUID` / `publicValueGet` / `publicValueSet`

Một key-value store dùng chung ở tầng server (không phải bảng SQL) — hữu ích để lưu tạm state xuyên suốt nhiều lần gọi SP mà không cần tạo bảng.

```sql
dbo.publicValueUUID() RETURNS nvarchar(max)          -- sinh 1 UUID mới, dùng làm key
dbo.publicValueGet(@name nvarchar(max)) RETURNS nvarchar(max)   -- đọc value theo key
dbo.publicValueSet(@name nvarchar(max), @Data nvarchar(max)) RETURNS int   -- ghi value theo key
```

### `dbo.httpCall` / `dbo.httpAPI` — Gọi HTTP request từ T-SQL

```sql
dbo.httpCall(@Method nvarchar(max), @URL nvarchar(max), @Header nvarchar(max), @Data nvarchar(max))
RETURNS nvarchar(max)
```

`httpAPI` có chữ ký tham số **giống hệt** `httpCall` (khác implementation nội bộ — dùng khi cần gọi API nội bộ tAPI, còn `httpCall` dùng cho HTTP tổng quát ra ngoài).

| Tham số | Ý nghĩa |
|---|---|
| `@Method` | `'GET'`, `'POST'`, `'PUT'`, `'DELETE'`... (không phân biệt hoa thường, mặc định `GET` nếu rỗng) |
| `@URL` | URL đầy đủ, phải là absolute URL hợp lệ |
| `@Header` | Danh sách header, xem cú pháp bên dưới — truyền `''` nếu không cần custom header |
| `@Data` | Body request dạng JSON string — **chỉ được gửi khi Method khác GET/HEAD**; luôn gửi dưới dạng `Content-Type: application/json` trừ khi `@Header` override lại |

**Ví dụ:**

```sql
SELECT dbo.httpCall('POST', 'https://tapi.example.vn/me/auth/ApplicationList', '', '')
```

#### Cú pháp `@Header` — pipe-delimited `Key: Value`

Đây là phần quan trọng nhất khi dùng `httpCall`/`httpAPI`. `@Header` là một chuỗi duy nhất, mỗi cặp header cách nhau bởi `|`, mỗi cặp có dạng `Key: Value` (tách bằng dấu `:` đầu tiên, phần còn lại — kể cả nếu chứa `:` — thuộc về value):

```
"Authorization: Bearer eyJhbGciOi...|X-Custom-Header: abc123"
```

Implementation (C#) xử lý như sau — **không phân biệt hoa/thường tên header**, và một số tên có xử lý đặc biệt:

| Header name | Hành vi |
|---|---|
| `Authorization`, `X-*`, mọi tên khác | Add thẳng vào request headers (`TryAddWithoutValidation`) — dùng cho token, API key |
| `referer` / `referrer` | Parse thành URI, set `request.Headers.Referrer` |
| `user-agent` | Ghi đè `User-Agent` mặc định |
| `accept` | Ghi đè `Accept` |
| `accept-language` | Ghi đè `Accept-Language` |
| `accept-encoding` | Ghi đè `Accept-Encoding` |
| `content-type` | Nếu request có body (`Method` khác GET/HEAD) → set vào `Content.Headers.Content-Type` (ghi đè `application/json` mặc định); nếu không có body → set vào request headers thường |
| Bất kỳ header nào bắt đầu bằng `content-` (khác `content-type`) | Nếu có body → route vào `Content.Headers` thay vì request headers (theo chuẩn HTTP — các header `Content-*` mô tả nội dung body) |

**Ví dụ set Bearer token + custom header:**

```sql
SELECT dbo.httpCall(
  'POST',
  'https://api.example.com/data',
  'Authorization: Bearer abc123xyz|Content-Type: application/json; charset=utf-8',
  '{"key":"value"}'
)
```

**Lưu ý khi ghép nhiều header:** không được có thêm dấu `|` thừa hoặc thiếu — mỗi cặp phải tách rõ bằng đúng 1 dấu `|`, thiếu `:` trong 1 cặp thì cặp đó bị bỏ qua (không lỗi, chỉ silent skip).

#### Response format của `httpCall`/`httpAPI`

- Nếu HTTP status = **200**: trả về **nguyên văn body** của response (không bọc thêm gì) — có thể là JSON, text thuần, hoặc bất kỳ định dạng nào server trả về.
- Nếu HTTP status **khác 200** (400, 401, 404, 500...): trả về JSON dạng bọc lỗi:
  ```json
  {"httpErrorCode": 404, "responseData": "<nội dung body, hoặc escaped string nếu không phải JSON>"}
  ```
  → khi parse kết quả trong SP, luôn kiểm tra xem response có field `httpErrorCode` không để biết là lỗi hay thành công.
- Nếu URL không hợp lệ: trả về `{"httpErrorCode":0,"responseData":"Invalid URL"}`.
- Timeout/exception khác: trả message lỗi dạng text (không phải JSON), nên khi dùng trong SP cần tự kiểm tra format trước khi `OPENJSON`.

### `dbo.sendMail`

```sql
dbo.sendMail(@email_to nvarchar(max), @subject nvarchar(max), @content nvarchar(max), @from nvarchar(max), @fromDisplayName nvarchar(max), @smtp_server nvarchar(max), @smtp_port int, @userName nvarchar(max), @Password nvarchar(max), @EnableSSL bit)
RETURNS nvarchar(max)
```

Gửi email qua SMTP trực tiếp từ T-SQL.

| Tham số | Ý nghĩa |
|---|---|
| `@email_to` | Địa chỉ người nhận |
| `@subject` | Tiêu đề mail |
| `@content` | Nội dung mail (HTML hoặc text) |
| `@from` | Địa chỉ email gửi (phải khớp/được phép bởi SMTP account) |
| `@fromDisplayName` | Tên hiển thị người gửi |
| `@smtp_server`, `@smtp_port` | Ví dụ `'smtp.gmail.com'`, `587` |
| `@userName`, `@Password` | Tài khoản SMTP dùng để auth |
| `@EnableSSL` | `1` = bật SSL/TLS (bắt buộc với Gmail SMTP) |

```sql
SELECT dbo.sendMail('user@example.vn','Tiêu đề','Nội dung','noreply@example.vn','My System','smtp.gmail.com',587,'noreply@example.vn','app-password',1)
```

> **Bảo mật:** không hardcode `@Password` SMTP trực tiếp trong SP nếu tránh được — cân nhắc lưu qua `publicValueSet`/`publicValueGet` hoặc config bảng riêng có phân quyền, để không lộ credential khi ai đó xem definition của SP.

---

## 3. `SQLFileSystem` — Đọc/ghi file trên server

```sql
dbo.FileCreateFolder(@Path nvarchar(max)) RETURNS nvarchar(max)
dbo.FileReader(@Path nvarchar(max)) RETURNS varbinary(max)
dbo.FileWriter(@Content varbinary(max), @Path nvarchar(max)) RETURNS nvarchar(max)
dbo.FileExists(@Path nvarchar(max)) RETURNS bit
dbo.FileDelete(@Path nvarchar(max)) RETURNS nvarchar(max)
dbo.FileMove(@SourceFileName nvarchar(max), @DestFileName nvarchar(max)) RETURNS nvarchar(max)
```

Thao tác trực tiếp trên filesystem của **máy SQL Server** (không phải máy client) — `@Path` là đường dẫn tuyệt đối trên server đó. Dùng khi SP cần lưu file kết quả (ví dụ ảnh đã resize bằng `ImageResize`, PDF xuất ra) vào một thư mục cố định để tAPI File API hoặc IIS phục vụ lại.

| Hàm | Ý nghĩa |
|---|---|
| `FileCreateFolder` | Tạo thư mục (kể cả nested), trả message kết quả |
| `FileReader` | Đọc toàn bộ nội dung file, trả `varbinary` |
| `FileWriter` | Ghi `@Content` (varbinary) vào `@Path`, tạo mới hoặc ghi đè |
| `FileExists` | Kiểm tra tồn tại, trả `bit` |
| `FileDelete` | Xóa file |
| `FileMove` | Di chuyển/đổi tên file từ `@SourceFileName` sang `@DestFileName` |

> Vì đây là thao tác trên đĩa server thật, cân nhắc quyền hạn (permission check trong SP) trước khi cho phép `FileDelete`/`FileWriter` chạy theo input từ client — tương tự nguyên tắc guard DDL/DML đã áp dụng cho `db_sql_execute_nonquery`.

---

## 4. `SQLExpansionFunction` — Regex & so sánh chuỗi

```sql
dbo.RegexReplace(@Input nvarchar(max), @Pattern nvarchar(1000), @Replacement nvarchar(4000)) RETURNS nvarchar(max)
dbo.RegexIsMatch(@Input nvarchar(max), @Pattern nvarchar(1000)) RETURNS bit
dbo.RegexMatch(@Input nvarchar(max), @Pattern nvarchar(1000)) RETURNS nvarchar(max)
dbo.RegexMatchArray(@Input nvarchar(max), @Pattern nvarchar(1000)) RETURNS nvarchar(max)
dbo.CompareWord(@String1 nvarchar(max), @String2 nvarchar(max)) RETURNS int
```

| Hàm | Ý nghĩa |
|---|---|
| `RegexReplace` | Thay thế theo regex `.NET` — dùng khi T-SQL `REPLACE` không đủ (cần pattern, không phải literal string) |
| `RegexIsMatch` | Kiểm tra `@Input` có khớp `@Pattern` không, trả `bit` — dùng validate format (email, phone, mã số...) ngay trong SP |
| `RegexMatch` | Trả về **match đầu tiên** tìm được (`Match.Value` — toàn bộ chuỗi khớp, không tách group), rỗng nếu không khớp |
| `RegexMatchArray` | Trả về **tất cả match, kèm từng capture group**, dạng **JSON object phẳng** (không phải array) — xem cấu trúc chi tiết bên dưới |
| `CompareWord` | So sánh độ giống nhau giữa 2 chuỗi, trả `int` (thường là số ký tự khác biệt hoặc similarity score — kiểm tra thực tế qua `SELECT dbo.CompareWord('a','b')` nếu cần biết thang đo chính xác) |

`@Pattern` dùng cú pháp regex chuẩn .NET (`\d`, `\w`, `^$`, group `()`...), không phải T-SQL `LIKE` pattern. Cả 4 hàm regex đều **luôn bật cố định** `IgnoreCase | Multiline | Singleline` — nghĩa là mặc định **không phân biệt hoa/thường**, `^`/`$` khớp theo từng dòng, và `.` khớp cả ký tự xuống dòng — không có cách nào tắt các flag này qua tham số.

#### Cấu trúc thật của `RegexMatchArray` — JSON object, không phải array

Dựa theo code C#, kết quả là một **object phẳng** (`{...}`), không phải `[...]`. Key có dạng `"M{m}G{g}"`:

- `m` = số thứ tự match (match thứ 1, 2, 3... trong `@Input`, đánh số từ 1)
- `g` = số thứ tự group **trong chính match đó** (đánh số từ 1): `G1` luôn là **toàn bộ chuỗi khớp** (tương đương `Match.Groups[0]`, cũng là giá trị mà `RegexMatch` trả về), `G2`, `G3`... là các **capture group** `(...)` trong `@Pattern`, nếu có.
- Nếu không có match nào, trả về object rỗng `"{}"`.
- Giá trị mỗi key đã được loại bỏ tab/newline/carriage-return (`\t`, `\n`, `\r`) và escape dấu `"`.

Ví dụ: `RegexMatchArray('SDT: 0901 - 0902', '(\d{4})')` (pattern có 1 group) trả về:

```json
{"M1G1": "0901", "M1G2": "0901", "M2G1": "0902", "M2G2": "0902"}
```

(ở đây G1 = G2 vì toàn bộ match trùng với group con duy nhất — nếu pattern không có group con nào, mỗi match cũng chỉ sinh ra đúng 1 cặp `G1`.)

Vì đây là **object**, không phải array, nên khi parse trong T-SQL:
- `OPENJSON(@result)` **không có `path` mặc định cho array** — vẫn chạy được nhưng trả về theo schema `key/value/type` (mỗi key `"M1G1"` là 1 row, cột `key` = tên, cột `value` = giá trị) chứ không phải mỗi match 1 row có cấu trúc lồng nhau.
- Muốn lấy giá trị 1 match/group cụ thể theo tên biết trước, dùng `JSON_VALUE(@result, '$."M1G1"')`.
- Muốn duyệt tất cả kết quả, dùng `OPENJSON(@result)` không truyền path, rồi tự parse tiền tố `M{m}G{g}` từ cột `key` nếu cần nhóm theo match.

---

## 5. Khi nào dùng các hàm này trong SP

- Luôn kiểm tra hàm đã tồn tại trong DB trước (`db_schema_read` filter theo `objectType` function, hoặc `SELECT * FROM sys.objects WHERE type='FS'`) — SQL CLR function chỉ dùng được nếu assembly đã được `CREATE ASSEMBLY` trên DB đó. Không phải DB nào cũng có.
- Dùng trong `spAPI_*` khi nghiệp vụ cần: gọi API ngoài (`httpCall`), xử lý ảnh upload (`ImageResize`/`ImageCrop`), gửi email thông báo (`sendMail`), validate chuỗi bằng regex (`RegexIsMatch`), hoặc lưu file lên đĩa server (`FileWriter`).
- Kết quả trả về `nvarchar(max)` dạng JSON (như `httpCall`, `RegexMatchArray`) nên dùng `OPENJSON`/`JSON_VALUE` để parse tiếp trong T-SQL trước khi trả ra ngoài qua tAPI.
