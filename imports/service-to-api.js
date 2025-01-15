
const PREFIX = {
    STUDENT: 'student/',
    LMS: 'lms/'
}


// định nghĩa API ở đây
// SearchService - Cung cấp các hàm liên quan đến component tìm kiếm
const SearchLMSService = {
    GetCapHoc() {
        return CallAPI.get(PREFIX.LMS, "CapHoc","GET");  // Subdomain "LMS", methodSufix "Get" và params { id }
    },
    GetKhoiHocbyCapHocID(params) {
        return CallAPI.post(PREFIX.LMS, "KhoiHocByCapHoc","Get", params);  // Subdomain "LMS", methodSufix "Get" và params { id }
    },
    GetLopHocbyKhoiID(params) {
    return CallAPI.post(PREFIX.LMS, "Lop_Get_ByKhoiID",'', params);  // Subdomain "LMS", methodSufix "Get" và params { id }
    },
    
    GetGiaoVienByID(params) {
        return CallAPI.post(PREFIX.LMS, "GiaoVienByID", "Get", params);  // Subdomain "LMS", methodSufix "Get" và params  nhận vào là "GiaoVienID" hoặc  "CapID" "ToGiangDayID" chỉ được 1 trong 2 không được nhập cả 2
    },
  
    GetMonHocByID(params) {
        return CallAPI.get(PREFIX.LMS, "MonHoc_ByLopID_OR_CapID_OR_ByToGiangDayID", "GET", params);  // Subdomain "LMS", methodSufix "Get" và params nhận vào là LopID, CapID,ToGiangDay, NienKhoaID, MonHocID, muốn filter theo cái nào thì truyền vào cái đấy
    },
    GetMonHocChuaDuocPhanCong(params) {
        return CallAPI.get(PREFIX.LMS, "LopChuaDuocPhanCong", "GET", params);  // Subdomain "LMS", methodSufix "Get" và params nhận vào là  CapID 
    },
    GetToBoMonByID(params) {
        return CallAPI.get(PREFIX.LMS, "ToBoMon", "GET", params);  // Subdomain "LMS", methodSufix "Get" và params params nhận vào là  CapID, MonHocID muốn filter theo cái nào thì truyền vào cái đấy
    }, 

};

// SearchService - Cung cấp các hàm liên quan đến component tìm kiếm
const PhanCongLMSService = {
   
    GetKhoiHocbyCapHocID(params) {
        return CallAPI.post(PREFIX.LMS, "KhoiHocByCapHoc", "Get", params);  // Subdomain "LMS", methodSufix "Get" và params { id }
    },
    GetLopHocbyKhoiID(params) {
        return CallAPI.post(PREFIX.LMS, "Lop_Get_ByKhoiID", '', params);  // Subdomain "LMS", methodSufix "Get" và params { id }
    },

    AddPhanCong(params) {
        return CallAPI.post(PREFIX.LMS, "GiaoVienLop_Batch", 'Ins', params);  // Subdomain "LMS", methodSufix "Get" và params { id }
    },

};