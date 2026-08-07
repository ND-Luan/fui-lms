(function (global) {
    var plugins = {};

    function register(name, plugin) {
        if (!name || !plugin) return;
        plugins[name] = plugin;
    }

    function getFileIds(html) {
        var div = document.createElement('div');
        div.innerHTML = html || '';
        return Array.prototype.map.call(div.querySelectorAll('img'), function (img) {
            var src = img.getAttribute('src') || img.src || '';
            var marker = '/FileData/';
            var markerIndex = src.toLowerCase().indexOf(marker.toLowerCase());
            if (markerIndex < 0) return null;
            return src.slice(markerIndex + marker.length).split('?')[0].split('#')[0].split('"')[0].split("'")[0].split('/')[0] || null;
        }).filter(Boolean);
    }

    function deleteRemovedFiles(oldHtml, newHtml, hooks) {
        var oldIds = getFileIds(oldHtml);
        var newIds = getFileIds(newHtml);
        console.log('[RichTextEditorPlugins] so sánh file', { oldIds: oldIds, newIds: newIds });
        oldIds.filter(function (fileId, index) {
            return oldIds.indexOf(fileId) === index && newIds.indexOf(fileId) === -1;
        }).forEach(function (fileId) {
            var manager = global.UploadManager;
            console.log('[RichTextEditorPlugins] phát hiện file bị xóa', { fileId: fileId, hasUploadManager: !!manager, hasDeleteMethod: !!(manager && manager.deleteLmsFile) });
            if (!manager || !manager.deleteLmsFile) {
                if (hooks && hooks.onError) hooks.onError(fileId, new Error('UploadManager.deleteLmsFile không khả dụng'));
                return;
            }
            manager.deleteLmsFile(fileId, {
                onComplete: function (response) { console.log('[RichTextEditorPlugins] xóa file thành công', { fileId: fileId, response: response }); if (hooks && hooks.onComplete) hooks.onComplete(fileId); },
                onError: function (error) { console.error('[RichTextEditorPlugins] xóa file thất bại', { fileId: fileId, error: error }); if (hooks && hooks.onError) hooks.onError(fileId, error); }
            });
        });
    }

    function ensureJSZip() {
        if (global.JSZip) return Promise.resolve();
        return new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = resolve; script.onerror = reject; document.head.appendChild(script);
        });
    }

    function cropThumbnail(srcUrl) {
        return new Promise(function (resolve, reject) {
            var image = new Image(); image.crossOrigin = 'anonymous';
            image.onload = function () {
                var canvas = document.createElement('canvas'), context = canvas.getContext('2d');
                var width = Math.max(0, image.width - 85); canvas.width = width; canvas.height = image.height;
                context.drawImage(image, 0, 0, width, image.height, 0, 0, width, image.height);
                canvas.toBlob(function (blob) { blob ? resolve(blob) : reject(new Error('Không tạo được ảnh thumbnail')); }, 'image/png');
            }; image.onerror = reject; image.src = srcUrl;
        });
    }

    function processGgb(file, hooks) {
        ensureJSZip().then(function () { return global.JSZip.loadAsync(file); })
            .then(function (zip) {
                var thumbnail = zip.file('geogebra_thumbnail.png');
                if (!thumbnail) throw new Error('File .ggb không chứa ảnh thumbnail');
                return thumbnail.async('base64');
            })
            .then(function (base64) { return cropThumbnail('data:image/png;base64,' + base64); })
            .then(function (blob) {
                var fileName = file.name.toLowerCase().endsWith('.ggb') ? file.name.slice(0, -4) + '_chuan.png' : file.name + '_chuan.png';
                var imageFile = new File([blob], fileName, { type: 'image/png' });
                if (!global.UploadManager || !global.UploadManager.uploadLmsFile) throw new Error('UploadManager.uploadLmsFile không khả dụng');
                global.UploadManager.uploadLmsFile(imageFile, {
                    onComplete: function (response) {
                        var item = response && response.Files && response.Files[0] ? response.Files[0] : response;
                        var baseUrl = (typeof vueData !== 'undefined' && vueData.v_Set && vueData.v_Set.urlReturnFile) || 'https://file.lhbs.vn/lms';
                        var fileUrl = item && item.FILE_URL ? item.FILE_URL : '';
                        var url = fileUrl ? (fileUrl.indexOf('http') === 0 ? fileUrl : baseUrl + (fileUrl.indexOf('/') === 0 ? fileUrl : '/' + fileUrl)) : item && item.FILE_ID ? baseUrl + '/FileData/' + item.FILE_ID : response && response.url ? response.url : '';
                        if (!url) { if (hooks && hooks.onError) hooks.onError(new Error('Server không trả về đường dẫn ảnh')); return; }
                        if (hooks && hooks.insertImage) hooks.insertImage(url);
                        if (hooks && hooks.onComplete) hooks.onComplete();
                    },
                    onError: function (error) { if (hooks && hooks.onError) hooks.onError(error); }
                });
            })
            .catch(function (error) { if (hooks && hooks.onError) hooks.onError(error); });
    }

    global.RichTextEditorPlugins = {
        register: register,
        get: function (name) { return plugins[name]; },
        all: function () { return plugins; },
        getFileIds: getFileIds,
        deleteRemovedFiles: deleteRemovedFiles,
        process: function (name, file, hooks) { if (name === 'ggb') processGgb(file, hooks); }
    };
})(window);
