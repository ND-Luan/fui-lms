function apiService(url, params, type = 'GET') {
    return new Promise((resolve, reject) => {
        ajaxCALL(url, params, res => {
            if (type == 'GET') return resolve(res.data)
            else if (type == 'CDT') return resolve(true)
        })
    })
}