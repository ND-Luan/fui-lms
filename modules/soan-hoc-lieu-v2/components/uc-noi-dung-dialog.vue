<!-- === uc-noi-dung-dialog (Flow mới) === -->
<template>
	<v-dialog :model-value="isOpen" @update:modelValue="closeDialog" max-width="900px" persistent :retain-focus="false">
		<v-card>
			<v-card-title class="d-flex justify-space-between align-center">
				<span class="text-h5">{{ formTitle }}</span>
				<v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
			</v-card-title>
			<v-divider></v-divider>
			<v-card-text v-if="editableItem">
				<v-container>
					<v-row>
						<v-col cols="12">
							<v-text-field v-model="editableItem.TenNoiDung" label="Tên mục*" variant="outlined"
								density="compact" autofocus />
						</v-col>
						<v-col cols="12" sm="6">
							<v-select v-model="editableItem.LoaiNoiDung" :items="loaiHocLieuOptions"
								label="Loại nội dung*" variant="outlined" item-title="title" item-value="value"
								density="compact" />
						</v-col>
						<v-col cols="12" sm="6">
							<v-text-field v-model.number="editableItem.ThuTu" label="Thứ tự" type="number"
								variant="outlined" density="compact" />
						</v-col>
					</v-row>


					<!-- VÙNG SOẠN THẢO NỘI DUNG ĐỘNG -->
					<div class="mt-4">
						<label class="form-label">Nội dung chi tiết</label>


						<!-- 1. Nếu là QUIZ -->
						<uc-quiz-editor v-if="isQuiz" v-model:loai-noi-dung="editableItem.LoaiNoiDung"
							v-model="editableItem.DataJson" />


						<!-- 2. Nếu là VIDEO hoặc AUDIO -->
						<div v-else-if="isVideo">
							<v-row>
								<v-col cols="12">
									<v-file-input accept="video/*" label="Tải tập tin"
										@update:modelValue="uploadFileYoutube" />
									<!-- <f-file-upload :url="vueData.v_Set.apiFile" label="Tải tập tin lên"
										@update:modelValue="(file) => editableItem.DataJson.url = file.Files[0].FILE_URL + '/' + file.Files[0].FILE_NAME "
										:filters="filters" color="primary" variant="tonal" /> -->
								</v-col>
								<v-col cols="12">
									<v-text-field label="Đường dẫn (URL)" v-model="editableItem.DataJson.url"
										variant="outlined" density="compact"
										placeholder="https://www.youtube.com/watch?v=..."></v-text-field>
								</v-col>
							</v-row>
						</div>
						<div v-else-if="isAudio">
							<v-row>
								<v-col cols="12">
									<v-file-input accept="audio/*" label="Tải tập tin"
										@update:modelValue="uploadFileGGDrive" />
									<!-- <f-file-upload :url="vueData.v_Set.apiFile" label="Tải tập tin lên"
																@update:modelValue="(file) => editableItem.DataJson.url = file.Files[0].FILE_URL + '/' + file.Files[0].FILE_NAME "
																:filters="filters" color="primary" variant="tonal" /> -->
								</v-col>
								<v-col cols="12">
									<v-text-field label="Đường dẫn (URL)" v-model="editableItem.DataJson.url"
										variant="outlined" density="compact"
										placeholder="https://www.youtube.com/watch?v=..."></v-text-field>
								</v-col>
							</v-row>
						</div>
						<!-- 3. Nếu là HTML (cần trình soạn thảo Rich Text) -->
						<div v-else-if="isHtml" class="html-editor-wrapper">
							<!-- Tab Navigation -->
							<v-tabs v-model="activeTab" class="editor-tabs" density="compact" color="primary">
								<v-tab value="rich">
									<v-icon start>mdi-format-text-variant</v-icon>
									Văn bản
								</v-tab>
								<v-tab value="html">
									<v-icon start>mdi-code-tags</v-icon>
									Nhúng HTML
								</v-tab>
							</v-tabs>

							<!-- Tab Content -->
							<v-tabs-window v-model="activeTab" class="editor-content">
								<!-- Tab 1: F-Editor (Rich Text) -->
								<v-tabs-window-item value="rich" class="tab-content">
									<f-editor :imageapi="vueData.v_Set.apiImageAdapter" v-model="textContent"
										label="Nội dung văn bản" variant="outlined" :height="400" />
								</v-tabs-window-item>

								<!-- Tab 2: Raw HTML -->
								<v-tabs-window-item value="html" class="tab-content">
									<v-card>
										<v-card-text>
											<v-textarea v-model="htmlContent" label="Mã HTML" variant="outlined"
												auto-grow rows="20" placeholder="Nhập mã HTML tại đây..." />
										</v-card-text>
									</v-card>
								</v-tabs-window-item>
							</v-tabs-window>
						</div>
						<div v-else-if="isSlide">
							<v-file-input accept=".doc,.docx,.ppt,.pptx,.pdf" label="Tải tập tin"
								@update:modelValue="uploadFileGGDrive" />
							<!-- <f-file-upload :url="vueData.v_Set.apiFile" label="Tải tập tin lên" :filters="filters"
								@update:modelValue="(file) => onUploadFile(file)" color="primary" variant="tonal" /> -->
							<v-chip v-if="Object.keys(editableItem.DataJson).length > 0">
								{{editableItem.DataJson.fileName}} <v-icon @click.stop="onCloseFile"> mdi-close</v-icon>
							</v-chip>
						</div>

						<!-- 4. Nếu là ISPRING_CONTENT -->
						<div v-else-if="isISpring" class="ispring-upload-wrapper">
							<div class="ispring-header">
								<v-icon color="purple" class="mr-2">mdi-play-box-multiple</v-icon>
								<span class="text-h6">iSpring Content Upload</span>
							</div>

							<!-- Nếu chưa có content -->
							<div v-if="!editableItem.DataJson.iSpringURL" class="ispring-upload-zone">
								<div class="upload-zone" @click="$refs.iSpringInput.click()" @dragover.prevent
									@drop.prevent="handleiSpringDrop">
									<v-icon size="48" color="purple" class="mb-3">mdi-folder-upload</v-icon>
									<h4>Upload iSpring Content</h4>
									<p>Kéo thả folder iSpring vào đây hoặc click để chọn</p>
									<v-btn color="purple" variant="outlined" class="mt-2">
										📁 Chọn Folder
									</v-btn>
								</div>

								<input ref="iSpringInput" type="file" style="display: none;" webkitdirectory multiple
									@change="handleiSpringUpload">

								<!-- Progress upload -->
								<div v-if="uploadProgress.show" class="upload-progress mt-4">
									<v-progress-linear v-model="uploadProgress.percent" color="purple" height="8"
										rounded></v-progress-linear>
									<p class="text-center mt-2">{{ uploadProgress.text }}</p>
								</div>
							</div>

							<!-- Nếu đã có content -->
							<div v-else class="ispring-existing">
								<v-alert type="success" variant="tonal" class="mb-3">
									<v-icon>mdi-check-circle</v-icon>
									iSpring content đã được upload thành công!
								</v-alert>

								<div class="ispring-info">
									<p><strong>GUID:</strong> {{ editableItem.DataJson.iSpringGUID }}</p>
									<p><strong>URL:</strong>
										<a :href="editableItem.DataJson.iSpringURL" target="_blank" class="text-purple">
											{{ editableItem.DataJson.iSpringURL }}
										</a>
									</p>
								</div>

								<div class="ispring-actions mt-3">
									<v-btn color="purple" variant="outlined" :href="editableItem.DataJson.iSpringURL"
										target="_blank">
										<v-icon start>mdi-eye</v-icon>
										Xem trước
									</v-btn>
									<v-btn color="error" variant="outlined" @click="removeiSpringContent" class="ml-2">
										<v-icon start>mdi-delete</v-icon>
										Xóa & Upload lại
									</v-btn>
								</div>
							</div>
						</div>
					</div>
				</v-container>
			</v-card-text>


			<v-divider></v-divider>
			<v-card-actions class="pa-4">
				<v-spacer></v-spacer>
				<v-btn color="grey-darken-1" variant="text" @click="closeDialog">Hủy</v-btn>
				<v-btn color="primary" variant="flat" @click="save">Lưu</v-btn>
			</v-card-actions>
		</v-card>
		<uc-loading-page v-model="loadingPage.isLoading" :text="loadingPage.text" />
	</v-dialog>
