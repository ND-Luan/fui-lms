async function GET_NienKhoa_Info(){
    const res = await new Promise((resolve, reject) => {
        ajaxCALL('lms/NienKhoa_Get',{}, res => {
            let NienKhoa_HocKi_Enable = res.data.find(hk => hk.IsActive)
            resolve(NienKhoa_HocKi_Enable)
        })
    })
    return res
}

async function API_Promise(url,payload={}){
    const res = await new Promise((resolve, reject) => {
        ajaxCALL(url,payload, res => {
            resolve(res.data)
        })
    })
    return res
}