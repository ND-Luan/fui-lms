# Advanced FUI Techniques

> File này sở hữu: **kỹ thuật nâng cao: `EXE`, `MAP`, expression phức tạp, luật expression thuần cho `:attr`**. Action engine cơ bản xem [controls-patterns.md](controls-patterns.md).

This document captures advanced patterns and techniques for FUI development, extracted from real-world implementations.

---

## 1. `:attr` CHỈ NHẬN EXPRESSION THUẦN — không bao giờ nhét statement

**Luật cứng.** Mọi giá trị binding trong `module.json` — `:option`, `:config`, `:items`, `:headers`, `:style`, và mọi `v-bind:*` — đi **thẳng vào template compiler của Vue**, nơi chỉ chấp nhận **một biểu thức**. Tuyệt đối không được chứa:

- `function(){ ... }` hay IIFE `(function(){...})()`
- `return`
- `var` / `let` / `const`
- dấu `;` nối nhiều câu lệnh

### Vì sao nghiêm trọng hơn vẻ ngoài của nó

Statement trong `:attr` làm **compile template hỏng**, và Vue **nuốt lỗi đó**: kết quả là **trang trắng với 0 JS error, 0 `[Vue warn]`**. Không có stack trace, không có dòng nào để lần — chỉ mò ra được sau nhiều vòng `module_simulate({renderUI:true})`. Đây là lý do nó là **error** trong `module_validate` chứ không phải warning.

> Khác hẳn `data[]` / `IN` / `{{ }}`: những chỗ đó đi qua `getVueData()` của FUI (xem [controls-patterns.md](controls-patterns.md) §0 Value Resolution) và có luật riêng. `:attr` **không** đi qua đó.

### Được phép trong `:attr`

| Dạng | Ví dụ |
|---|---|
| Object / array literal | `":config": "{ height: 300, legend: { show: true } }"` |
| Ternary | `":color": "ok ? 'primary' : 'warning'"` |
| Chuỗi arrow `.map` / `.filter` | `":items": "ds.filter(x => x.Active).map(x => x.Name)"` |
| Truy cập thuộc tính / biến vueData | `":option": "optThe"` |

### Logic phức tạp → chuyển sang `script.js` + `EXE`

Nhiều bước biến đổi, biến trung gian, vòng lặp, điều kiện phức tạp → **đừng đặt trong `:attr`**. Bốn bước:

1. Viết một hàm thường trong `script.js`: `function tenHam(){ ... }`
2. Hàm **gán thẳng vào `vueData.xxx`** (không `return` giá trị cho JSON đọc)
3. Gọi hàm qua `EXE` — thường trong `CALLBACK` của action nạp dữ liệu: `"EXE": "tenHam()"`
4. `:attr` trong `module.json` chỉ trỏ tới biến đó: `":option": "optThe"`

❌ **Sai** — IIFE trong `:attr`:
```json
":option": "(function(){ var src = vueData.ds.filter(r => r.id===1); return { series:[{data: src}] }; })();"
```

✅ **Đúng**:
```javascript
// script.js
function buildChart() {
    var src = vueData.ds.filter(function (r) { return r.id === 1; });
    vueData.optThe = { series: [{ data: src }] };
}
```
```json
// module.json — action nạp dữ liệu
"CALLBACK": { "EXE": "buildChart()" },
// module.json — control
":option": "optThe"
```

`:option` khai báo trong `data[]` là `{}` để lần render đầu không vỡ; `buildChart()` gán bản thật sau khi API trả về.

### Chẩn đoán trang trắng khi "0 JS error, 0 Vue warn"

Triệu chứng đó **không phải lỗi runtime** — nghi **compile template trong `:attr`** trước tiên, đừng đi tìm trong `script.js` hay action engine.

Cách khoanh vùng nhanh: tạm thay biểu thức nghi ngờ bằng một giá trị tĩnh đơn giản (`":option": "{}"` hoặc bỏ hẳn attr đó) rồi render lại. **Trang hiện lại ⇒ chính biểu thức đó là thủ phạm.** Lặp lại cho từng `:attr` khả nghi cho tới khi khoanh đúng một cái.

Chạy `module_validate` trước khi render sẽ bắt được hầu hết các ca này ở dạng error, không cần mò.

---

## 2. Advanced Logic & Scripting

FUI's JSON-based logic has limitations. Use `script.js` for complex operations.

### Computed Properties Workaround
FUI `module.json` does not natively support computed properties. 
**Solution:** Define calculation functions in `script.js` and call them directly in `module.json`.

**script.js**:
```javascript
function getTongTien() {
    return vueData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
}
```

**module.json**:
```json
{
  "innerHTML": "Total: {{getTongTien().toLocaleString()}} VNĐ"
}
```

### Complex Validation
Avoid writing long logic strings in JSON. Move validation logic to `script.js`.

**script.js**:
```javascript
function validateStep1() {
    const d = vueData;
    if (!d.name || !d.email) {
        alert("Missing required fields!");
        return false;
    }
    return true;
}

function nextStep() {
    if (vueData.step === 1 && !validateStep1()) return;
    vueData.step++;
}
```

**module.json**:
```json
"v-on:click": "nextStep()"
```

### Action Binding
You can bind direct JS functions to events instead of using the `CALL` action protocol if needed for simple UI logic.

```json
"v-on:click": "prevBuoc()"
```

