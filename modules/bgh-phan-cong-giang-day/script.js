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
            console.log(giaoVien.VaiTro);
        }
    });
    vueData.DSGiaoVien2 = dsGiaoVien;
    return dsGiaoVien;
}