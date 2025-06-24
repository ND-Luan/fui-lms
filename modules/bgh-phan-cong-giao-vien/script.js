
function formatPhanCong(dsGiaoVien, phanCongMoi) {
    // Lấy thông tin giáo viên và môn học từ dsGiaoVien ban đầu
    const dataWithSubjects = dsGiaoVien.map((gv) => ({
        GiaoVienID: gv.GiaoVienID,
        HoTenGV: gv.HoTenGV,
        MonHocID: gv.MonHocID,
        MonHocName: gv.MonHocName,
        Color: gv.Color,
    }));
    // Nhóm giáo viên theo GiaoVienID và tạo mảng MonHocDisplayName chứa thông tin môn học
    let dataFilter = dataWithSubjects.reduce((acc, curr) => {
        let existing = acc.find((item) => item.GiaoVienID === curr.GiaoVienID);
        if (existing) {
            if (curr.MonHocID != null && curr.MonHocName != null) {
                if (!existing.MonHocDisplayName.some(mon => mon.tenMonHoc === curr.MonHocName)) {
                    existing.MonHocDisplayName.push({
                        tenMonHoc: curr.MonHocName,
                        Color: curr.Color || 'grey'
                    });
                }
            }
        } else {
            acc.push({
                GiaoVienID: curr.GiaoVienID,
                HoTenGV: curr.HoTenGV,
                MonHocDisplayName: curr.MonHocName
                    ? [{
                        tenMonHoc: curr.MonHocName,
                        Color: curr.Color || null
                    }]
                    : [],
                PhanCong: [],
                VaiTro: []
            });
        }
        return acc;
    }, []);
    dsGiaoVien = dataFilter;
    // Duyệt qua từng phân công từ phanCongMoi
    phanCongMoi.forEach(phanCong => {
        // Tìm giáo viên tương ứng theo GiaoVienID
        let giaoVien = dsGiaoVien.find(gv => gv.GiaoVienID === phanCong.GiaoVienID);
        if (giaoVien) {
            // Nếu GVLopID là null thì không xử lý phân công này
            if (phanCong.GVLopID === null) {
                return;
            }
            // Kiểm tra xem phân công đã tồn tại chưa dựa trên MonHocID và LopID
            let phanCongTonTai = giaoVien.PhanCong && giaoVien.PhanCong.some(mon =>
                mon.MonHocID === phanCong.MonHocID &&
                mon.LopID === phanCong.LopID
            );
            if (!phanCongTonTai) {
                // Nếu mảng PhanCong hoặc VaiTro của giáo viên chưa khởi tạo thì khởi tạo
                if (giaoVien.PhanCong === null || giaoVien.PhanCong === undefined) {
                    giaoVien.PhanCong = [];
                    giaoVien.VaiTro = [];
                }
                // --- Mapping vai trò ---
                const mappingVaiTro = {
                    1: "Giáo viên lớp",
                    2: "Khối trưởng",
                    3: "Giáo viên bộ môn"
                };
                const mappingColor = {
                    "Giáo viên lớp": "blue",
                    "Khối trưởng": "green",
                    "Giáo viên bộ môn": "orange"
                };
                // Đảm bảo phanCong.VaiTro là mảng và loại bỏ trùng lặp (nếu có)
                const vaiTroPhanCong = Array.isArray(phanCong.VaiTro)
                    ? [...new Set(phanCong.VaiTro)]
                    : [phanCong.VaiTro];
                // Chuyển đổi vai trò từ số sang tên (theo mapping)
                const vaiTroPhanCongChuyenDoi = vaiTroPhanCong.map(vaiTro =>
                    mappingVaiTro[vaiTro] || vaiTro
                );
                // --- Tính chuỗi hiển thị (Display) và màu hiển thị (DisplayColor) ---
                // Quy tắc:
                // - Nếu có vai trò "Giáo viên bộ môn": Display = "<TenMonDuLieuNganh>:<TenLop>"
                // - Nếu có vai trò "Giáo viên lớp": Display = "Giáo viên lớp:<TenLop>"
                // - Nếu có vai trò "Khối trưởng": Display = "Khối trưởng:khoi"
                let displayText = "";
                let displayColor = "gray"; // Màu mặc định
                if (vaiTroPhanCongChuyenDoi.includes("Giáo viên bộ môn")) {
                    displayText = `${phanCong.TenMonDuLieuNganh}:${phanCong.TenLop}`;
                    displayColor = mappingColor["Giáo viên bộ môn"];
                } else if (vaiTroPhanCongChuyenDoi.includes("Giáo viên lớp")) {
                    displayText = `Giáo viên lớp:${phanCong.TenLop}`;
                    displayColor = mappingColor["Giáo viên lớp"];
                } else if (vaiTroPhanCongChuyenDoi.includes("Khối trưởng")) {
                    displayText = `Khối trưởng: ${phanCong.TenKhoiHoc}`;
                    displayColor = mappingColor["Khối trưởng"];
                }
                // Thêm phân công vào mảng PhanCong của giáo viên
                giaoVien.PhanCong.push({
                    GVLopID: phanCong.GVLopID,
                    // Giữ nguyên VaiTro gốc của phanCong (có thể là số) nếu cần,
                    // bên dưới chúng ta cập nhật danh sách VaiTro tổng quát riêng.
                    VaiTro: phanCong.VaiTro,
                    LopID: phanCong.LopID,
                    TenLop: phanCong.TenLop,
                    MonHocID: phanCong.MonHocID,
                    TenMonDuLieuNganh: phanCong.TenMonDuLieuNganh,
                    Color: phanCong.Color ?? displayColor,
                    Display: displayText,       // Chuỗi hiển thị theo vai trò
                });
                // Cập nhật danh sách MonHocDisplayName của giáo viên
                const monHocSet = new Set();
                const monHocMap = new Map();
                if (giaoVien.MonHocDisplayName) {
                    giaoVien.MonHocDisplayName.forEach(mon => {
                        if (mon.tenMonHoc) {
                            monHocSet.add(mon.tenMonHoc);
                            monHocMap.set(mon.tenMonHoc, mon.Color);
                        }
                    });
                }
                giaoVien.PhanCong.forEach(mon => {
                    if (mon.TenMonDuLieuNganh) {
                        monHocSet.add(mon.TenMonDuLieuNganh);
                        monHocMap.set(mon.TenMonDuLieuNganh, mon.Color);
                    }
                });
                giaoVien.MonHocDisplayName = Array.from(monHocSet).map(tenMonHoc => ({
                    tenMonHoc: tenMonHoc,
                    Color: monHocMap.get(tenMonHoc)
                }));
            }
            // Cập nhật danh sách VaiTro tổng quát của giáo viên (hợp nhất từ các phân công)
            const mappingVaiTro = {
                1: "Giáo viên lớp",
                2: "Khối trưởng",
                3: "Giáo viên bộ môn"
            };
            const mappingColor = {
                "Giáo viên lớp": "blue",
                "Khối trưởng": "green",
                "Giáo viên bộ môn": "orange"
            };
            const vaiTroPhanCong = Array.isArray(phanCong.VaiTro)
                ? [...new Set(phanCong.VaiTro)]
                : [phanCong.VaiTro];
            const vaiTroPhanCongChuyenDoi = vaiTroPhanCong.map(vaiTro =>
                mappingVaiTro[vaiTro] || vaiTro
            );
            const uniqueVaiTro = [...new Set([
                ...giaoVien.VaiTro.map(item => mappingVaiTro[item.VaiTro] || item.VaiTro),
                ...vaiTroPhanCongChuyenDoi
            ])];
            giaoVien.VaiTro = uniqueVaiTro.map(vaiTro => ({
                VaiTro: vaiTro,
                color: mappingColor[vaiTro] || "gray"
            }));
        }
    });
    vueData.DSGiaoVien2 = dsGiaoVien;
    return dsGiaoVien;
}
function handleDataSelected(sessionData) {
};
function addToGroup(VaiTro = null, Khoi = null, Lop = null, GiaoVien = null, MonHoc = null) {
    if (!GiaoVien) {
        return;
    }
    if (VaiTro == 2 || VaiTro == 1) {
        MonHoc = null
        if (VaiTro == 2) {
            Lop = []
        }
    }
    // Tìm giáo viên trong danh sách
    let teacherGroup = vueData.phanCongLopItemSelected.find(
        (group) => group.GiaoVien === GiaoVien
    );
    if (!teacherGroup) {
        // Nếu giáo viên chưa tồn tại, thêm mới
        teacherGroup = {
            GiaoVien: GiaoVien,
            VaiTro: VaiTro || "",
            Khoi: [],
        };
        vueData.phanCongLopItemSelected.push(teacherGroup);
    }
    // Kiểm tra khối
    if (!Khoi || !Khoi.KhoiID) {
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
                return;
            }
            const existingClass = khoiGroup.items.find((item) =>
                item.Lop && item.Lop.LopID === itemLop.LopID
            );
            if (!existingClass) {
                // Nếu lớp chưa tồn tại, thêm mới
                khoiGroup.items.push({
                    Lop: Lop,
                    MonHoc: MonHoc || 0,
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
            let hasValidLop = false; // Đánh dấu nếu có lớp hợp lệ để tránh tạo bản ghi trùng
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
                        hasValidLop = true;
                    }
                });
            });
            // Nếu VaiTro = 2 (Khối trưởng) và chưa có lớp nào, vẫn thêm một bản ghi với MonHocID = 0 và LopID = 0
            if (VaiTro == (2) && !hasValidLop) {
                const uniqueKey = `${GiaoVienID}-${KhoiID}-0-0-null`;
                if (!uniqueEntries.has(uniqueKey)) {
                    result.push({
                        GiaoVienID: GiaoVienID,
                        KhoiID: KhoiID,
                        LopID: 0,
                        MonHocID: 0,
                        MaDonVi: 1, // Không có MaDonVi cụ thể
                        Enable: true,
                        VaiTro: VaiTro || [],
                        NienKhoa: additionalInfo.NienKhoa || null,
                        ToGiangDayID: additionalInfo.ToGiangDayID || null,
                        GhiChu: additionalInfo.GhiChu || "Vai trò khối trưởng",
                    });
                    uniqueEntries.add(uniqueKey);
                }
            }
        });
    });
    return result;
}
function add() {
    debugger
    addToGroup(VaiTro = vueData.vaiTroItemSelected, Khoi = vueData.KhoiItem, Lop = vueData.LopItem, GiaoVien = vueData.sessionData.GiaoVienIDSelected, MonHoc = vueData.sessionData.MonHocIDSelected)
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
    // Cập nhật DSGiaoVien2
    vueData.DSGiaoVien = updatedDSGiaoVien2;
    // Log kết quả
    // Cách sử dụng
    this.save(data)
        .then(response => {
            // Xử lý kết quả thành công
            if (response.IsSuccess) {
                Vue.$toast.success("Thêm phân công thành công")
                location.reload()
            }
        })
        .catch(error => {
            // Xử lý lỗi
            Vue.$toast.error("Thêm phân công thất bại")
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
    const payload = {
        GVLopID: id,
    };
    await PhanCongLMSService.DelPhanCong(payload).then(response => {
        // Xử lý kết quả thành công
        if (response.IsSuccess) {
            Vue.$toast.success("Xóa thành công")
            location.reload()
        }
    })
        .catch(error => {
            // Xử lý lỗi
            Vue.$toast.error("Xóa thất bại")
        });
}