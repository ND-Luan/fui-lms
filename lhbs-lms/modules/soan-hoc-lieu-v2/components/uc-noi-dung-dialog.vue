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
									<v-file-input accept="video/*" label="Tải video"
										@update:modelValue="uploadFileYoutube" />
									<!-- <f-file-upload :url="vueData.v_Set.apiFile" label="Tải tập tin lên"
										@update:modelValue="(file) => editableItem.DataJson.url = file.Files[0].FILE_URL + '/' + file.Files[0].FILE_NAME "
										:filters="filters" color="primary" variant="tonal" /> -->
								</v-col>
								<v-col cols="12">
									<v-alert type="info" variant="tonal">
										Video được phát hành qua YouTube và tự động lưu một bản kiểm tra trong LMS.
									</v-alert>
								</v-col>
							</v-row>
						</div>
						<div v-else-if="isAudio">
							<v-row>
								<v-col cols="12">
									<v-file-input accept="audio/*" label="Tải audio"
										@update:modelValue="uploadFileGGDrive" />
									<!-- <f-file-upload :url="vueData.v_Set.apiFile" label="Tải tập tin lên"
																@update:modelValue="(file) => editableItem.DataJson.url = file.Files[0].FILE_URL + '/' + file.Files[0].FILE_NAME "
																:filters="filters" color="primary" variant="tonal" /> -->
								</v-col>
								<v-col cols="12">
									<v-alert type="info" variant="tonal">
										Audio được phát hành qua Google Drive và tự động lưu một bản kiểm tra trong LMS.
									</v-alert>
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
								<!-- Tab 1: F-Editor (Rich Text) với tích hợp GeoGebra -->
								<v-tabs-window-item value="rich" class="tab-content">
									<uc-ggb-editor :imageapi="vueData.v_Set.apiImageAdapter" v-model="textContent"
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
							<v-file-input accept=".doc,.docx,.ppt,.pptx,.pdf" label="Tải tài liệu"
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
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
		props: {
			isOpen: Boolean,
			item: Object,
			resourceContext: {
				type: Object,
				default: () => ({}),
			},
		},
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
			notify(message, color = 'success') {
				this.snackbarRef?.value?.showSnackbar?.({ message, color });
			},
			buildSavePayload(item, fallbackItem = this.editableItem) {
				const payload = { ...(item || {}) };
				const fallback = fallbackItem || {};

				payload.HocLieuID = payload.HocLieuID ?? fallback.HocLieuID ?? this.item?.HocLieuID;
				payload.ParentID = payload.ParentID ?? fallback.ParentID ?? 0;
				payload.LoaiNoiDung = payload.LoaiNoiDung ?? fallback.LoaiNoiDung;
				payload.TenNoiDung = payload.TenNoiDung ?? fallback.TenNoiDung ?? '';
				payload.ThuTu = Number.isFinite(Number(payload.ThuTu))
					? Number(payload.ThuTu)
					: (Number.isFinite(Number(fallback.ThuTu)) ? Number(fallback.ThuTu) : 0);

				return payload;
			},
			ensureDataJsonObject(item) {
				if (!item) return {};
				if (item.DataJson && typeof item.DataJson === 'object') return item.DataJson;

				try {
					item.DataJson = item.DataJson ? JSON.parse(item.DataJson) : {};
				} catch (e) {
					item.DataJson = {};
				}

				return item.DataJson;
			},
			getUploadManager() {
				if (!window.UploadManager) {
					this.notify("UploadManager chưa được khởi tạo.", "error");
					return null;
				}
				return window.UploadManager;
			},
			getSlideContentType(fileType) {
				if (fileType === 'application/pdf') return 'PDF';
				if (fileType === 'application/msword'
					|| fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
				) return 'DOCX';
				if (fileType === 'application/vnd.ms-powerpoint'
					|| fileType === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
				) return 'PPT';
				return '';
			},
			async ensureDraftNode(file) {
				const targetItem = this.editableItem;
				if (targetItem.NoiDungID) return true;

				const draftItem = this.buildSavePayload({
					HocLieuID: targetItem.HocLieuID,
					ParentID: targetItem.ParentID || 0,
					LoaiNoiDung: targetItem.LoaiNoiDung,
					TenNoiDung: targetItem.TenNoiDung || file.name,
					ThuTu: targetItem.ThuTu,
					DataJson: JSON.stringify({}),
				}, targetItem);
				const result = await fetchPromise('lms/FP_NoiDung_Save', draftItem, { cache: false });
				const saved = Array.isArray(result) ? result[0] : result;
				if (!saved?.NoiDungID) {
					this.notify('Không thể tạo mục nháp để tải file.', 'error');
					return false;
				}

				Object.assign(targetItem, saved);
				this.ensureDataJsonObject(targetItem);
				this.$emit('update-item', saved);
				this.$emit('refresh-tree');
				return true;
			},
			buildLmsFileMetadata(uploaded, file, targetItem) {
				const contentType = uploaded.FILE_CONTENTTYPE || file.type || '';
				return {
					uploadSource: 'db',
					fileId: uploaded.FILE_ID,
					fileName: uploaded.FILE_NAME || file.name,
					contentType,
					fileSize: Number(uploaded.FILE_SIZE || file.size || 0),
					url: uploaded.FILE_URL || `/FileData/${uploaded.FILE_ID}`,
					title: uploaded.FILE_NAME || file.name,
					slideType: this.getSlideContentType(contentType),
					mediaType: targetItem.LoaiNoiDung === 'AUDIO' ? 'audio' : undefined,
					origin: 'HOC_LIEU',
					sourceHocLieuID: targetItem.HocLieuID,
					sourceNoiDungID: targetItem.NoiDungID,
				};
			},
			async saveUploadedFileToNode(targetItem, metadata) {
				const nodeDataList = await fetchPromise('lms/FP_NoiDung_GetDetail', {
					NoiDungID: targetItem.NoiDungID,
				});
				const nodeData = Array.isArray(nodeDataList) ? nodeDataList[0] : nodeDataList;
				if (!nodeData) throw new Error('Không tìm thấy mục nội dung vừa tạo.');

				nodeData.DataJson = JSON.stringify(metadata);
				await fetchPromise('lms/FP_NoiDung_Save', this.buildSavePayload(nodeData, targetItem), { cache: false });
			},
			async registerUploadedFileInResourceLibrary(targetItem, metadata) {
				await fetchPromise('lms/FP_TaiNguyen_File_Register', {
					KhoiID: this.resourceContext?.KhoiID ?? null,
					MonHocID: this.resourceContext?.MonHocID ?? null,
					TenNoiDung: metadata.fileName,
					LoaiNoiDung: targetItem.LoaiNoiDung,
					NguonTaiNguyenCode: metadata.origin || 'HOC_LIEU',
					NguonResourceType: 'HOC_LIEU',
					NguonResourceID: targetItem.HocLieuID,
					DataJson: JSON.stringify(metadata),
				}, { cache: false });
			},
			archiveFileToLmsInBackground(file, targetItem) {
				const uploadManager = this.getUploadManager();
				if (!uploadManager) return;

				uploadManager.uploadLmsFile(file, {
					onComplete: async response => {
						try {
							const uploaded = response?.Files?.[0];
							if (!uploaded?.FILE_ID) throw new Error('API lưu trữ không trả về FILE_ID.');

							const archiveMetadata = {
								...this.buildLmsFileMetadata(uploaded, file, targetItem),
								archivePurpose: 'AUDIT',
								publishSource: targetItem.LoaiNoiDung === 'VIDEO' ? 'youtube' : 'ggdrive',
							};
							await this.registerUploadedFileInResourceLibrary(targetItem, archiveMetadata);
							this.notify(`Đã lưu bản kiểm tra “${archiveMetadata.fileName}” vào kho LMS.`);
						} catch (error) {
							console.error('Background LMS archive failed:', error);
							this.notify(
								`Nội dung vẫn được phát hành, nhưng chưa lưu được bản kiểm tra của “${file.name}”.`,
								'warning'
							);
						}
					},
					onError: error => {
						console.error('Background LMS archive upload failed:', error);
						this.notify(
							`Nội dung vẫn tiếp tục phát hành, nhưng lưu nền “${file.name}” vào LMS thất bại.`,
							'warning'
						);
					},
				});
			},
			async savePublishedMetadata(targetItem, metadata) {
				targetItem.DataJson = metadata;
				await this.saveUploadedFileToNode(targetItem, metadata);
				this.$emit('refresh-tree');
			},
			async uploadFileGGDrive(file) {
				const selectedFile = Array.isArray(file) ? file[0] : file;
				if (!selectedFile) return;
				const uploadManager = this.getUploadManager();
				if (!uploadManager) return;
				const targetItem = this.editableItem;

				if (!await this.ensureDraftNode(selectedFile)) return;
				this.archiveFileToLmsInBackground(selectedFile, targetItem);
				this.notify(`Đang phát hành ${selectedFile.name} lên Google Drive...`, 'info');

				uploadManager.uploadLmsGoogleDrive(selectedFile, {
					folderPath: `${targetItem.TenHocLieu || this.item?.TenHocLieu || 'HocLieu'}/${vueData.user.UserID}`,
					onComplete: async fileDrive => {
						try {
							const metadata = {
								title: selectedFile.name,
								fileName: selectedFile.name,
								contentType: selectedFile.type || '',
								fileSize: Number(selectedFile.size || 0),
								uploadSource: 'ggdrive',
								driveFileId: fileDrive.id,
								url: `https://drive.google.com/file/d/${fileDrive.id}/preview`,
								slideType: this.getSlideContentType(selectedFile.type),
								mediaType: targetItem.LoaiNoiDung === 'AUDIO' ? 'audio' : undefined,
							};
							await this.savePublishedMetadata(targetItem, metadata);
							this.notify(`Đã phát hành “${selectedFile.name}” lên Google Drive.`);
						} catch (error) {
							console.error('Google Drive post-upload failed:', error);
							this.notify(error.message || 'Không thể hoàn tất phát hành Google Drive.', 'error');
						}
					},
					onError: error => this.notify(
						error?.message || `Phát hành ${selectedFile.name} lên Google Drive thất bại.`,
						'error'
					),
				});
			},
			async uploadFileYoutube(file) {
				const selectedFile = Array.isArray(file) ? file[0] : file;
				if (!selectedFile) return;
				const uploadManager = this.getUploadManager();
				if (!uploadManager) return;
				const targetItem = this.editableItem;

				if (!await this.ensureDraftNode(selectedFile)) return;
				this.archiveFileToLmsInBackground(selectedFile, targetItem);
				this.notify(`Đang phát hành ${selectedFile.name} lên YouTube...`, 'info');

				uploadManager.uploadLmsYoutube(selectedFile, {
					playlistName: targetItem.TenHocLieu || this.item?.TenHocLieu || 'HocLieu',
					title: selectedFile.name,
					onComplete: async videoResult => {
						try {
							const metadata = {
								title: selectedFile.name,
								fileName: selectedFile.name,
								contentType: selectedFile.type || 'video/*',
								fileSize: Number(selectedFile.size || 0),
								uploadSource: 'youtube',
								videoId: videoResult.id,
								url: videoResult.source,
							};
							await this.savePublishedMetadata(targetItem, metadata);
							this.notify(`Đã phát hành “${selectedFile.name}” lên YouTube.`);
						} catch (error) {
							console.error('YouTube post-upload failed:', error);
							this.notify(error.message || 'Không thể hoàn tất phát hành YouTube.', 'error');
						}
					},
					onError: error => this.notify(
						error?.message || `Phát hành ${selectedFile.name} lên YouTube thất bại.`,
						'error'
					),
				});
			},


			async onUploadFile(file) {
				const oldFile = typeof this.editableItem.DataJson === 'object' && this.editableItem.DataJson !== null
					? { ...this.editableItem.DataJson }
					: this.editableItem.DataJson;
				const _file = file.Files[0]
				let contentType = ''
				if (_file.FILE_CONTENTTYPE === 'application/pdf') contentType = 'PDF'
				if (_file.FILE_CONTENTTYPE === 'application/msword'
					|| _file.FILE_CONTENTTYPE === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
				) contentType = 'DOCX'

				if (_file.FILE_CONTENTTYPE === 'application/vnd.ms-powerpoint'
					|| _file.FILE_CONTENTTYPE === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
				) contentType = 'PPT'

				await this.deleteOldFileAfterReplace(oldFile);

				this.editableItem.DataJson.slideType = contentType
				this.editableItem.DataJson.title = _file.FILE_NAME
				this.editableItem.DataJson.fileName = _file.FILE_NAME
				this.editableItem.DataJson.uploadSource = 'db'
				this.editableItem.DataJson.fileId = _file.FILE_ID
				this.editableItem.DataJson.url = _file.FILE_URL
			},
			async onCloseFile(e) {
				const currentFile = typeof this.editableItem.DataJson === 'object' && this.editableItem.DataJson !== null
					? { ...this.editableItem.DataJson }
					: this.editableItem.DataJson;
				if (!currentFile || (typeof currentFile === 'object' && !Object.keys(currentFile).length)) {
					this.editableItem.DataJson = {};
					return;
				}

				// Chỉ gỡ liên kết khỏi node học liệu. FileData và metadata trong kho tài
				// nguyên có thể vẫn đang được tái sử dụng nên không được xóa vật lý tại đây.
				this.editableItem.DataJson = {};
				this.notify("Đã gỡ tập tin khỏi nội dung. File vẫn còn trong kho tài nguyên.");
			},
			async deleteCurrentFileResource(fileInfo) {
				if (this.isYouTubeFile(fileInfo)) {
					await this.deleteYouTubeVideo(fileInfo);
					return;
				}
				if (this.isGoogleDriveFile(fileInfo)) {
					await this.deleteGoogleDriveFile(fileInfo);
					return;
				}

				if (this.isDbUploadedFile(fileInfo)) {
					await this.deleteDbUploadedFile(fileInfo);
				}
			},
			isYouTubeFile(fileInfo) {
				if (typeof fileInfo === 'string') {
					return fileInfo.includes('youtube.com') || fileInfo.includes('youtu.be');
				}
				const url = fileInfo.url || '';
				return fileInfo.uploadSource === 'youtube' || !!fileInfo.videoId || url.includes('youtube.com') || url.includes('youtu.be');
			},
			getYouTubeVideoId(fileInfo) {
				if (typeof fileInfo === 'string') {
					const url = fileInfo;
					if (url.includes('v=')) return url.split('v=')[1].split('&')[0];
					if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
					return null;
				}
				if (fileInfo.videoId) return fileInfo.videoId;
				const url = fileInfo.url || '';
				if (url.includes('v=')) {
					return url.split('v=')[1].split('&')[0];
				}
				if (url.includes('youtu.be/')) {
					return url.split('youtu.be/')[1].split('?')[0];
				}
				return null;
			},
			async deleteYouTubeVideo(fileInfo) {
				const videoId = this.getYouTubeVideoId(fileInfo);
				if (!videoId) return;

				const { access_token } = await fetchPromise('lms/FP_Youtube_Token_Get');
				await window.UploadManager.deleteFromYouTube(videoId, { accessToken: access_token });
			},
			isGoogleDriveFile(fileInfo) {
				if (typeof fileInfo === 'string') {
					return fileInfo.includes('drive.google.com');
				}
				const url = fileInfo.url || '';
				return fileInfo.uploadSource === 'ggdrive' || !!fileInfo.driveFileId || url.includes('drive.google.com');
			},
			isDbUploadedFile(fileInfo) {
				if (typeof fileInfo === 'string') {
					return fileInfo.includes('file.lhbs.vn') || fileInfo.includes('/FileData/');
				}
				const url = fileInfo.url || fileInfo.FILE_URL || '';
				return fileInfo.uploadSource === 'db'
					|| !!fileInfo.fileId
					|| !!fileInfo.FILE_ID
					|| url.includes('file.lhbs.vn')
					|| url.includes('/FileData/');
			},
			getGoogleDriveFileId(fileInfo) {
				if (typeof fileInfo === 'string') {
					const url = fileInfo;
					if (url.includes('/d/')) {
						const parts = url.split('/d/');
						if (parts[1]) return parts[1].split('/')[0];
					}
					return null;
				}
				if (fileInfo.driveFileId) return fileInfo.driveFileId;
				const url = fileInfo.url || '';
				if (url.includes('/d/')) {
					const parts = url.split('/d/');
					if (parts[1]) {
						return parts[1].split('/')[0];
					}
				}
				return null;
			},
			async deleteGoogleDriveFile(fileInfo) {
				const fileId = this.getGoogleDriveFileId(fileInfo);
				if (!fileId) throw new Error('Không tìm thấy Google Drive file id');

				const { access_token } = await fetchPromise('lms/FP_Youtube_Token_Get');
				await window.UploadManager.deleteFromGoogleDrive(fileId, { accessToken: access_token });
			},
			async deleteDbUploadedFile(fileInfo) {
				const fileId = fileInfo.fileId || fileInfo.FILE_ID;
				if (fileId) {
					await window.UploadManager.deleteLmsFile(fileId);
				}
			},
			async deleteOldFileAfterReplace(oldFile) {
				if (!Object.keys(oldFile).length) return;
				try {
					await this.deleteCurrentFileResource(oldFile);
				} catch (error) {
					console.warn('Could not delete replaced file:', error);
					this.notify("Đã upload file mới nhưng chưa xóa được file cũ.", "warning");
				}
			},
			closeDialog() {
				this.$emit('update:isOpen', false);
			},
			save() {
				// "Đóng gói" lại DataJson thành chuỗi trước khi lưu
				const dataToSave = this.buildSavePayload(JSON.parse(JSON.stringify(this.editableItem)));
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
					this.notify('Không tìm thấy file index.html trong folder iSpring!', 'error');
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
							this.notify('Upload và deploy thành công!');
						} else {
							this.notify('Upload thành công, đang chờ GitHub Pages deploy.', 'warning');
						}
					}, 3000);

					setTimeout(() => {
						this.uploadProgress.show = false;
					}, 2000);

				} catch (error) {
					console.error('❌ Upload error:', error);
					this.uploadProgress.text = '❌ Upload thất bại: ' + error.message;
					this.notify('Upload thất bại: ' + error.message, 'error');

					setTimeout(() => {
						this.uploadProgress.show = false;
					}, 3000);
				}
			},

			getGitHubConfig() {
				return {
					token: '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',
					owner: 'thientamlhu',
					repo: 'lhbs.lms',
					branch: 'main'
				};
			},

			async uploadToGitHub(files, guid, folderName) {
				const { token, owner, repo } = this.getGitHubConfig();

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
						await this.uploadSingleFile(token, owner, repo, filePath, base64Content, file.name);

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
				const { branch } = this.getGitHubConfig();
				const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${this.encodeGitHubPath(path)}`, {
					method: 'PUT',
					headers: {
						'Authorization': `token ${token}`,
						'Accept': 'application/vnd.github.v3+json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						message: `Upload ${fileName}`,
						content: content,
						branch
					})
				});

				if (!response.ok) {
					const error = await response.json();
					throw new Error(error.message || 'Upload failed');
				}

				return response.json();
			},

			encodeGitHubPath(path) {
				return path.split('/').map(part => encodeURIComponent(part)).join('/');
			},

			async deleteGitHubPath(path) {
				const { token, owner, repo, branch } = this.getGitHubConfig();
				const encodedPath = this.encodeGitHubPath(path);
				const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${branch}`, {
					headers: {
						'Authorization': `token ${token}`,
						'Accept': 'application/vnd.github.v3+json'
					}
				});

				if (response.status === 404) return;
				if (!response.ok) {
					const error = await response.json();
					throw new Error(error.message || 'Cannot read GitHub content');
				}

				const content = await response.json();
				const items = Array.isArray(content) ? content : [content];
				for (const item of items) {
					if (item.type === 'dir') {
						await this.deleteGitHubPath(item.path);
					} else {
						await this.deleteGitHubFile(item.path, item.sha);
					}
				}
			},

			async deleteGitHubFile(path, sha) {
				const { token, owner, repo, branch } = this.getGitHubConfig();
				const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${this.encodeGitHubPath(path)}`, {
					method: 'DELETE',
					headers: {
						'Authorization': `token ${token}`,
						'Accept': 'application/vnd.github.v3+json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						message: `Delete ${path}`,
						sha,
						branch
					})
				});

				if (!response.ok && response.status !== 404) {
					const error = await response.json();
					throw new Error(error.message || 'Cannot delete GitHub file');
				}
			},

			generateGUID() {
				if (globalThis.crypto?.randomUUID) {
					return globalThis.crypto.randomUUID();
				}

				const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
				let guid = '';
				for (const c of template) {
					if (c !== 'x' && c !== 'y') {
						guid += c;
						continue;
					}

					const r = Math.random() * 16 | 0;
					const v = c === 'x' ? r : (r & 0x3 | 0x8);
					guid += v.toString(16);
				}
				return guid;
			},

			async removeiSpringContent() {
				const guid = this.editableItem.DataJson?.iSpringGUID;
				this.loadingPage.isLoading = true;
				this.loadingPage.text = "Đang xóa iSpring content...";
				try {
					if (guid) {
						await this.deleteGitHubPath(`content/${guid}`);
					}
					this.editableItem.DataJson = {};
					if (this.$refs.iSpringInput) this.$refs.iSpringInput.value = '';
					this.notify("Đã xóa iSpring content.");
				} catch (error) {
					console.error('Delete iSpring content failed:', error);
					this.notify("Không thể xóa iSpring content gốc. Vui lòng thử lại.", "error");
				} finally {
					this.loadingPage.isLoading = false;
				}
			}
		}
	}
</script>
