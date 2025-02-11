
function formatPhanCong(dsGiaoVien, phanCongMoi) {
    const dataWithSubjects = dsGiaoVien.map((gv) => ({
        GiaoVienID: gv.GiaoVienID,
        HoTenGV: gv.HoTenGV,
        MonHocID: gv.MonHocID,
        MonHocName: gv.MonHocName,
        Color: gv.Color,
    }));
    // Gộp theo ID và tạo mảng MON chứa các đối tượng { MonHocID, MonHocName }
    let dataFilter = dataWithSubjects.reduce((acc, curr) => {
        let existing = acc.find((item) => item.GiaoVienID === curr.GiaoVienID);
        if (existing) {
            // Xử lý môn học
            if (curr.MonHocID != null && curr.MonHocName != null) {
                // Nếu chưa tồn tại môn học này
                if (!existing.MonHocDisplayName.some(mon => mon.tenMonHoc === curr.MonHocName)) {
                    existing.MonHocDisplayName.push({
                        tenMonHoc: curr.MonHocName,
                        Color: curr.Color || 'grey' // Thêm màu nếu có
                    });
                }
            }
        } else {
            // Khởi tạo mới giáo viên
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
                if (giaoVien.PhanCong === null || giaoVien.PhanCong == undefined) {
                    giaoVien.PhanCong = [];
                    giaoVien.VaiTro = [];
                }
                giaoVien.PhanCong.push({
                    GVLopID: phanCong.GVLopID,
                    VaiTro: phanCong.VaiTro,
                    LopID: phanCong.LopID,
                    TenLop: phanCong.TenLop,
                    MonHocID: phanCong.MonHocID,
                    TenMonDuLieuNganh: phanCong.TenMonDuLieuNganh,
                    Color: phanCong.Color || 'gray',
                    VaiTro: phanCong.VaiTro
                });
                // Cập nhật MonHocDisplayName
                // Sử dụng Set để loại bỏ trùng lặp và giữ lại các môn học ban đầu
                const monHocSet = new Set();
                const monHocMap = new Map();
                // Xử lý MonHocDisplayName ban đầu (nếu có)
                if (giaoVien.MonHocDisplayName) {
                    giaoVien.MonHocDisplayName.forEach(mon => {
                        monHocSet.add(mon.tenMonHoc);
                        monHocMap.set(mon.tenMonHoc, mon.Color);
                    });
                }
                // Thêm các môn học từ PhanCong
                giaoVien.PhanCong.forEach(mon => {
                    if (!monHocSet.has(mon.TenMonDuLieuNganh)) {
                        monHocSet.add(mon.TenMonDuLieuNganh);
                        monHocMap.set(mon.TenMonDuLieuNganh, mon.Color);
                    }
                });
                // Tạo mảng mới với định dạng mong muốn
                giaoVien.MonHocDisplayName = Array.from(monHocSet).map(tenMonHoc => ({
                    tenMonHoc: tenMonHoc,
                    Color: monHocMap.get(tenMonHoc)
                }));
            }
            // Đảm bảo giaoVien.VaiTro là một mảng
            // Chuyển phanCong.VaiTro thành mảng nếu chưa phải mảng và loại bỏ trùng lặp
            // Định nghĩa ánh xạ vai trò từ số sang tên tương ứng
            const mappingVaiTro = {
                1: "Giáo viên chủ nhiệm",
                2: "Khối trưởng",
                3: "Giáo viên bộ môn"
            };
            // Màu sắc tương ứng cho từng vai trò
            const mappingColor = {
                "Giáo viên chủ nhiệm": "blue",
                "Khối trưởng": "green",
                "Giáo viên bộ môn": "orange"
            };
            // Đảm bảo phanCong.VaiTro là mảng và loại bỏ trùng lặp
            const vaiTroPhanCong = Array.isArray(phanCong.VaiTro)
                ? [...new Set(phanCong.VaiTro)]
                : [phanCong.VaiTro];
            // Chuyển đổi vai trò số thành chuỗi theo mappingVaiTro
            const vaiTroPhanCongChuyenDoi = vaiTroPhanCong.map(vaiTro =>
                mappingVaiTro[vaiTro] || vaiTro // Nếu không có trong mapping, giữ nguyên giá trị gốc
            );
            // Hợp nhất VaiTro cũ và mới rồi loại bỏ trùng lặp
            const uniqueVaiTro = [...new Set([
                ...giaoVien.VaiTro.map(item => mappingVaiTro[item.VaiTro] || item.VaiTro), // Chuyển đổi nếu là số
                ...vaiTroPhanCongChuyenDoi
            ])];
            // Gán lại giaoVien.VaiTro với danh sách không trùng lặp, đồng thời thêm màu sắc
            giaoVien.VaiTro = uniqueVaiTro.map(vaiTro => ({
                VaiTro: vaiTro,
                color: mappingColor[vaiTro] || "gray" // Nếu không có màu, dùng mặc định "gray"
            }));
            console.log(giaoVien.VaiTro);
        }
    });
    vueData.DSGiaoVien2 = dsGiaoVien;
    return dsGiaoVien;
}
function handleDataSelected(sessionData) {
    console.log("sessionData", sessionData)
};
function addToGroup(VaiTro = null, Khoi = null, Lop = null, GiaoVien = null, MonHoc = null) {
    debugger
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
            VaiTro: VaiTro || "",
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
    // Cập nhật DSGiaoVien2
    vueData.DSGiaoVien = updatedDSGiaoVien2;
    // Log kết quả
    // Cách sử dụng
    this.save(data)
        .then(response => {
            // Xử lý kết quả thành công
            if (response.IsSuccess)
            {
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
        id: id,
    };
    await PhanCongLMSService.DelPhanCong(payload)
}