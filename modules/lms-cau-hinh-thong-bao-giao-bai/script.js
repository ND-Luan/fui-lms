async function GET_ThongBao_Template_DinhNghia_Get(params = {}) {
    let res = await API_Service('ThongBao_Template_DinhNghia_Get', params, 'GET')
    return res
}
async function GET_ThongBao_Template_Get(params = {}) {
    let res = await API_Service('ThongBao_Template_Get', params, 'GET')
    return res
}
async function INS_ThongBao_Template_Ins(params) {
    let res = await API_Service('ThongBao_Template_Ins', params)
    return res
}
async function UPD_ThongBao_Template_Upd_ByThongBao_TemplateID(params) {
    let res = await API_Service('ThongBao_Template_Upd_ByThongBao_TemplateID', params)
    return res
}
async function DEL_ThongBao_Template_Del(params) {
    let res = await API_Service('ThongBao_Template_Del', params)
    return res
}
async function GET_ThongBao_Template_Type_Get(params) {
    let res = await API_Service('ThongBao_Template_Type_Get', params, 'GET')
    return res
}
async function API_Service(url, params, type = 'CDT') {
    if (type == 'CDT') {
        let res = await new Promise((resolve, reject) => {
            ajaxCALL('lms/' + url, params, (response) => {
                resolve(true)
            }, (err) => {
                resolve(false)
            })
        })
        return res
    } else {
        let res = await new Promise((resolve, reject) => {
            ajaxCALL('lms/' + url, params, (response) => {
                resolve(response.data)
            }, (err) => {
                resolve(false)
            })
        })
        return res
    }
}