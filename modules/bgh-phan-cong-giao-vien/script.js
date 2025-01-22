function formatPhanCong(dsGiaoVien, phanCongMoi) {
    // Duyệt qua từng phân công
    phanCongMoi.forEach(phanCong => {
        // Tìm giáo viên tương ứng
        let giaoVien = dsGiaoVien.find(gv => gv.GiaoVienID === phanCong.GiaoVienID);
        if (giaoVien) {
            // Kiểm tra điều kiện không thêm nếu các trường là null
            if (
                phanCong.LopID === null ||
                phanCong.MonHocID === null ||
                phanCong.GVLopID === null
            ) {
                return; // Bỏ qua phân công này
            }
            // Kiểm tra xem phân công đã tồn tại chưa
            let phanCongTonTai = giaoVien.PhanCong && giaoVien.PhanCong.some(mon =>
                mon.MonHocID === phanCong.MonHocID &&
                mon.LopID === phanCong.LopID
            );
            // Chỉ tạo mảng và thêm khi phân công chưa tồn tại
            if (!phanCongTonTai) {
                // Nếu PhanCong là null, tạo mới mảng
                if (giaoVien.PhanCong === null) {
                    giaoVien.PhanCong = [];
                }
                giaoVien.PhanCong.push({
                    GVLopID: phanCong.GVLopID,
                    VaiTro: phanCong.VaiTro,
                    LopID: phanCong.LopID,
                    TenLop: phanCong.TenLop,
                    MonHocID: phanCong.MonHocID,
                    TenMonDuLieuNganh: phanCong.TenMonDuLieuNganh
                });
                // Cập nhật MonHocDisplayName
                giaoVien.MonHocDisplayName = [...new Set(giaoVien.PhanCong.map(mon => mon.TenMonDuLieuNganh))];
            }
        }
    });
    vueData.DSGiaoVien2 = dsGiaoVien;
    return dsGiaoVien;
}
function getColorBySubject(subject) {
    const colorMap = {
        'Toán': 'primary',
        'Lý': 'success',
        'Hóa': 'error',
        'Sinh': 'warning'
    };
    return vueData.colorMap[subject] || 'grey';
}
function groupedData(data) {
    // Ánh xạ MonHocID sang tên môn học và nhóm lại
   const dataWithSubjects = data.map((gv) => ({
        GiaoVienID: gv.GiaoVienID,
        HoTenGV: gv.HoTenGV,
        MonHocID: gv.MonHocID,
        MonHocName: gv.MonHocName,
        }));
// Gộp theo ID và tạo mảng MON chứa các đối tượng { MonHocID, MonHocName }
let dataFilter = dataWithSubjects.reduce((acc, curr) => {
    const existing = acc.find((item) => item.GiaoVienID === curr.GiaoVienID);
  if (existing) {
    // Chỉ thêm khi MonHocID hoặc MonHocName không phải null
      if (curr.MonHocID != null && curr.MonHocName != null) {
      existing.MonHocDisplayName += `, ${curr.MonHocName}`;
      existing.PhanCong.push({
        MonHocID: curr.MonHocID,
        MonHocName: curr.MonHocName,
      });
    }
  } else {
    // Khởi tạo mới với mảng MON
    acc.push({
        GiaoVienID: curr.GiaoVienID,
        HoTenGV: curr.HoTenGV,
        MonHocDisplayName: curr.MonHocName,
        PhanCong:
            curr.MonHocID != null && curr.MonHocName != null
                ? [{ MonHocID: curr.MonHocID, MonHocName: curr.MonHocName}]
            : [],
    });
  }
  return acc;
}, []);
    vueData.DSGiaoVien = dataFilter
}
// function groupedData(data) {
//     let dataresult = data.reduce(function (acc, curr) {
//         debugger
//     const existing = acc.find(function (item) {
//       return item.id === curr.id;
//     });
//     if (existing) {
//       existing.subjects += `, ${curr.subject}`;
//     } else {
//         acc.push({ GiaoVien: curr.GiaoVienID, HoTenGV: curr.HoTenGV, subjects: curr.subject });
//     }
//     return acc;
//     }, []);
//     debugger
//     vueData.DSGiaoVien2 = dataresult
// }
function handleDataSelected(sessionData) {
    console.log("sessionData", sessionData)
};
function itemProps(item) {
    return {
        title: item.name,
        subtitle: item.department,
    }
};
function handleSelectionChange(newItems) {
    // Find the items added
    const added = newItems.filter(item => !this.addedItems.includes(item));
    // Find the items removed
    const removed = this.addedItems.filter(item => !newItems.includes(item));
    // Add new items to the list
    this.addedItems.push(...added);
    // Remove items that were unchecked
    this.addedItems = this.addedItems.filter(item => !removed.includes(item));
}
function removeItem(item) {
    // Remove the item from the added list
    this.addedItems = this.addedItems.filter(i => i !== item);
    // Update the combobox selection
    this.selectedItems = this.selectedItems.filter(i => i !== item);
}
function addToGroup(VaiTro = null, Khoi = null, Lop = null, GiaoVien = null, MonHoc = null) {
    if (!GiaoVien) {
        console.warn("GiaoVien is required");
        return;
    }
    // Tìm giáo viên trong danh sách
    let teacherGroup = vueData.phanCongLopItemSelected.find(
        (group) => group.GiaoVien === GiaoVien
    );
    if (!teacherGroup) {
        // Nếu giáo viên chưa tồn tại, thêm mới
        teacherGroup = {
            GiaoVien: GiaoVien,
            VaiTro: VaiTro || "Unknown Role",
            Khoi: [],
        };
        vueData.phanCongLopItemSelected.push(teacherGroup);
    }
    // Kiểm tra khối
    if (!Khoi || !Khoi.KhoiID) {
        console.warn("Khoi or KhoiID is missing");
        return;
    }
    const { KhoiID, TenKhoiHoc } = Khoi;
    // Tìm khối trong danh sách của giáo viên
    let khoiGroup = teacherGroup.Khoi.find((k) => k.KhoiID === KhoiID);
    if (!khoiGroup) {
        // Nếu khối chưa tồn tại, thêm mới
        khoiGroup = {
            KhoiID: KhoiID,
            KhoiName: TenKhoiHoc,
            items: [],
        };
        teacherGroup.Khoi.push(khoiGroup);
    }
    // Thêm lớp vào khối nếu chưa tồn tại và thuộc khối
    if (Lop) {
        // Kiểm tra xem lớp có thuộc khối không
        Lop.forEach((itemLop) => {
            const isClassInBlock = itemLop.KhoiID === KhoiID;
            if (!isClassInBlock) {
                console.warn(`Lớp ${Lop.TenLop} không thuộc khối ${TenKhoiHoc}`);
                return;
            }
            const existingClass = khoiGroup.items.find((item) =>
                item.Lop && item.Lop.LopID === itemLop.LopID
            );
            if (!existingClass) {
                // Nếu lớp chưa tồn tại, thêm mới
                khoiGroup.items.push({
                    Lop: Lop,
                    MonHoc: MonHoc || "Unknown Subject",
                });
            }
        });
    }
}
function transformDataFromPhanCongLopItemSelected(phanCongLopItemSelected, additionalInfo = {}) {
    const result = [];
    const uniqueEntries = new Set();
    phanCongLopItemSelected.forEach((teacher) => {
        const { GiaoVien: GiaoVienID, VaiTro, Khoi } = teacher;
        if (!Khoi || !Array.isArray(Khoi)) return;
        Khoi.forEach((khoi) => {
            const { KhoiID, items } = khoi;
            if (!items || !Array.isArray(items)) return;
            items.forEach((item) => {
                const { Lop, MonHoc } = item;
                if (!Lop || !Array.isArray(Lop)) return;
                // Lọc các lớp chỉ thuộc khối hiện tại
                const filteredLop = Lop.filter(lop =>
                    lop.KhoiID === KhoiID ||
                    (lop.KhoiID === undefined && KhoiID === 1) // Trường hợp đặc biệt cho khối 1
                );
                filteredLop.forEach((lop) => {
                    const uniqueKey = `${GiaoVienID}-${KhoiID}-${lop.LopID}-${MonHoc}-${lop.MaDonVi}`;
                    if (!uniqueEntries.has(uniqueKey)) {
                        const entry = {
                            GiaoVienID: GiaoVienID,
                            KhoiID: KhoiID,
                            LopID: lop.LopID,
                            MonHocID: MonHoc,
                            MaDonVi: lop.MaDonVi,
                            Enable: true,
                            VaiTro: VaiTro || [],
                            NienKhoa: additionalInfo.NienKhoa || null,
                            ToGiangDayID: additionalInfo.ToGiangDayID || null,
                            GhiChu: additionalInfo.GhiChu || "",
                        };
                        result.push(entry);
                        uniqueEntries.add(uniqueKey);
                    }
                });
            });
        });
    });
    return result;
}
function add() {
    let date = new Date();
        date.getYear()
    let additionalInfo = {}; // Khởi tạo object rỗng
    additionalInfo.NienKhoa = vueData.sessionData?.NienKhoaSelected
        ?? `${currentYear}`;
    additionalInfo.ToGiangDayID = vueData.sessionData?.ToGiangDayIDSelected
        ?? null;
    additionalInfo.GhiChu = vueData.GhiChu
        ?? null;
    let data = transformDataFromPhanCongLopItemSelected(vueData.phanCongLopItemSelected, additionalInfo = additionalInfo);
    const updatedDSGiaoVien2 = this.vueData.DSGiaoVien.map(GVItem => {
        // Tìm các dataItem phù hợp với giáo viên hiện tại
        const matchedDataItems = data.filter(
            dataItem => dataItem.GiaoVienID === GVItem.GiaoVienID
        );
        // Nếu có dataItem phù hợp
        if (matchedDataItems.length > 0) {
            // Tạo bản sao của giáo viên
            const updatedGVItem = { ...GVItem };
            // Khởi tạo PhanCong nếu chưa tồn tại
            updatedGVItem.PhanCong = updatedGVItem.PhanCong || [];
            // Thêm các lopInfo mới
            matchedDataItems.forEach(dataItem => {
                const lopInfo = {
                    LopID: dataItem.LopID,
                    MonHocID: dataItem.MonHocID,
                    MaDonVi: dataItem.MaDonVi,
                    Enable: dataItem.Enable,
                    VaiTro: dataItem.VaiTro,
                    NienKhoa: dataItem.NienKhoa,
                    ToGiangDayID: dataItem.ToGiangDayID,
                    GhiChu: dataItem.GhiChu
                };
                // Kiểm tra trùng lặp trước khi thêm
                const isDuplicate = updatedGVItem.PhanCong.some(
                    pc => pc.LopID === lopInfo.LopID &&
                        pc.MonHocID === lopInfo.MonHocID
                );
                if (!isDuplicate) {
                    updatedGVItem.PhanCong.push(lopInfo);
                }
            });
            return updatedGVItem;
        }
        // Trả về giáo viên gốc nếu không có thay đổi
        return GVItem;
    });
    debugger
    // Cập nhật DSGiaoVien2
    vueData.DSGiaoVien = updatedDSGiaoVien2;
    // Log kết quả
    // Cách sử dụng
    this.save(data)
        .then(response => {
            // Xử lý kết quả thành công
            console.log(response);
        })
        .catch(error => {
            // Xử lý lỗi
            console.error(error);
        });
}
function save(paramsSave) {
    return new Promise((resolve, reject) => {
        try {
            const params = JSON.stringify(paramsSave);
            const payload = {
                PhanCongInput: params,
            };
            PhanCongLMSService.AddPhanCong(payload)
                .then(response => {
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                });
        } catch (error) {
            reject(error);
        }
    });
}
async function deletePhanCong(id) {
    debugger
    const payload = {
        id: id,
    };
    await PhanCongLMSService.DelPhanCong(payload)
}