</template>


<script>
	export default {
		name: 'uc-noi-dung-dialog',
		props: ['isOpen', 'item'],
		emits: ['update:isOpen', 'save'],
		data() {
			return {
				editableItem: null,
				loaiHocLieuOptions: [
	
					{ value: 'CHUONG', title: 'Chương' },
					{ value: 'BAI', title: 'Bài' },
					{ value: 'NHOM_KY_NANG', title: 'Nhóm kỹ năng' },
					{ value: 'VIDEO', title: 'Video' },
					{ value: 'AUDIO', title: 'Audio' },
					{ value: 'HTML', title: 'HTML' },
	
					{ value: 'SLIDE', title: 'PPT, DOC & PDF' },
	
					{ value: 'QUIZ_SINGLE_CHOICE', title: 'Trắc nghiệm đơn' },
					{ value: 'QUIZ_MULTIPLE_CHOICE', title: 'Trắc nghiệm đa lựa chọn' },
					{ value: 'QUIZ_MATCHING', title: 'Ghép cặp' },
					{ value: 'QUIZ_ORDERING', title: 'Sắp xếp thứ tự' },
					{ value: 'QUIZ_DRAG_DROP_CATEGORIZE', title: 'Kéo thả phân loại' },
					{ value: 'QUIZ_FILL_IN_BLANK', title: 'Điền từ' },
					{ value: 'QUIZ_CONNECTION', title: 'Nối nhóm' },
					{ value: 'QUIZ_TRUE_FALSE', title: 'Đúng sai' },
					{ value: 'QUIZ_COMPOSITE', title: 'Bài thi' },
					{ value: 'ISPRING_CONTENT', title: 'ISpring' }
	
				],
				vueData,
				filters: {
					max_file_size: '50mb',
					chunk_size: '4mb',
					mime_types: [{ title: "All files", extensions: "*" }]
				},
				activeTab: 'rich', // Tab mặc định là 'rich',
	
				uploadProgress: {
					show: false,
					percent: 0,
					text: ''
				},
				loadingPage: {
					text: "Đang tải dữ liệu...",
					isLoading: false
				}
			};
		},
		computed: {
			formTitle() { return this.item && this.item.NoiDungID ? 'Cập nhật mục' : 'Thêm mục mới'; },
			isQuiz() { return this.editableItem?.LoaiNoiDung?.startsWith('QUIZ'); },
			isVideo() { return ['VIDEO', 'TAILIEU'].includes(this.editableItem?.LoaiNoiDung); },
			isAudio() { return ['AUDIO'].includes(this.editableItem?.LoaiNoiDung); },
			isHtml() { return ['HTML', 'INTERACTIVE', 'READING'].includes(this.editableItem?.LoaiNoiDung); },
			isSlide() { return ['SLIDE'].includes(this.editableItem?.LoaiNoiDung) },
			isISpring() { return this.editableItem?.LoaiNoiDung === 'ISPRING_CONTENT'; },
			htmlContent: {
				get() {
					console.log('gethtmlContent', this.editableItem.DataJson)
					// KHI HIỂN THỊ: Lấy giá trị từ object và trả về chuỗi
					if (this.editableItem && this.editableItem.DataJson) {
						// Nếu là object, lấy thuộc tính htmlContent, nếu không thì lấy chính nó
						return this.editableItem.DataJson.htmlContent || '';
					}
					return '';
				},
				set(newValue) {
					console.log('set htmlContent', newValue)
					// KHI NHẬP LIỆU: Cập nhật lại object DataJson
					if (this.editableItem) {
						// Luôn đảm bảo DataJson là một object
						if (typeof this.editableItem.DataJson !== 'object' || this.editableItem.DataJson === null) {
							this.editableItem.DataJson = {};
						}
						this.editableItem.DataJson.htmlContent = newValue;
						this.editableItem.DataJson.isType = this.activeTab;
					}
				}
			},
			textContent: {
				get() {
					console.log('get textContent', this.editableItem.DataJson)
					// KHI HIỂN THỊ: Lấy giá trị từ object và trả về chuỗi
					if (this.editableItem && this.editableItem.DataJson) {
						// Nếu là object, lấy thuộc tính htmlContent, nếu không thì lấy chính nó
						return this.editableItem.DataJson.textContent || '';
					}
					return '';
				},
				set(newValue) {
					console.log('set textContent', newValue)
					// KHI NHẬP LIỆU: Cập nhật lại object DataJson
					if (this.editableItem) {
						// Luôn đảm bảo DataJson là một object
						if (typeof this.editableItem.DataJson !== 'object' || this.editableItem.DataJson === null) {
							this.editableItem.DataJson = {};
						}
						this.editableItem.DataJson.textContent = newValue;
						this.editableItem.DataJson.isType = this.activeTab;
					}
				}
			}
		},
		watch: {
			isOpen(newVal) {
				if (newVal) {
					// Khi mở, sao chép và parse dữ liệu
					const initialData = JSON.parse(JSON.stringify(this.item || {}));
					// Luôn đảm bảo DataJson là một object
					if (initialData.DataJson && typeof initialData.DataJson === 'string') {
						try {
							initialData.DataJson = JSON.parse(initialData.DataJson);
						}
						catch (e) {
							// Nếu không phải JSON, coi nó là HTML thô
							initialData.DataJson = {
								htmlContent: initialData.DataJson ?? '',
								textContent: '',
								isType: 'html'
							};
						}
					} else if (!initialData.DataJson) {
						initialData.DataJson = {};
					}
					console.log('initialData', initialData)
					this.editableItem = initialData;
				}
			}
		},
		methods: {
			async uploadFileGGDrive(file) {
				if (!file) return
				this.loadingPage.isLoading = true
				this.loadingPage.text = "Đang tải dữ liệu..."
				console.log('file', file)
	
				//Lấy Token từ câu gọi Youtube 
				const { access_token } = await this.ajaxCALLPromise('lms/FP_Youtube_Token_Get')
	
				this.loadingPage.text = "Đang tìm kiếm folder..."
				const folderId = await this.ensureFolderPathExists(`${this.item.TenHocLieu}/${vueData.user.UserID}`, access_token);
	
				const metadata = {
					name: file.name,
					mimeType: file.type,
					parents: [folderId],
				};
	
				const form = new FormData();
				form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
				form.append('file', file);
	
				this.loadingPage.text = "Đang upload..."
				const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
					method: 'POST',
					headers: new Headers({ Authorization: 'Bearer ' + access_token }),
					body: form,
				});
	
				const fileDrive = await res.json();
	
				this.loadingPage.text = "Đang cấp quyền file..."
				//Cấp quyền cho file được công khai
				const reponse_permision = await fetch(`https://www.googleapis.com/drive/v3/files/${fileDrive?.id}/permissions`, {
					method: 'POST',
					headers: {
						Authorization: 'Bearer ' + access_token
					},
					body: JSON.stringify({
						role: 'reader', // Quyền xem
						type: 'anyone', // Bất kỳ ai
					}),
				});
	
				//Khi cập nhật permision xong thì lưu lại vào trong json editableItem
				if (reponse_permision.ok) {
					let contentType = ''
					if (file.type === 'application/pdf') contentType = 'PDF'
					if (file.type === 'application/msword'
						|| file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
					) contentType = 'DOCX'
	
					if (file.type === 'application/vnd.ms-powerpoint'
						|| file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
					) contentType = 'PPT'
	
					if (this.editableItem.LoaiNoiDung === 'AUDIO') this.editableItem.DataJson.mediaType = 'audio'
					else this.editableItem.DataJson.slideType = contentType
	
					this.editableItem.DataJson.title = file.name
					this.editableItem.DataJson.fileName = file.name
					this.editableItem.DataJson.url = `https://drive.google.com/file/d/${fileDrive.id}/preview`
	
					this.loadingPage.isLoading = false
				}
			},
			async getOrCreateFolderId(folderName, parentId = 'root', access_token) {
				const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`;
	
				const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`, {
					headers: {
						Authorization: `Bearer ${access_token}`,
					},
				});
	
				const data = await res.json();
				if (data.files.length > 0) return data.files[0].id;
	
				// ⛏️ Nếu không có, tạo thư mục
				const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${access_token}`,
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
			async ensureFolderPathExists(path, access_token) {
				const parts = path.split('/');
				let parentId = 'root';
	
				for (const part of parts) {
					parentId = await this.getOrCreateFolderId(part, parentId, access_token);
				}
	
				return parentId; // Trả về folder cuối cùng
			},
			async uploadFileYoutube(file) {
				if (!file) return;
	
				this.loadingPage.isLoading = true
				this.loadingPage.text = "Đang tải dữ liệu..."
	
				const { access_token } = await this.ajaxCALLPromise('lms/FP_Youtube_Token_Get')
				const playLists = await this.ajaxCALLPromise('lms/FP_Youtube_PlayList_Get', { Access_Token: access_token })
	
				console.log('playLists', playLists)
	
				let playListCurrent = playLists?.find(x => x.Title === this.item?.TenHocLieu)
				if (!playListCurrent) {
					const response = await this.ajaxCALLPromise('lms/FP_Youtube_PlayList_Ins', {
						TenPlayList: this.item?.TenHocLieu, Access_Token: access_token
					})
					playListCurrent = response[0] //khi insert xong API trả về ID mới
				}
	
				const url =
					'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status,contentDetails';
	
				const accessToken = access_token;
				const xUploadContentLength = file.size; // ví dụ 3MB
				const xUploadContentType = file.type; // hoặc 'video/mp4'
	
				const body = {
					snippet: {
						title: file.name,
						description: '',
						tags: [],
						categoryId: '27'
					},
					status: {
						privacyStatus: 'unlisted',
						selfDeclaredMadeForKids: true
					}
				};
	
				this.loadingPage.text = 'Đang tiếp tục tải lên...'
				//Tạo Resumable
				const response_Resumable = await fetch(url, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${accessToken}`,
						'Content-Type': 'application/json; charset=UTF-8',
						'X-Upload-Content-Length': xUploadContentLength.toString(),
						'X-Upload-Content-Type': xUploadContentType
					},
					body: JSON.stringify(body)
				})
				if (!response_Resumable.ok) throw new Error('Upload session initiation failed');
				const uploadUrl = response_Resumable.headers.get('Location'); // URL để upload phần video
	
				this.loadingPage.text = 'Đang upload...'
				//Upload Video
				const response_file = await fetch(uploadUrl, {
					method: "PUT",
					headers: {
						'Authorization': `Bearer ${accessToken}`,
						'Content-Length': xUploadContentLength,
						'Content-Type': xUploadContentType
					},
					body: file
				})
	
				if (!response_file.ok) throw new Error(`Lỗi khi upload video: ${response_file.statusText}`);
	
				const videoResult = await response_file.json();
				const youtubeUrl = `https://www.youtube.com/watch?v=${videoResult.id}`;
				console.log('🎉 Upload thành công:', youtubeUrl);
	
				this.loadingPage.text = 'Đang cập nhật video vào danh sách phát....'
				//Cập nhật lại PlayList vào video
				const response_playList = await fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${access_token}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						snippet: {
							playlistId: playListCurrent?.PlaylistID,
							resourceId: {
								kind: 'youtube#video',
								videoId: videoResult.id
							}
						}
					})
				})
				this.loadingPage.text = 'Đang chờ youtube xử lý (có thể mất 2 - 5p)...'
				//Sau khi xử lý xong video thì kiểm tra video đã được upload completed lên chưa
				const isCompleted = await this.waitUntilVideoReady(videoResult.id, access_token)
				if (isCompleted) {
					//Xử lý tiếp theo
					this.loadingPage.isLoading = false
					this.editableItem.DataJson.url = youtubeUrl
				}
	
			},
			async waitUntilVideoReady(videoId, accessToken, maxWaitMs = 300000) {
				const start = Date.now();
				const checkInterval = 5000; // mỗi 5 giây check 1 lần
	
				while (Date.now() - start < maxWaitMs) {
					const res = await
						fetch(`https://www.googleapis.com/youtube/v3/videos?part=processingDetails&id=${videoId}`, {
							headers: {
								Authorization: `Bearer ${accessToken}`
							}
						});
					if (!res.ok) throw new Error('Lỗi khi kiểm tra trạng thái xử lý video');
					const data = await res.json();
					const status = data.items?.[0]?.processingDetails?.processingStatus;
					console.log('🔄 Trạng thái xử lý:', status);
					if (status === 'succeeded') {
						return true; // Đã xử lý xong 
					}
					if (status === 'failed' || status === 'rejected') { throw new Error(`❌ Video xử lý thất bại: ${status}`); }
					await new Promise(resolve => setTimeout(resolve, checkInterval)); // đợi 5 giây
				}
				throw new Error('⏳ Quá thời gian chờ xử lý video');
			},
			ajaxCALLPromise(url, params = null) {
				return new Promise(resolve => {
					ajaxCALL(url, params, res => {
						if (res?.data) { resolve(res.data) }
						else { resolve(res) }
					})
				})
			},
			onUploadFile(file) {
				const _file = file.Files[0]
				let contentType = ''
				if (_file.FILE_CONTENTTYPE === 'application/pdf') contentType = 'PDF'
				if (_file.FILE_CONTENTTYPE === 'application/msword'
					|| _file.FILE_CONTENTTYPE === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
				) contentType = 'DOCX'
	
				if (_file.FILE_CONTENTTYPE === 'application/vnd.ms-powerpoint'
					|| _file.FILE_CONTENTTYPE === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
				) contentType = 'PPT'
	
				this.editableItem.DataJson.slideType = contentType
				this.editableItem.DataJson.title = _file.FILE_NAME
				this.editableItem.DataJson.fileName = _file.FILE_NAME
				this.editableItem.DataJson.url = _file.FILE_URL
			},
			onCloseFile(e) {
				this.editableItem.DataJson = {}
			},
			closeDialog() { this.$emit('update:isOpen', false); },
			save() {
				// "Đóng gói" lại DataJson thành chuỗi trước khi lưu
				const dataToSave = JSON.parse(JSON.stringify(this.editableItem));
				if (dataToSave.DataJson) {
					// Nếu là HTML, nhưng DataJson chỉ có mỗi htmlContent, thì chỉ lưu chuỗi đó thôi
					if (this.isHtml && dataToSave.DataJson.htmlContent && Object.keys(dataToSave.DataJson).length === 1) {
						dataToSave.DataJson = dataToSave.DataJson.htmlContent;
					} else {
						// Các trường hợp khác thì stringify cả object
						dataToSave.DataJson = JSON.stringify(dataToSave.DataJson);
					}
				}
				this.$emit('save', dataToSave);
				this.closeDialog();
			},
	
			//API github
			handleiSpringDrop(event) {
				event.preventDefault();
				const files = Array.from(event.dataTransfer.files);
				this.processiSpringFiles(files);
			},
	
			handleiSpringUpload(event) {
				const files = Array.from(event.target.files);
				this.processiSpringFiles(files);
			},
	
			async processiSpringFiles(files) {
				// Lấy tên thư mục gốc từ file đầu tiên
				const firstFile = files[0];
				const relativePath = firstFile.webkitRelativePath || firstFile.name;
				const folderName = relativePath.split('/')[0]; // Tên thư mục gốc
	
				console.log('📁 Detected folder name:', folderName);
				console.log('📁 URL encoded:', encodeURIComponent(folderName));
	
				// Validate iSpring structure
				const hasIndex = files.some(f => f.name === 'index.html');
				if (!hasIndex) {
					alert('❌ Không tìm thấy file index.html trong folder iSpring!');
					return;
				}
	
				const iSpringGUID = this.generateGUID();
	
				this.uploadProgress.show = true;
				this.uploadProgress.percent = 0;
				this.uploadProgress.text = 'Đang chuẩn bị upload...';
	
				try {
					const result = await this.uploadToGitHub(files, iSpringGUID);
	
					// URL với tên folder encode
					const encodedFolderName = encodeURIComponent(folderName);
					const finalURL = `https://thientamlhu.github.io/lhbs.lms/content/${iSpringGUID}/${encodedFolderName}/index.html`;
	
					this.editableItem.DataJson = {
						iSpringGUID: iSpringGUID,
						iSpringURL: finalURL,           // URL đã encode
						folderName: folderName,         // Tên gốc
						encodedFolderName: encodedFolderName, // Tên đã encode
						uploadDate: new Date().toISOString(),
						totalFiles: files.length
					};
	
					console.log('✅ Final URL:', finalURL);
	
					this.uploadProgress.text = '✅ Upload thành công!';
	
					// Test URL sau khi upload
					setTimeout(async () => {
						const isAvailable = await this.testURL(finalURL);
						if (isAvailable) {
							alert(`✅ Upload và deploy thành công!\n\nURL: ${finalURL}`);
						} else {
							alert(`⏳ Upload thành công! Đang chờ GitHub Pages deploy...\n\nURL: ${finalURL}\n\n(Có thể cần đợi 2-5 phút)`);
						}
					}, 3000);
	
					setTimeout(() => {
						this.uploadProgress.show = false;
					}, 2000);
	
				} catch (error) {
					console.error('❌ Upload error:', error);
					this.uploadProgress.text = '❌ Upload thất bại: ' + error.message;
					alert('❌ Upload thất bại: ' + error.message);
	
					setTimeout(() => {
						this.uploadProgress.show = false;
					}, 3000);
				}
			},
	
			async uploadToGitHub(files, guid, folderName) {
				const GITHUB_TOKEN = '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'; // Cần config
				const REPO_OWNER = 'thientamlhu';
				const REPO_NAME = 'lhbs.lms';
	
				const total = files.length;
				let completed = 0;
	
				for (const file of files) {
					try {
						// Convert to base64
						const base64Content = await this.fileToBase64(file);
	
						// Determine file path
						const relativePath = file.webkitRelativePath || file.name;
						const filePath = `content/${guid}/${relativePath}`;
	
						// Upload single file
						await this.uploadSingleFile(GITHUB_TOKEN, REPO_OWNER, REPO_NAME, filePath, base64Content, file.name);
	
						completed++;
						this.uploadProgress.percent = Math.round((completed / total) * 100);
						this.uploadProgress.text = `Đang upload ${completed}/${total} files...`;
	
						// Rate limiting
						await new Promise(resolve => setTimeout(resolve, 200));
	
					} catch (error) {
						console.error(`Failed to upload ${file.name}:`, error);
					}
				}
	
				// Return URL
				const url = `https://thientamlhu.github.io/lhbs.lms/content/${guid}/${folderName}/index.html`;
				return { url, guid };
			},
	
			fileToBase64(file) {
				return new Promise((resolve, reject) => {
					const reader = new FileReader();
					reader.onload = () => {
						const base64 = reader.result.split(',')[1];
						resolve(base64);
					};
					reader.onerror = reject;
					reader.readAsDataURL(file);
				});
			},
	
			async uploadSingleFile(token, owner, repo, path, content, fileName) {
				const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
					method: 'PUT',
					headers: {
						'Authorization': `token ${token}`,
						'Accept': 'application/vnd.github.v3+json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						message: `Upload ${fileName}`,
						content: content,
						branch: 'main'
					})
				});
	
				if (!response.ok) {
					const error = await response.json();
					throw new Error(error.message || 'Upload failed');
				}
	
				return response.json();
			},
	
			generateGUID() {
				return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
					const r = Math.random() * 16 | 0;
					const v = c == 'x' ? r : (r & 0x3 | 0x8);
					return v.toString(16);
				});
			},
	
			removeiSpringContent() {
				this.editableItem.DataJson = {};
				this.$refs.iSpringInput.value = '';
			}
		}
	}
