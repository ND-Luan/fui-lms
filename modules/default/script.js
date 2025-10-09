function promiseStudentHocSinh_By_PH() {
    return new Promise(resolve => {
        ajaxCALL('/student/Calen_GetInfoStudentByPhuHuynhID', null, res => {
            resolve(res.data)
        })
    })
}
async function checkRedirectRole() {
    // alert('runinng....')
    try {
        vueData.IsLoadPage = false
        const user = vueData.user
        if (user.GroupID === 2 || user.GroupID === 3) {
            localStorage.removeItem('Is_Joined_Page_VaiTro')
            localStorage.removeItem('HocSinhSelected')
            localStorage.removeItem('IsPassRoleParent')
        }
        const VaiTro = localStorage.getItem('Is_Joined_Page_VaiTro')
        if (!VaiTro) {
            //1: Giáo viên
            if (user.GroupID === 1) {
                const data = await promiseStudentHocSinh_By_PH()
                    .finally(() => setTimeout(() => {
                        vueData.IsLoadPage = true
                    }, 100))
                //Nếu > 0 thì Giáo viên có con
                if (data.length > 0) {
                    // redirect('/chon-phan-he')
                    window.location.href = '/chon-phan-he'
                } else {
                    //Nếu ko có thì trở về trang default
                    // redirect('/')
                }
            } else if (user.GroupID === 2) {
                //Phụ huynh
                window.location.href = '/ph-report'
                // redirect('/ph-report')
                setTimeout(() => {
                    vueData.IsLoadPage = true
                }, 100)
            } else if (user.GroupID === 3) {
                //Học sinh
                // redirect('/lms-student-dashboard')
                window.location.href = '/lms-student-dashboard'
                setTimeout(() => {
                    vueData.IsLoadPage = true
                }, 100)
            }
            localStorage.removeItem('Is_Joined_Page_VaiTro')
        }
    }
    catch (error) {
    }
}
vueData.checkRedirectRole = checkRedirectRole