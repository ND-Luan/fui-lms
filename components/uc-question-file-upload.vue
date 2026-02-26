<template>
	<div>
		<!-- (2.1) Hướng dẫn -->
		<v-alert v-if="guideText" class="mb-2" variant="tonal" type="info" density="comfortable" border="start"
			border-color="info">
			<strong>Hướng dẫn:</strong> {{ guideText }}
		</v-alert>
		<v-btn text='Nộp đáp án của bạn' @click="$refs.inputFile.click()" color="primary" class="mb-2 mt-2"
			variant="elevated" v-if='submissionstatus < 2' />
		<input ref="inputFile" type="file" @change="handleChangeFile" accept="*" style="display:none" />

		<div v-if="!readonly && question.config.allowLinkSubmission">
			<div class="d-flex align-center">
				<v-text-field v-model="linkInput" label="Hoặc dán link Google Drive/Youtube vào đây"
					placeholder="https://drive.google.com/..." outlined dense hide-details
					@keydown.enter="addLinkFile" />
				<v-btn class="ml-2" color="info" @click="addLinkFile" :disabled="!linkInput.trim()">Thêm link</v-btn>
			</div>
			<div class="text-caption text-grey mt-1">
				Lưu ý: Hãy chắc chắn rằng bạn đã chia sẻ quyền "Bất kỳ ai có đường liên kết".
			</div>
		</div>

		<!-- (3) Câu trả lời HS -->
		<div v-if="answer && answer.length > 0" class="pa-2 rounded bg-indigo-lighten-5">
			<p class="font-weight-medium">
				<v-icon class="mr-1">mdi-account-outline</v-icon>
				Câu trả lời của {{ isGrade ? 'học sinh' : 'bạn' }}:
			</p>
			<div class="d-flex flex-wrap align-center">
				<!-- Sử dụng v-for để lặp qua các file -->
				<div v-for="(file, index) in answer" :key="index" class="ma-1 d-flex align-center">
					<!-- v-chip để hiển thị thông tin file -->
					<v-chip class="chip-file-upload" color="purple" label @click="onOpenFile(file)"
						style="cursor: pointer;">
						{{ file.name }}
						<!-- Nút Xóa cho Học sinh -->
						<v-icon v-if="!readonly && !isGrade" end @click.stop.prevent="confirmDeleteFile(index)"
							size="small">
							mdi-close
						</v-icon>
					</v-chip>

					<!-- Nút Chú thích cho Giáo viên, chỉ hiển thị cho file ảnh -->
					<v-btn v-if="isGrade && isImageFile(file.name) && submissionstatus !== 4" size="small"
						variant="text" class="ml-1" icon @click="openAnnotator(file)" color="primary"
						v-tooltip="'Chấm trên ảnh'">
						<v-icon>mdi-pencil-outline</v-icon>
					</v-btn>
				</div>
			</div>
		</div>
		<div v-else-if="readonly || isGrade" class="mt-2 pa-2 rounded bg-grey-lighten-4">
			<p class="text-red"><i>{{ isGrade ? 'Học sinh' : 'Bạn' }} không nộp file nào.</i></p>
		</div>

		<!-- (4) Ý kiến học sinh -->
		<div class="d-flex flex-column ga-2 my-2">
			<div class="text-end" v-if="!isGrade && submissionstatus < 2 && isShowBtnComment">
				<v-menu v-model="menu" :close-on-content-click="false" scroll-strategy="close" location="start">
					<template #activator="{ props: menuProps }">
						<v-tooltip location="top">
							<template #activator="{ props: tooltipProps }">
								<v-btn v-bind="{ ...menuProps, ...tooltipProps }" icon="mdi-notebook-edit-outline" size="small"
									variant="text" color="primary" />
							</template>
							<span>Ý kiến của bạn</span>
						</v-tooltip>
					</template>
					<v-card :min-width="widthScreen < 650 ? null : 600" variant="outlined" class="elevation-0">
						<v-card-title class="px-4 py-3" style="background-color:#E3F2FD; color:#1565C0; font-weight:600;">
							Ý kiến của bạn
						</v-card-title>
						<v-list>
							<v-list-item>
								<v-textarea :model-value="grading?.comment || ''" @update:model-value="onStudentCommentInput" rows="2"
									hide-details variant="outlined" placeholder="Nhập ý kiến của bạn" />
							</v-list-item>
						</v-list>
						<v-card-actions class="border-t py-0">
							<v-spacer />
							<v-btn variant="text" color="primary" @click="menu = false">
								Đóng
							</v-btn>
						</v-card-actions>
					</v-card>
				</v-menu>
			</div>
			<div v-else-if="grading?.comment" class="pa-2 rounded bg-blue-lighten-1">
				<b>
					<v-icon size="18" class="mr-1">mdi-message-text-outline</v-icon>
					<span v-if="$i18n.locale == 'en' && isGrade">
						Student's Feedback
					</span>
					<span v-else-if="$i18n.locale != 'en' && isGrade">Ý kiến {{ isGrade ? 'học sinh' : 'bạn' }}:</span>
				</b>
				<span class="ml-1">{{ grading?.comment }}</span>
			</div>
		</div>

		<!-- (5) Điểm -->
		<!-- Điểm câu – hiển thị khi đã trả bài (status == 4) -->
		<div v-if="submissionstatus == 4" class="my-2">
			<strong>{{ $i18n.locale == 'en' ? 'Score' : 'Điểm' }}:</strong>
			<v-chip size="small" :color="scoreChipColor" variant="tonal">
				<v-icon start size="16">mdi-star</v-icon>
				{{ displayScore }} / {{ effectiveMaxPoints }}
			</v-chip>
		</div>

		<!-- (6) Nhận xét GV -->
		<v-alert v-if="submissionstatus == 4 && !isGrade && grading?.teacherComment?.length > 0" border="start"
			color="info" elevation="2" class="mt-4" icon="mdi-comment-quote-outline">
			<strong>Nhận xét GV:</strong> {{ grading?.teacherComment ?? '-' }}
		</v-alert>

		<!-- ĐANG CHỜ CHẤM -->
		<v-alert v-if="!isGrade && submissionstatus >= 2 && submissionstatus !== 4" class="my-2" variant="tonal"
			type="warning" density="comfortable">
			ĐANG CHỜ CHẤM
		</v-alert>

		<!-- GV -->
		<div class=" teacher-grading-area" v-if="isGrade">
			<div class="d-flex align-center mb-2" v-if="submissionstatus != 4">
				<v-number-input :model-value="grading ? grading.manualScore : 0"
					@update:model-value="val => grading.manualScore = (val === undefined ? null : val)" label="Điểm"
					:max="question.points" :min="0" variant="outlined" density="compact" hide-details
					style="max-width: 100px;" @blur="submitPoints" control-variant="hidden" inset />
				<span class="text-h6 ml-2 text-primary"> / {{ question.points }}</span>
				<span class="ml-1 text-caption">điểm</span>
			</div>
			<v-textarea :model-value="grading ? grading.teacherComment : ''" @update:model-value="updateTeacherComment"
				:label="$t('message.TeacherCommentOptional')" rows="2" outlined dense hide-details />
		</div>

		<!-- THÊM DÒNG NÀY -->
		<uc-image-annotator-test v-model:visible="annotator.visible" :file-url="annotator.fileUrl"
			:original-file="annotator.currentFileObject" :initial-annotations="annotator.initialData"
			@save="handleSaveAnnotation" />
		<!-- <uc-image-annotator v-if="annotator.visible" v-model:visible="annotator.visible" :file-url="annotator.fileUrl"
			:original-file="annotator.currentFileObject" :initial-annotations="annotator.initialData"
			@save="handleSaveAnnotation" :key="keyComp" /> -->

		<v-dialog v-model="deleteDialog.show" max-width="400">
			<v-card>
				<v-card-title class="text-h5">Xác nhận xóa</v-card-title>
				<v-card-text>Bạn có chắc chắn muốn xóa file: <strong>{{ deleteDialog.fileName }}</strong>?</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn text @click="deleteDialog.show = false">Hủy</v-btn>
					<v-btn color="error" @click="executeDeleteFile">Xóa</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<uc-loading-page v-model="loadingPage.isLoading" v-model:text="loadingPage.text" />
		<v-dialog v-model="isOpenFile" fullscreen>
			<iframe class="iframeFile" :src="file?.source + '?v=' + Date.now()" frameborder="0"
				style="width:100%; height:600px; border:none; overflow:hidden;" scrolling="no"></iframe>
		</v-dialog>
	</div>
