
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
        return CallAPI.get(PREFIX.LMS, "GiaoVienByID", "GET", params);  // Subdomain "LMS", methodSufix "Get" và params { id } 
    },
    GiaoVienByToGiangDayID_Get(params) {
        return CallAPI.get(PREFIX.LMS, "GiaoVienByToGiangDayID", "GET", params);  // Subdomain "LMS", methodSufix "Get" và params { id } 
    },
    GetMonHocByID(params) {
        return CallAPI.get(PREFIX.LMS, "MonHoc_ByLopID_Or_CapID", "GET", params);  // Subdomain "LMS", methodSufix "Get" và params nhận vào là LopID, CapID, NienKhoaID, MonHocID, muốn filter theo cái nào thì truyền vào cái đấy
    },
    GetToBoMonByID(params) {
        return CallAPI.get(PREFIX.LMS, "ToBoMon", "GET", params);  // Subdomain "LMS", methodSufix "Get" và params params nhận vào là  CapID, MonHocID muốn filter theo cái nào thì truyền vào cái đấy
    },
    
   

   

};
