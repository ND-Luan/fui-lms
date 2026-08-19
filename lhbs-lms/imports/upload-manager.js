/**
 * Global Upload Manager for fui-lms
 * Manages background file uploads reactively.
 */

(function () {
    let _state = null;

    function getOrCreateState() {
        if (!_state) {
            const initialTasks = [];
            // Handle reactive state depending on Vue version loaded
            if (typeof Vue !== 'undefined') {
                if (typeof Vue.reactive === 'function') {
                    _state = Vue.reactive({ tasks: initialTasks });
                } else if (typeof Vue.observable === 'function') {
                    _state = Vue.observable({ tasks: initialTasks });
                } else {
                    // Fallback to simple ref or plain object if no reactive wrapper is found
                    _state = { tasks: initialTasks };
                }
            } else {
                _state = { tasks: initialTasks };
            }
        }
        return _state;
    }

    const UploadManager = {
        get tasks() {
            return getOrCreateState().tasks;
        },

        /**
         * Standard document/file upload to LMS FileData endpoint (https://file.lhbs.vn/lms/upload/FileData)
         */
        uploadLmsFile(file, { onComplete, onError } = {}) {
            const defaultUrl = (typeof vueData !== 'undefined' && vueData?.v_Set?.apiFile)
                ? vueData.v_Set.apiFile
                : 'https://file.lhbs.vn/lms/upload/FileData';
            return this.addUploadTask({
                file,
                uploadUrl: defaultUrl,
                headers: {
                    authorization: typeof $awt !== 'undefined' ? $awt : ''
                },
                bodyBuilder: (f) => {
                    const formData = new FormData();
                    formData.append('file', f);
                    return formData;
                },
                onComplete,
                onError
            });
        },

        /**
         * Standard document/file upload to LMS LMS_FileData endpoint (https://file.lhbs.vn/lms/upload/LMS_FileData)
         */
        uploadLmsFileData(file, { onComplete, onError } = {}) {
            return this.addUploadTask({
                file,
                uploadUrl: 'https://file.lhbs.vn/lms/upload/LMS_FileData',
                headers: {
                    authorization: typeof $awt !== 'undefined' ? $awt : ''
                },
                bodyBuilder: (f) => {
                    const formData = new FormData();
                    formData.append('File', f);
                    return formData;
                },
                onComplete,
                onError
            });
        },

        /**
         * Add a new upload task to the background queue
         * @param {Object} options
         * @param {File} options.file - The file object to upload
         * @param {string} options.uploadUrl - The URL endpoint for upload
         * @param {string} [options.method] - HTTP method
         * @param {Object} [options.headers] - HTTP headers
         * @param {Function} [options.bodyBuilder] - Custom function to build the request body (e.g. (file) => FormData)
         * @param {Function} [options.onComplete] - Callback on success: (response) => {}
         * @param {Function} [options.onError] - Callback on error: (err) => {}
         */
        addUploadTask({ file, uploadUrl, method = 'POST', headers = {}, bodyBuilder, onComplete, onError }) {
            const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const xhr = new XMLHttpRequest();

            const task = {
                id: taskId,
                fileName: file.name,
                fileSize: file.size,
                progress: 0,
                status: 'pending',
                statusText: 'Đang chờ upload',
                errorMessage: '',
                xhr: xhr
            };

            const state = getOrCreateState();
            state.tasks = [...state.tasks, task];

            // Start the actual upload asynchronously
            this.startUpload(task, file, uploadUrl, method, headers, bodyBuilder, onComplete, onError);
            return taskId;
        },

        createPlaceholderTask(file, statusText = 'Đang chuẩn bị...') {
            const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const task = {
                id: taskId,
                fileName: file.name,
                fileSize: file.size,
                progress: 0,
                status: 'pending',
                statusText: statusText,
                errorMessage: '',
                xhr: null
            };
            getOrCreateState().tasks.push(task);
            return taskId;
        },

        startUpload(task, file, uploadUrl, method, headers, bodyBuilder, onComplete, onError) {
            task.status = 'uploading';
            task.statusText = 'Đang upload';
            const xhr = task.xhr;

            xhr.open(method, uploadUrl, true);

            // Set headers
            Object.keys(headers).forEach(key => {
                if (headers[key] === undefined || headers[key] === null || headers[key] === '') return;
                try {
                    xhr.setRequestHeader(key, headers[key]);
                } catch (error) {
                    console.warn(`Cannot set upload header "${key}"`, error);
                }
            });

            // Helper to set reactive properties safely
            const setTaskProp = (t, prop, val) => {
                t[prop] = val;
                if (typeof Vue !== 'undefined' && typeof Vue.set === 'function') {
                    Vue.set(t, prop, val);
                }
                // Trigger array reactivity for Vue 2/3
                const state = getOrCreateState();
                state.tasks = [...state.tasks];
            };

            // Track upload progress
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable && event.total > 0) {
                    const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
                    setTaskProp(task, 'progress', percent);
                } else {
                    setTaskProp(task, 'progress', 50);
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    setTaskProp(task, 'status', 'success');
                    setTaskProp(task, 'progress', 100);
                    setTaskProp(task, 'statusText', 'Upload hoàn tất');
                    let responseData = {};
                    try {
                        responseData = JSON.parse(xhr.responseText);
                    } catch (e) {
                        responseData = xhr.responseText;
                    }
                    if (onComplete) onComplete(responseData);
                } else {
                    this.handleError(task, onError, new Error(xhr.statusText || `Upload failed: ${xhr.status}`));
                }
            };

            xhr.onerror = () => {
                this.handleError(task, onError, new Error('Network error'));
            };

            xhr.onabort = () => {
                task.status = 'cancelled';
            };

            // Prepare the body
            const body = bodyBuilder ? bodyBuilder(file) : file;
            xhr.send(body);
        },

        /**
         * Upload a file to Google Drive and grant reader permissions to 'anyone'
         */
        uploadToGoogleDrive(file, { accessToken, parents, taskId, onComplete, onError } = {}) {
            let currentTaskId = taskId;
            if (!currentTaskId) {
                currentTaskId = this.createPlaceholderTask(file, 'Đang chuẩn bị upload Google Drive...');
            }
            const task = this.tasks.find(t => t.id === currentTaskId);
            if (task) {
                task.status = 'uploading';
                task.statusText = 'Đang truyền dữ liệu file...';
                task.xhr = new XMLHttpRequest();

                const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
                const method = 'POST';
                const headers = { Authorization: 'Bearer ' + accessToken };
                const bodyBuilder = (f) => {
                    const metadata = { name: f.name, mimeType: f.type };
                    if (parents) {
                        metadata.parents = parents;
                    }
                    const form = new FormData();
                    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
                    form.append('file', f);
                    return form;
                };

                this.startUpload(task, file, uploadUrl, method, headers, bodyBuilder, async (res) => {
                    this.updateTask(currentTaskId, { statusText: 'Đang cấp quyền file Google Drive...' });
                    try {
                        const reponse_permision = await fetch(`https://www.googleapis.com/drive/v3/files/${res.id}/permissions`, {
                            method: 'POST',
                            headers: {
                                Authorization: 'Bearer ' + accessToken,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                role: 'reader',
                                type: 'anyone'
                            })
                        });
                        if (!reponse_permision.ok) {
                            console.error('Error granting drive permission:', reponse_permision.statusText);
                        }
                    } catch (e) {
                        console.error('Exception granting drive permission:', e);
                    }

                    this.updateTask(currentTaskId, { statusText: 'Hoàn tất' });
                    if (onComplete) {
                        onComplete({
                            id: res.id,
                            name: file.name,
                            source: `https://drive.google.com/file/d/${res.id}/preview`
                        });
                    }
                }, onError);
            }
            return currentTaskId;
        },

        /**
         * Upload a video to YouTube using resumable upload flow and insert it into a playlist
         */
        async uploadToYouTube(file, { accessToken, playlistId, title, taskId, onComplete, onError } = {}) {
            const getCleanTitle = (filename) => {
                if (typeof filename !== 'string') return '';
                const extensions = ['mp4', 'mov', 'avi', 'mkv'];
                const regex = new RegExp(`\\.(${extensions.join('|')})$`, 'i');
                const nameWithoutExtension = filename.replace(regex, '');
                const clean = nameWithoutExtension.trim();
                return clean.length > 100 ? clean.slice(0, 100) : clean;
            };

            const videoTitle = title || getCleanTitle(file.name);
            const metadataBody = {
                snippet: {
                    title: videoTitle,
                    description: '',
                    tags: [],
                    categoryId: '27'
                },
                status: {
                    privacyStatus: 'unlisted',
                    selfDeclaredMadeForKids: true
                }
            };

            let currentTaskId = taskId;
            if (!currentTaskId) {
                currentTaskId = this.createPlaceholderTask(file, 'Đang chuẩn bị upload YouTube...');
            }

            try {
                const initRes = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status,contentDetails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json; charset=UTF-8',
                        'X-Upload-Content-Length': file.size.toString(),
                        'X-Upload-Content-Type': file.type
                    },
                    body: JSON.stringify(metadataBody)
                });

                if (!initRes.ok) {
                    throw new Error(`Init YouTube resumable upload failed: ${initRes.statusText}`);
                }

                const uploadUrl = initRes.headers.get('Location');
                if (!uploadUrl) {
                    throw new Error('Resumable upload URL not provided by YouTube API');
                }

                const task = this.tasks.find(t => t.id === currentTaskId);
                if (task) {
                    task.status = 'uploading';
                    task.statusText = 'Đang truyền dữ liệu video...';
                    task.xhr = new XMLHttpRequest();

                    const headers = {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Length': file.size.toString(),
                        'Content-Type': file.type
                    };

                    this.startUpload(task, file, uploadUrl, 'PUT', headers, (f) => f, async (res) => {
                        if (playlistId) {
                            this.updateTask(currentTaskId, { statusText: 'Đang cập nhật video vào danh sách phát...' });
                            try {
                                await fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet', {
                                    method: 'POST',
                                    headers: {
                                        Authorization: `Bearer ${accessToken}`,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        snippet: {
                                            playlistId: playlistId,
                                            resourceId: {
                                                kind: 'youtube#video',
                                                videoId: res.id
                                            }
                                        }
                                    })
                                });
                            } catch (e) {
                                console.error('Error adding video to YouTube playlist:', e);
                            }
                        }
                        this.updateTask(currentTaskId, { status: 'processing', statusText: 'Đang chờ YouTube xử lý video...' });
                        try {
                            const isCompleted = await this.waitUntilVideoReady(res.id, accessToken, 300000, (text) => {
                                this.updateTask(currentTaskId, { statusText: text });
                            });
                            if (isCompleted) {
                                this.updateTask(currentTaskId, { status: 'success', statusText: 'Hoàn tất' });
                                if (onComplete) {
                                    onComplete({
                                        id: res.id,
                                        name: file.name,
                                        source: `https://www.youtube.com/watch?v=${res.id}`
                                    });
                                }
                            }
                        } catch (videoError) {
                            this.handleError(task, onError, videoError);
                        }
                    }, onError);
                }
                return currentTaskId;
            } catch (err) {
                console.error(err);
                const task = this.tasks.find(t => t.id === currentTaskId);
                if (task) {
                    this.handleError(task, onError, err);
                } else if (onError) {
                    onError(err);
                }
            }
        },

        /**
         * Get token, retrieve/create playlist, and upload to YouTube
         */
        async uploadLmsYoutube(file, { playlistName, title, onComplete, onError } = {}) {
            const taskId = this.createPlaceholderTask(file, 'Đang kết nối YouTube...');
            try {
                const tokenRes = await fetchPromise('lms/FP_Youtube_Token_Get');
                const accessToken = tokenRes?.access_token;
                if (!accessToken) throw new Error('Cannot get YouTube access token');

                this.updateTask(taskId, { statusText: 'Đang kiểm tra danh sách phát...' });
                const playLists = await fetchPromise('lms/FP_Youtube_PlayList_Get', { Access_Token: accessToken });
                let playListCurrent = playLists?.find(x => x.Title === playlistName);
                if (!playListCurrent) {
                    this.updateTask(taskId, { statusText: 'Đang tạo danh sách phát mới...' });
                    const response = await fetchPromise('lms/FP_Youtube_PlayList_Ins', {
                        TenPlayList: playlistName, Access_Token: accessToken
                    });
                    playListCurrent = response[0];
                }

                this.updateTask(taskId, { statusText: 'Đang khởi tạo phiên tải lên YouTube...' });
                return this.uploadToYouTube(file, {
                    accessToken,
                    playlistId: playListCurrent?.PlaylistID,
                    title,
                    taskId,
                    onComplete,
                    onError
                });
            } catch (err) {
                console.error(err);
                this.handleError(this.tasks.find(t => t.id === taskId), onError, err);
            }
        },

        async getOrCreateFolderId(folderName, parentId = 'root', accessToken) {
            const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`;
            const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const data = await res.json();
            if (data.files.length > 0) return data.files[0].id;

            const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: folderName,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [parentId],
                }),
            });
            const created = await createRes.json();
            return created.id;
        },

        async ensureFolderPathExists(path, accessToken) {
            const parts = path.split('/');
            let parentId = 'root';
            for (const part of parts) {
                parentId = await this.getOrCreateFolderId(part, parentId, accessToken);
            }
            return parentId;
        },

        async uploadLmsGoogleDrive(file, { folderPath, onComplete, onError } = {}) {
            const taskId = this.createPlaceholderTask(file, 'Đang kết nối Google Drive...');
            try {
                const tokenRes = await fetchPromise('lms/FP_Youtube_Token_Get');
                const accessToken = tokenRes?.access_token;
                if (!accessToken) throw new Error('Cannot get Google Drive access token');

                this.updateTask(taskId, { statusText: 'Đang chuẩn bị thư mục trên Drive...' });
                const folderId = await this.ensureFolderPathExists(folderPath, accessToken);

                this.updateTask(taskId, { statusText: 'Đang bắt đầu tải file lên...' });
                return this.uploadToGoogleDrive(file, {
                    accessToken,
                    parents: [folderId],
                    taskId,
                    onComplete,
                    onError
                });
            } catch (err) {
                console.error(err);
                this.handleError(this.tasks.find(t => t.id === taskId), onError, err);
            }
        },

        handleError(task, onError, error) {
            task.status = 'error';
            task.errorMessage = error?.message || 'Upload failed';
            task.statusText = task.errorMessage;
            if (onError) onError(error);
        },

        updateTask(taskId, patch) {
            const task = this.tasks.find(t => t.id === taskId);
            if (!task) return;
            Object.assign(task, patch);
        },

        cancelTask(taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                if (task.status === 'uploading' && task.xhr) {
                    task.xhr.abort();
                }
                task.status = 'cancelled';
                this.removeTask(taskId);
            }
        },

        removeTask(taskId) {
            const state = getOrCreateState();
            state.tasks = state.tasks.filter(t => t.id !== taskId);
        },

        /**
         * Delete a file from the LMS server (FileData / LMS_FileData)
         */
        async deleteLmsFile(fileId, { onComplete, onError } = {}) {
            try {
                // Tách lấy FILE_ID thuần (loại bỏ /FileData/ hoặc các dấu / ở đầu nếu có)
                const cleanFileId = typeof fileId === 'string'
                    ? fileId.replace(/^\/FileData\//i, '').replace(/^\//, '')
                    : fileId;

                const res = await fetchPromise('lms/FileData_Delete', { FileID: cleanFileId }, { cache: false });
                if (res !== null && res !== undefined) {
                    if (onComplete) onComplete();
                    return true;
                } else {
                    throw new Error('Xóa file thất bại');
                }
            } catch (err) {
                console.error('Lỗi khi xóa file:', err);
                if (onError) onError(err);
                throw err;
            }
        },

        /**
         * Delete a file from Google Drive
         */
        async deleteFromGoogleDrive(fileId, { accessToken, onComplete, onError } = {}) {
            try {
                const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: 'Bearer ' + accessToken
                    }
                });
                if (res.ok) {
                    if (onComplete) onComplete();
                } else {
                    throw new Error(`Delete from Google Drive failed: ${res.statusText}`);
                }
            } catch (err) {
                console.error(err);
                if (onError) onError(err);
            }
        },

        /**
         * Delete a video from YouTube
         */
        async deleteFromYouTube(videoId, { accessToken, onComplete, onError } = {}) {
            try {
                const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: 'Bearer ' + accessToken
                    }
                });
                if (res.status === 204 || res.ok) {
                    if (onComplete) onComplete();
                } else if (res.status === 404) {
                    console.warn(`YouTube video ${videoId} was already unavailable while deleting.`);
                    if (onComplete) onComplete();
                } else {
                    let errorMessage = res.statusText;
                    try {
                        const errorData = await res.json();
                        errorMessage = errorData?.error?.message || errorMessage;
                    } catch (e) { }
                    throw new Error(`Delete from YouTube failed: ${errorMessage}`);
                }
            } catch (err) {
                console.error(err);
                if (onError) onError(err);
            }
        },

        async waitUntilVideoReady(videoId, accessToken, maxWaitMs = 300000, onStatus = null) {
            const start = Date.now();
            const checkInterval = 5000; // mỗi 5 giây check 1 lần
            let emptyResultCount = 0;

            while (Date.now() - start < maxWaitMs) {
                const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=status,processingDetails&id=${videoId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                if (!res.ok) throw new Error('Lỗi khi kiểm tra trạng thái xử lý video');
                const data = await res.json();

                if (!data.items || data.items.length === 0) {
                    emptyResultCount += 1;
                    if (onStatus) onStatus(`Đang chờ YouTube ghi nhận video (${emptyResultCount})...`);
                    console.log('🔄 YouTube chưa trả về video theo id:', videoId);
                    await new Promise(resolve => setTimeout(resolve, checkInterval));
                    continue;
                }

                const video = data.items[0];
                const processingStatus = video.processingDetails?.processingStatus;
                const uploadStatus = video.status?.uploadStatus;
                console.log('🔄 Trạng thái xử lý:', { processingStatus, uploadStatus });
                if (onStatus) onStatus('Đang chờ YouTube xử lý video...');

                if (processingStatus === 'succeeded' || uploadStatus === 'processed') {
                    return true; // Đã xử lý xong
                }
                if (['failed', 'rejected', 'deleted'].includes(processingStatus) || ['failed', 'rejected', 'deleted'].includes(uploadStatus)) {
                    throw new Error(`❌ Video xử lý thất bại: ${processingStatus || uploadStatus}`);
                }
                await new Promise(resolve => setTimeout(resolve, checkInterval)); // đợi 5 giây
            }
            throw new Error('⏳ Quá thời gian chờ YouTube xử lý hoặc chưa tìm thấy video. Vui lòng kiểm tra quyền token/kênh YouTube.');
        }
    };

    // Expose to global window scope
    window.UploadManager = UploadManager;
})();
