async function fn_Save() {
    for (const item of vueData.items) {
        // Sử dụng await để đợi hàm promise hoàn tất
        const data = await new Promise(resolve => {
            ajaxCALL(
                `psmark1/LMS_GetDanhGiaHocSinh?LopID=${item.LopID}&KyDanhGia=${vueData.KyDanhGia}&NamHoc=2024`,
                null,
                res => {
                    resolve(res.data);
                }
            );
        });
        // Xử lý dữ liệu sau khi hoàn tất
        if (data.length > 0) {
            const mapData_LopID_MonHocCode = data.map(x => ({
                ...x,
                LopID: item.LopID,
                KyDanhGia: vueData.KyDanhGia
            }));
            // Uncomment this line if you want to send data
            ajaxCALL('lms/MonHocLop_C1_Ins', { JSON_DiemHocSinh: mapData_LopID_MonHocCode });
        }
    }
}