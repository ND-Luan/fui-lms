// ===================================================================
// 1) Lấy danh sách cột lá
// ===================================================================
function extractLeafColumns(headers) {
    const leaves = [];
    function walk(node) {
        if (!node.children || node.children.length === 0) {
            if (node.value) leaves.push(node.value);
        } else {
            node.children.forEach(walk);
        }
    }
    headers.forEach(walk);
    return leaves;
}
// ===================================================================
// 2) Build header 3 dòng + merges
// ===================================================================
function buildHeaderRows(headers, maxDepth = 3) {
    const rows = Array.from({ length: maxDepth }, () => []);
    const merges = [];
    let colIndex = 0;
    const walk = (node, depth = 0) => {
        if (!node.children || node.children.length === 0) {
            // Cột lá
            rows[depth][colIndex] = node.title || "";
            // Merge dọc từ depth đến cuối
            if (depth < maxDepth - 1) {
                merges.push({
                    s: { r: depth, c: colIndex },
                    e: { r: maxDepth - 1, c: colIndex }
                });
            }
            colIndex++;
            return 1;
        }
        // Node cha
        const startCol = colIndex;
        let span = 0;
        node.children.forEach(child => span += walk(child, depth + 1));
        // Ghi title cha
        rows[depth][startCol] = node.title || "";
        // Merge ngang nếu có >1 con
        if (span > 1) {
            merges.push({
                s: { r: depth, c: startCol },
                e: { r: depth, c: startCol + span - 1 }
            });
        }
        return span;
    };
    headers.forEach(node => walk(node, 0));
    return { rows, merges };
}
// ===================================================================
// 3) Kiểm tra xem data đã có dòng tổng chưa
// ===================================================================
function hasFooterRow(items) {
    if (!items || items.length === 0) return false;
    const lastItem = items[items.length - 1];
    // Kiểm tra KhoiID = 'Tổng' hoặc 'TỔNG' (case-insensitive)
    return lastItem.KhoiID && String(lastItem.KhoiID).toLowerCase().includes('tổng');
}
// ===================================================================
// 4) Tính dòng tổng (dành cho trường hợp chưa có)
// ===================================================================
function calcFooterRow(items, flatCols) {
    const footerRow = [];
    const totalSL = (items || []).reduce((s, x) => s + (Number(x.TongSL) || 0), 0);
    flatCols.forEach(colKey => {
        // Cột Khối: text "Tổng"
        if (colKey === 'KhoiID') {
            footerRow.push('Tổng');
            return;
        }
        // Cột TSHS ĐÁNH GIÁ
        if (colKey === 'TongSL') {
            footerRow.push(totalSL);
            return;
        }
        // Cột Số lượng: *Tot, *HT, *CHT, hoặc *SoLuong*
        if ((/(Tot|HT|CHT)$/.test(colKey) || colKey.includes('SoLuong')) &&
            !colKey.includes('Tile') &&
            !colKey.includes('ChiTieu') &&
            !colKey.includes('TangGiam')) {
            const sum = (items || []).reduce((s, x) => s + (Number(x[colKey]) || 0), 0);
            footerRow.push(sum);
            return;
        }
        // Cột %: *Tile* (tính lại từ tổng)
        if (colKey.includes('Tile')) {
            // Tìm cột số lượng tương ứng
            let countKey = colKey
                .replace('TileTot', 'Tot')
                .replace('TileHT', 'HT')
                .replace('TileCHT', 'CHT')
                .replace('TileHoanThanh', 'SoLuongHoanThanh')
                .replace('TileChuaHoanThanh', 'SoLuongChuaHoanThanh')
                .replace('TileHoanThanhTot', 'SoLuongHoanThanhTot');
            // Nếu không tìm thấy, thử tìm pattern khác
            if (!countKey.includes('SoLuong') && !/(Tot|HT|CHT)$/.test(countKey)) {
                countKey = colKey.replace('Tile', 'SoLuong');
            }
            const sumCount = (items || []).reduce((s, x) => s + (Number(x[countKey]) || 0), 0);
            // Tổng số HS cho cột này (có thể khác totalSL)
            const totalForCol = sumCount > 0 ? (items || []).reduce((s, x) => {
                const tot = Number(x[countKey.replace(/HoanThanh|ChuaHoanThanh|HoanThanhTot|Tot|HT|CHT/, 'Tot')]) || 0;
                const ht = Number(x[countKey.replace(/HoanThanh|ChuaHoanThanh|HoanThanhTot|Tot|HT|CHT/, 'HT')]) || 0;
                const cht = Number(x[countKey.replace(/HoanThanh|ChuaHoanThanh|HoanThanhTot|Tot|HT|CHT/, 'CHT')]) || 0;
                return s + tot + ht + cht;
            }, 0) : totalSL;
            const pct = totalForCol > 0 ? (sumCount / totalForCol) * 100 : 0;
            footerRow.push(`${_.round(pct, 2)}%`);
            return;
        }
        // Các cột khác (ChiTieu, TangGiam) để trống
        footerRow.push('');
    });
    return footerRow;
}
// ===================================================================
// 5) Append môn học - TỰ ĐỘNG XỬ LÝ CẢ 2 TRƯỜNG HợP
// ===================================================================
function appendMonHocToSheet(bigSheetData, bigMerges, mon) {
    const { headers, items } = mon;
    const flatCols = extractLeafColumns(headers);
    const { rows: headerRows, merges: headerMerges } = buildHeaderRows(headers, 3);
    const headerStartRow = bigSheetData.length;
    // Thêm 3 dòng header
    headerRows.forEach(row => bigSheetData.push([...row]));
    // Đẩy merge với offset
    headerMerges.forEach(m => {
        bigMerges.push({
            s: { r: m.s.r + headerStartRow, c: m.s.c },
            e: { r: m.e.r + headerStartRow, c: m.e.c }
        });
    });
    // Kiểm tra xem data đã có dòng tổng chưa
    const alreadyHasFooter = hasFooterRow(items);
    // Thêm dữ liệu
    if (items?.length) {
        items.forEach(item => {
            const row = flatCols.map(k => {
                const val = item[k];
                // Format % nếu là cột Tile
                if (k.includes('Tile') && val != null) {
                    const strVal = String(val);
                    // Nếu đã có % thì giữ nguyên, chưa có thì thêm
                    if (strVal.includes('%')) {
                        return strVal;
                    }
                    return `${_.round(Number(val), 2)}%`;
                }
                return val ?? "";
            });
            bigSheetData.push(row);
        });
        // Nếu chưa có dòng tổng, tự tính và thêm vào
        if (!alreadyHasFooter) {
            const footerRow = calcFooterRow(items, flatCols);
            bigSheetData.push(footerRow);
        }
    }
    // Dòng trống ngăn cách giữa các môn
    bigSheetData.push([]);
}
// ===================================================================
// 6) Export chính
// ===================================================================
function exportExcel(dsMonHoc, dsHocKi, hocKiValue, tenFile = null) {
    const hocKi = dsHocKi.find(x => x.value === hocKiValue);
    const tenHK = hocKi ? hocKi.title : "HK";
    const wb = XLSX.utils.book_new();
    const bigSheetData = [];
    const bigMerges = [];
    // Thêm từng môn học
    dsMonHoc.forEach(mon => {
        appendMonHocToSheet(bigSheetData, bigMerges, mon);
    });
    const ws = XLSX.utils.aoa_to_sheet(bigSheetData);
    if (bigMerges.length > 0) ws["!merges"] = bigMerges;
    // Cấu hình độ rộng cột
    ws['!cols'] = [
        { wch: 8 },                     // Cột Khối
        { wch: 12 },                    // Cột TSHS ĐÁNH GIÁ (nếu có)
        ...Array(200).fill({ wch: 13 }) // Các cột còn lại
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Tổng hợp");
    const fileName = tenFile || `Sheet.xlsx`;
    XLSX.writeFile(wb, fileName);
}
function exportThongKeDiemExcel({
    headers,
    items,
    itemSums,       // mảng các dòng tổng theo môn
    itemMonHocs,
    DSHocKi,
    HocKi
}) {
    const wb = XLSX.utils.book_new();
    // ==================== SHEET 1: ĐIỂM ====================
    XLSX.utils.book_append_sheet(wb, createSheetDiem(headers, items, itemSums), "Điểm");
    // ==================== SHEET 2: PHỔ ĐIỂM ====================
    XLSX.utils.book_append_sheet(wb, createSheetPhoDiem(itemMonHocs), "Phổ điểm");
    // ==================== XUẤT FILE ====================
    const tenHK = DSHocKi.find(x => x.value === HocKi)?.title || "HK";
    XLSX.writeFile(wb, `ThongKe_Diem_PhoDiem_${tenHK}_2025-2026.xlsx`);
}
// ================================================
// SHEET 1: ĐIỂM – ĐÚNG NHƯ ẢNH BẠN GỬI (TỪNG KHỐI → TỪNG MÔN + TỔNG CỘNG)
// ================================================
function createSheetDiem(headers, items, itemSums) {
    const data = [];
    const merges = [];
    // Header đa cấp
    const { rows: hRows, merges: hMerges } = buildMultiLevelHeader(headers);
    hRows.forEach(r => data.push(r));
    merges.push(...hMerges);
    // Dữ liệu từng dòng (giữ nguyên thứ tự items)
    items.forEach(item => {
        data.push(flattenHeaders(headers).map(h => item[h.value] ?? ""));
    });
    // DÒNG TỔNG CỘNG – ĐÚNG NHƯ ẢNH
    if (itemSums?.length > 0) {
        itemSums.forEach(sumItem => {
            const row = [];
            let colIdx = 0;
            headers.forEach(h => {
                if (h.value === "KhoiID") {
                    row[colIdx] = ""; // trống
                }
                else if (h.value === "TenMon") {
                    row[colIdx] = sumItem.TenMon || "Tổng cộng";
                }
                else if (h.children) {
                    h.children.forEach(child => {
                        row[colIdx] = sumItem[child.value] ?? "";
                        colIdx++;
                    });
                    return;
                }
                else {
                    row[colIdx] = sumItem[h.value] ?? "";
                }
                colIdx++;
            });
            data.push(row);
        });
    }
    const ws = XLSX.utils.aoa_to_sheet(data);
    if (merges.length) ws["!merges"] = merges;
    // Độ rộng cột
    ws['!cols'] = [{ wch: 10 }, { wch: 28 }, ...Array(100).fill({ wch: 11 })];
    return ws;
}
// ================================================
// SHEET 2: PHỔ ĐIỂM – KHÔNG TÊN MÔN, CHỈ HEADER + KHỐI MERGE DỌC
// ================================================
function createSheetPhoDiem(itemMonHocs) {
    const data = [];
    const merges = [];
    itemMonHocs.forEach((mon, index) => {
        const monHeaders = mon.headers || [];
        const monItems = mon.items || [];
        if (monHeaders.length === 0 || monItems.length === 0) return;
        const leafKeys = extractLeafColumns(monHeaders);
        // Header đa cấp
        const { rows: hRows, merges: hMerges } = buildMultiLevelHeader(monHeaders, 3);
        const headerStartRow = data.length;
        hRows.forEach(row => {
            data.push(["Khối", ...row]);
        });
        // Merge dọc cột Khối
        merges.push({
            s: { r: headerStartRow, c: 0 },
            e: { r: headerStartRow + hRows.length - 1, c: 0 }
        });
        // Merge header (cộng +1 cột)
        hMerges.forEach(m => {
            merges.push({
                s: { r: m.s.r + headerStartRow, c: m.s.c + 1 },
                e: { r: m.e.r + headerStartRow, c: m.e.c + 1 }
            });
        });
        // Dữ liệu
        monItems.forEach(item => {
            const row = [item.KhoiID ?? ""];
            leafKeys.forEach(k => row.push(item[k] ?? ""));
            data.push(row);
        });
        // Dòng trống giữa các môn (trừ môn cuối)
        if (index < itemMonHocs.length - 1) {
            data.push([]);
        }
    });
    const ws = XLSX.utils.aoa_to_sheet(data);
    if (merges.length) ws["!merges"] = merges;
    const maxCols = itemMonHocs[0]
        ? extractLeafColumns(itemMonHocs[0].headers).length + 1
        : 6;
    ws['!cols'] = [{ wch: 10 }, ...Array(maxCols - 1).fill({ wch: 17 })];
    return ws;
}
// ================================================
// CÁC HÀM HỖ TRỢ (GIỮ NGUYÊN – ĐÃ HOÀN HẢO)
// ================================================
function extractLeafColumns(headers) {
    const leaves = [];
    const walk = node => {
        if (!node.children || node.children.length === 0) {
            if (node.value) leaves.push(node.value);
        } else node.children.forEach(walk);
    };
    headers.forEach(walk);
    return leaves;
}
function flattenHeaders(headers) {
    const flat = [];
    headers.forEach(h => {
        if (h.children?.length) h.children.forEach(c => flat.push(c));
        else flat.push(h);
    });
    return flat;
}
function buildMultiLevelHeader(headers, maxDepth = 3) {
    const rows = Array.from({ length: maxDepth }, () => []);
    const merges = [];
    let col = 0;
    const walk = (node, depth = 0) => {
        if (!node.children || node.children.length === 0) {
            rows[depth][col] = node.title || "";
            if (depth < maxDepth - 1) {
                merges.push({ s: { r: depth, c: col }, e: { r: maxDepth - 1, c: col } });
            }
            col++;
            return 1;
        }
        const start = col;
        let span = 0;
        node.children.forEach(ch => span += walk(ch, depth + 1));
        rows[depth][start] = node.title || "";
        if (span > 1) {
            merges.push({ s: { r: depth, c: start }, e: { r: depth, c: start + span - 1 } });
        }
        return span;
    };
    headers.forEach(h => walk(h, 0));
    return { rows, merges };
}