</template>
<script>
	export default {
		name: 'uc-question-file-upload',
		props: {
			question: Object,
			answer: { type: Array, default: () => [] },
			readonly: { type: Boolean, default: false },
			grading: Object,
			isGrade: { type: Boolean, default: false },
			submissionstatus: { type: Number, default: -1 },
			isShowBtnComment: { type: Boolean, default: true }
		},
		emits: ['answer-change', 'grading-change'],
		data() {
			this.$i18n.locale = (localStorage.getItem('IsLanguage') && localStorage.getItem('IsLanguage') == 'true') ? 'en' : 'vi'
			return {
				isOpenFile: false,
				file: null,
				vueData, window,
				apiFile: "https://file.lhbs.vn/lms/upload/FileData",
				urlReturnFile: "https://file.lhbs.vn/lms",
				fileUploadModel: null,
				linkInput: '',
				deleteDialog: { show: false, indexToDelete: null, fileIdToDelete: null, fileName: '' },
				loadingPage: { isLoading: false, text: 'Đang tải dữ liệu...' },
				menu: false, widthScreen: null,
				annotator: {
					visible: false,
					fileUrl: '',
					initialData: {},
					currentFileId: null,
					currentFileObject: null
				},
				keyComp: 0
			}
		},
		computed: {
			guideText() { return this.question?.config?.submissionNote || this.question?.config?.instruction || '' },
			displayScore() {
				// Ưu tiên manualScore, rồi autoScore, nếu trống thì mặc định 0
				const s = this.grading?.manualScore ?? this.grading?.autoScore ?? 0;
				return typeof s === 'number' ? s : 0;
			},
			effectiveMaxPoints() {
				return this.question?.points ?? 0;
			},
			scoreChipColor() {
				const s = this.displayScore;
				const max = this.effectiveMaxPoints;
				if (s <= 0) return 'error'; // 0 điểm 
				if (max && s >= max) return 'success'; // đạt tối đa
				return 'primary'; // điểm trung gian
			}
		},
		mounted() {
			this.widthScreen = window.innerWidth
			window.addEventListener('resize', () => { this.handleResize() })
		},
		methods: {
			handleResize() {
				this.widthScreen = window.innerWidth;
			},
			onStudentCommentInput(val) {
				this.grading.comment = val
				this.$emit('grading-change', { ...this.grading, comment: val })
			},
			addLinkFile() {
				if (!this.linkInput || !this.linkInput.trim().startsWith('http')) return;
				const newLinkFile = { id: this.linkInput.trim(), name: this.linkInput.trim(), source: this.linkInput.trim(), fileType: 'link' };
				const updatedFiles = [...(this.answer || []), newLinkFile];
				this.$emit('answer-change', updatedFiles);
				this.linkInput = '';
			},
			confirmDeleteFile(index) {
				const f = this.answer[index];
				this.deleteDialog = { show: true, indexToDelete: index, fileIdToDelete: f.id, fileName: f.name };
			},
			async executeDeleteFile() {
				const updatedFiles = this.answer.filter((_, i) => i !== this.deleteDialog.indexToDelete);
				this.$emit('answer-change', updatedFiles);
				this.deleteDialog.show = false;
			},
			//Luân làm handleChangeFile (dùng để restore khi anh Tâm lỗi)
			// async handleChangeFile(e) {
			// 	const file = e.target.files[0]; if (!file) return;
			// 	this.uploadToGoogleDrive(file).then((f) => {
			// 		const _ans = this.answer || []; _ans.push(f); this.$emit('answer-change', _ans);
			// 	})
			// },
			// Anh Tâm mode handleChangeFile
			async handleChangeFile(e) {
				const file = e.target.files[0];
				if (!file) return;
	
				this.loadingPage.isLoading = true;
				this.loadingPage.text = "Đang tải tệp lên...";
	
				try {
					// Bước 1: Quyết định phương thức upload
					const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type) || /\.(jpg|jpeg|png|gif)$/i.test(file.name);
					const isSmallFile = file.size < (5 * 1024 * 1024);
					console.log('isSmallFile', isSmallFile)
					let uploadedFilePromise;
	
					// Bước 2: Gọi hàm upload tương ứng và gán Promise
					// if (isImage || isSmallFile) {
					// console.log("%cDECISION: Uploading to Fast Project server...", "color: blue; font-weight: bold;");
					uploadedFilePromise = this.uploadToFastProject(file);
					// } else {
					// console.log("%cDECISION: File is large/not an image, uploading to Google Drive...", "color: green; font-weight: bold;");
					// uploadedFilePromise = this.uploadToGoogleDrive_New(file);
					// }
	
					// Bước 3: Đợi (await) cho Promise hoàn thành và lấy kết quả
					const uploadedFile = await uploadedFilePromise;
	
					// Bước 4: Xử lý kết quả
					if (uploadedFile) {
						const _ans = this.answer || [];
						_ans.push(uploadedFile);
						this.$emit('answer-change', _ans);
					} else {
						// Trường hợp Promise resolve với giá trị null (ví dụ: upload Drive lỗi)
						throw new Error("Upload succeeded but returned no file data.");
					}
	
				} catch (error) {
					console.error("Lỗi trong quá trình upload:", error);
					Toast.error({ text: "Tải tệp lên thất bại." });
				} finally {
					this.loadingPage.isLoading = false;
				}
			},
			// HÀM UPLOAD "PHÂN LUỒNG" MỚI
			async uploadFile(file) {
				const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
				const isSmallFile = file.size < 5 * 1024 * 1024; // Ngưỡng là 5MB 
				// ĐIỀU KIỆN: Nếu là ảnh HOẶC file nhỏ, upload về server Fast Project 
				if (isImage || isSmallFile) {
					console.log("Uploading to Fast Project server..."); return
					this.uploadToFastProject(file);
				} // Ngược lại, upload file lớn lên Google Drive 
				else {
					console.log("File is large,uploading to Google Drive...");
					return this.uploadToGoogleDrive_New(file); // Gọi hàm mới 
				}
			},
	
			// HÀM UPLOAD MỚI (DÙNG ajaxUPLOAD CỦA FAST PROJECT) 
			// Hàm upload thủ công về server Fast Project
			// HÀM MỚI: Dùng để đọc giá trị của một cookie theo tên
			getCookie(name) {
				const value = `; ${document.cookie}`;
				const parts = value.split(`; ${name}=`);
				if (parts.length === 2) return parts.pop().split(';').shift();
				return null;
			},
			async uploadToFastProject(file) {
				this.loadingPage.text = "Đang tải lên máy chủ...";
				const formData = new FormData();
				formData.append('file', file);
	
				const token = this.getCookie('awt');
	
				if (!token) {
					console.error("CRITICAL: Không tìm thấy cookie 'awt'. Người dùng có thể chưa đăng nhập.");
					throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
				}
	
				console.log("Found 'awt' cookie, using token for upload:", token);
				// $.ajax trả về một "Promise-like" object (jqXHR)
				const response = await $.ajax({
					url: `https://file.lhbs.vn/lms/upload/LMS_FileData`,
					type: 'POST',
					data: formData,
					processData: false,
					contentType: false,
					headers: {
						'Authorization': 'Bearer ' + token
					}
				});
	
				// Xử lý response
				if (response && response.Files && response.Files.length > 0) {
					// Lấy object file đầu tiên từ mảng "Files"
					const uploadedFile = response.Files[0];
	
					return {
						// Lấy FILE_ID từ response
						id: uploadedFile.FILE_ID,
						// Lấy FILE_NAME từ response
						name: uploadedFile.FILE_NAME,
						// Tạo URL đầy đủ để có thể truy cập
						source: `${this.urlReturnFile}${uploadedFile.FILE_URL}`,
					};
				} else {
					throw new Error("Phản hồi từ server không hợp lệ sau khi upload.");
				}
			},
	
			// HÀM UPLOAD GOOGLE DRIVE  (ĐỔI TÊN VÀ SỬA LẠI ĐỂ TRẢ VỀ fileType)
			async uploadToGoogleDrive_New(file) {
				this.loadingPage.isLoading = true; this.loadingPage.text = "Đang tải dữ liệu..."
				const { access_token } = await this.ajaxCALLPromise('lms/FP_Youtube_Token_Get')
				this.loadingPage.text = "Đang tìm kiếm folder..."
				const asm = vueData.assignmentData[0][0]
				const pathPrefix = `LMS/${asm.MonHocName} ${asm.KhoiID}/${asm.Title}/${vueData.user.UserID}`
				const folderId = await this.ensureFolderPathExists(pathPrefix, access_token);
				const metadata = { name: file.name, mimeType: file.type, parents: [folderId] };
				const form = new FormData();
				form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
				form.append('file', file);
				this.loadingPage.text = "Đang upload..."
				const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
					method: 'POST', headers: new Headers({ Authorization: 'Bearer ' + access_token }), body: form,
				});
				const fileDrive = await res.json();
				this.loadingPage.text = "Đang cấp quyền file..."
				const perm = await fetch(`https://www.googleapis.com/drive/v3/files/${fileDrive?.id}/permissions`, {
					method: 'POST', headers: { Authorization: 'Bearer ' + access_token },
					body: JSON.stringify({ role: 'reader', type: 'anyone' }),
				});
				if (perm.ok) {
					const driveFileUrl = `https://drive.google.com/file/d/${fileDrive.id}/preview`
					this.loadingPage.isLoading = false
					// Thêm fileType: 'link' để phân biệt
					return { id: fileDrive.id, name: file.name, source: driveFileUrl, fileType: 'link' }
				}
				return null; // Trả về null nếu có lỗi
			},
			ajaxCALLPromise(url, params = null) {
				return new Promise(resolve => {
					ajaxCALL(url, params, res => { if (res?.data) resolve(res.data); else resolve(res) })
				})
			},
			async ensureFolderPathExists(path, access_token) {
				const parts = path.split('/'); let parentId = 'root';
				for (const part of parts) parentId = await this.getOrCreateFolderId(part, parentId, access_token);
				return parentId;
			},
			async getOrCreateFolderId(folderName, parentId = 'root', access_token) {
				const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`;
				const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`, { headers: { Authorization: `Bearer ${access_token}` } });
				const data = await res.json();
				if (data.files.length > 0) return data.files[0].id;
				const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
					method: 'POST', headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
					body: JSON.stringify({ name: folderName, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] })
				});
				const created = await createRes.json(); return created.id;
			},
			async uploadToGoogleDrive(file) {
				this.loadingPage.isLoading = true; this.loadingPage.text = "Đang tải dữ liệu..."
				const { access_token } = await this.ajaxCALLPromise('lms/FP_Youtube_Token_Get')
				this.loadingPage.text = "Đang tìm kiếm folder..."
				const asm = vueData.assignmentData[0][0]
				const pathPrefix = `LMS/${asm.MonHocName} ${asm.KhoiID}/${asm.Title}/${vueData.user.UserID}`
				const folderId = await this.ensureFolderPathExists(pathPrefix, access_token);
				const metadata = { name: file.name, mimeType: file.type, parents: [folderId] };
				const form = new FormData();
				form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
				form.append('file', file);
				this.loadingPage.text = "Đang upload..."
				const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
					method: 'POST', headers: new Headers({ Authorization: 'Bearer ' + access_token }), body: form,
				});
				const fileDrive = await res.json();
				this.loadingPage.text = "Đang cấp quyền file..."
				const perm = await fetch(`https://www.googleapis.com/drive/v3/files/${fileDrive?.id}/permissions`, {
					method: 'POST', headers: { Authorization: 'Bearer ' + access_token },
					body: JSON.stringify({ role: 'reader', type: 'anyone' }),
				});
				if (perm.ok) {
					const driveFileUrl = `https://drive.google.com/file/d/${fileDrive.id}/preview`
					this.loadingPage.isLoading = false
					return { id: fileDrive.id, name: file.name, source: driveFileUrl }
				}
			},
			// ===== CÁC HÀM MỚI/ĐƯỢC SỬA BẮT ĐẦU TỪ ĐÂY =====
	
			isImageFile(fileName) {
				if (!fileName) return false;
				const extension = fileName.split('.').pop().toLowerCase();
				return ['jpg', 'jpeg', 'png'].includes(extension);
			},
			// Thêm hàm helper này vào
			getDriveFileId(url) {
				if (!url) return null;
				// Regex này sẽ tìm ID trong các loại link drive khác nhau
				const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
				return match ? match[1] : null;
			},
	
			openAnnotator(file) {
				localStorage.setItem("IsShowHeader_ChamBai", false)
				this.keyComp++
				let imageUrl = file?.source || '';
				let annotations = {}
				if (file?.FileAnnotation)
					annotations = JSON.parse(file?.FileAnnotation?.annotations)
	
				// Gán các giá trị để mở dialog chú thích
				this.annotator.fileUrl = imageUrl;
				this.annotator.initialData = annotations
				this.annotator.currentFileId = file.id;
				this.annotator.currentFileObject = file;
	
				this.annotator.visible = true;
				console.log('this.annotator', this.annotator)
	
			},
	
			handleSaveAnnotation(updatedFileObject) {
				console.log("Nhận được file đã cập nhật từ annotator:", updatedFileObject);
	
				const newAnswer = this.answer.map(f => {
					const newFile = { ...f }
					if (newFile.id === updatedFileObject.id) {
						newFile.FileAnnotation = updatedFileObject
					}
					return newFile;
				});
				console.log('newAnswer =>>>>>>>>>>>>', newAnswer)
				this.$emit('answer-change', newAnswer);
			},
	
			getFileDetails(fileName) {
				if (!fileName) return { icon: 'mdi-file-question-outline', color: 'grey' };
				if (fileName.startsWith('http')) {
					if (fileName.includes('youtube.com') || fileName.includes('youtu.be')) return { icon: 'mdi-youtube', color: 'red' };
					if (fileName.includes('drive.google.com')) return { icon: 'mdi-google-drive', color: 'orange' };
					return { icon: 'mdi-link-variant', color: 'info' };
				}
				const extension = fileName.split('.').pop().toLowerCase();
				const fileTypes = {
					'jpg': { icon: 'mdi-file-image-outline', color: 'deep-purple-accent-4' },
					'jpeg': { icon: 'mdi-file-image-outline', color: 'deep-purple-accent-4' },
					'png': { icon: 'mdi-file-image-outline', color: 'deep-purple-accent-4' },
					'pdf': { icon: 'mdi-file-pdf-box', color: 'red' },
					'doc': { icon: 'mdi-file-word-box', color: 'blue' },
					'docx': { icon: 'mdi-file-word-box', color: 'blue' },
					'default': { icon: 'mdi-file-outline', color: 'primary' }
				};
				return fileTypes[extension] || fileTypes['default'];
			},
			updateTeacherComment(val) { this.$emit('grading-change', { ...this.grading, teacherComment: val }); },
			submitPoints() {
				this.$emit('grading-change', {
					...this.grading,
					manualScore: this.grading.manualScore
				});
			},
			onOpenFile(file) {
				let source = file.source
				if (this.submissionstatus === 4) {
					source = file?.FileAnnotation?.source ?? source
				}
				window.open(source, '_blank')
			},
			onclose() {
				this.isOpenFile = false
				this.file = null
			}
		}
	}
</script>