</script>


<style scoped>
	.form-label {
		font-weight: 500;
		margin-bottom: 8px;
		display: block;
	}

	.html-editor-wrapper {
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.editor-tabs {
		border-bottom: 1px solid #eee;
	}

	.editor-content {
		min-height: 400px;
	}

	.tab-content {
		padding: 16px;
	}

	/* Thêm vào <style scoped>
		*/
	.ispring-upload-wrapper {
		border: 2px solid #9c27b0;
		border-radius: 8px;
		padding: 20px;
		background: #fafafa;
	}

	.ispring-header {
		display: flex;
		align-items: center;
		margin-bottom: 20px;
		color: #9c27b0;
	}

	.upload-zone {
		border: 3px dashed #9c27b0;
		border-radius: 12px;
		padding: 40px 20px;
		text-align: center;
		background: white;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.upload-zone:hover {
		border-color: #7b1fa2;
		background: #f3e5f5;
	}

	.upload-zone.dragover {
		border-color: #4a148c;
		background: #e1bee7;
		transform: scale(1.02);
	}

	.ispring-existing {
		background: white;
		padding: 20px;
		border-radius: 8px;
	}

	.ispring-info {
		background: #f5f5f5;
		padding: 15px;
		border-radius: 6px;
		font-family: monospace;
		font-size: 0.9em;
	}

	.upload-progress {
		background: white;
		padding: 15px;
		border-radius: 6px;
	}

	/* Thêm vào CSS */
	.lh-ispring-slide {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		background: #f8f9fa;
	}

	.lh-ispring-icon {
		margin-right: 8px;
		font-size: 1.2em;
	}

	.lh-ispring-content {
		flex: 1;
		position: relative;
		min-height: 600px;
	}

	.lh-ispring-iframe {
		width: 100%;
		height: 600px;
		border: none;
		border-radius: 8px;
		background: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.lh-external-btn {
		position: absolute;
		top: 15px;
		right: 60px;
		width: 40px;
		height: 40px;
		border: none;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		z-index: 10;
	}

	.lh-external-btn:hover {
		background: rgba(0, 0, 0, 0.9);
		transform: scale(1.1);
	}

	.lh-iframe-loading {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		z-index: 5;
	}

	.lh-loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #f3f3f3;
		border-top: 4px solid #667eea;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 16px;
	}

	.lh-loading-text {
		color: #666;
		font-size: 0.9em;
	}

	.lh-ispring-error,
	.lh-ispring-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 400px;
		text-align: center;
		background: white;
		border-radius: 8px;
		border: 2px dashed #ddd;
	}

	.lh-error-icon,
	.lh-placeholder-icon {
		font-size: 4em;
		margin-bottom: 20px;
	}

	.lh-ispring-error h3,
	.lh-ispring-placeholder h3 {
		margin-bottom: 10px;
		color: #333;
	}

	.lh-ispring-error p,
	.lh-ispring-placeholder p {
		color: #666;
		margin-bottom: 20px;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.lh-ispring-iframe {
			height: 450px;
		}

		.lh-slide-header {
			padding: 12px 16px;
		}

		.lh-slide-title {
			font-size: 1.3em;
		}
	}
</style>