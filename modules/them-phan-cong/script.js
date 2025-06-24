function handleLopSelected(lop) {
    debugger
    console.log('Lớp đã chọn:', lop);
    debugger
}
function addToGroup(VaiTro = null, Khoi = null, Lop = null, GiaoVien = null, MonHoc = null) {
    debugger
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
async function addPhanCong()
{
    debugger
    console.log(vueData.selectedVaiTro, vueData.lopselected, vueData.selectedGV)
    debugger
    if (
        vueData.selectedVaiTro != null &&
        vueData.lopselected != null &&
        vueData.selectedMonHoc != null &&
        vueData.selectedGV != null
    )
    {
        // GiaoVienID, KhoiID, LopID, MonHocID, MaDonVi, VaiTro
         const danhSachPhanCong = vueData.lopselected.map(lop => ({
            LopID: lop.LopID,
            VaiTro: vueData.selectedVaiTro,
            GiaoVienID: vueData.selectedGV.GiaoVienID,
             HoTenGV: vueData.selectedGV.HoTenGV,
             KhoiID: lop.raw.KhoiID,
             NienKhoa: vueData.NienKhoa,
             MonHocID: vueData.selectedMonHoc.MonHocID,
             Enable: 1,
             MaDonVi: 1
        }));
        console.log(danhSachPhanCong)
        await this.save(danhSachPhanCong)
        debugger
    }
    else {
        Vue.$toast.error("vui lòng chọn đủ dữ liệu phân công")
        console.error(vueData.selectedVaiTro, vueData.lopselected, vueData.selectedGV)
        return
    }
}