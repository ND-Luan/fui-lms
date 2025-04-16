function promiseStudentHocSinh_By_PH() {
    return new Promise(resolve => {
        ajaxCALL('/student/Calen_GetInfoStudentByPhuHuynhID', null, res => {
            resolve(res.data)
        })
    })
}
async function checkRedirectRole() {
    const user = vueData.user
    const VaiTro = localStorage.getItem('Is_Joined_Page_VaiTro')
    if (!VaiTro) {
        //1: Giáo viên
        if (user.GroupID === 1) {
            const data = await promiseStudentHocSinh_By_PH()
            //Nếu > 0 thì Giáo viên có con
            if (data.length > 0) {
                redirect('/chon-phan-he')
            } else {
                //Nếu ko có thì trở về trang default
                // redirect('/')
            }
        } else if (user.GroupID === 2) {
            //Phụ huynh
            redirect('/ph-report')
        }
    }
}