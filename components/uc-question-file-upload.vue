<template>
	<div>
		<!-- (2.1) Hướng dẫn -->
		<v-alert v-if="guideText" class="mb-3" variant="tonal" type="info" density="comfortable" border="start"
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
		<div v-if="answer && answer.length > 0" class="mt-4 pa-3 rounded bg-grey-lighten-4">
			<p class="font-weight-medium">
				<v-icon class="mr-1">mdi-account</v-icon> Câu trả lời của {{ isGrade ? 'học sinh' : 'bạn' }}:
			</p>
			<div class="d-flex flex-wrap">
				<v-chip v-for="(file, index) in answer" :key="index" class="ma-1" label
					@click="window.open(file.source)">
					{{ file.name }}
					<v-icon v-if="!readonly" @click.stop="confirmDeleteFile(index)">mdi-close</v-icon>
				</v-chip>
			</div>
		</div>
		<div v-else-if="submissionstatus >= 2" class="mt-2 pa-3 rounded bg-grey-lighten-4">
			<p class="text-red"><i>{{ isGrade ? 'Học sinh' : 'Bạn' }} không nộp file nào.</i></p>
		</div>

		<!-- (4) Ý kiến học sinh -->
		<div class="d-flex flex-column ga-2 my-2">
			<v-textarea v-if="!isGrade && submissionstatus < 2" :model-value="grading ? grading.comment : ''"
				@update:model-value="onStudentCommentInput" placeholder="Ý kiến của bạn (tùy chọn)" />
			<div v-else-if="grading?.comment" class="pa-3 rounded bg-grey-lighten-4">
				<b>
					<v-icon size="18" class="mr-1">mdi-message-text-outline</v-icon> Ý kiến {{ isGrade ? 'học sinh' :
					"bạn" }}:
				</b>
				<span class="ml-1">{{ grading?.comment }}</span>
			</div>
		</div>

		<!-- (5) Điểm -->
		<!-- Điểm câu – hiển thị khi đã trả bài (status == 4) -->
		<div v-if="submissionstatus == 4" class="mt-2">
			<strong>Điểm | Score:</strong>
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
		<v-alert v-if="!isGrade && submissionstatus >= 2 && submissionstatus !== 4" class="mt-2" variant="tonal"
			type="warning" density="comfortable">
			ĐANG CHỜ CHẤM
		</v-alert>

		<!-- GV -->
		<div class="mt-4 teacher-grading-area" v-if="isGrade">
			<div class="d-flex align-center mb-3">
				<v-number-input :model-value="grading ? grading.manualScore : 0"
					@update:model-value="val => grading.manualScore = (val === undefined ? null : val)" label="Điểm"
					:max="question.points" :min="0" variant="outlined" density="compact" hide-details
					style="max-width: 100px;" @blur="submitPoints" control-variant="stacked" inset />
				<span class="text-h6 ml-2 text-primary"> / {{ question.points }}</span>
				<span class="ml-1 text-caption">điểm</span>
			</div>
			<v-textarea :model-value="grading ? grading.teacherComment : ''" @update:model-value="updateTeacherComment"
				label="Nhận xét của giáo viên (tùy chọn)" rows="2" outlined dense hide-details />
		</div>

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
			submissionstatus: { type: Number, default: -1 }
		},
		emits: ['answer-change', 'grading-change'],
		data() {
			return {
				vueData, window,
				apiFile: "https://file.lhbs.vn/lms/upload/FileData",
				urlReturnFile: "https://file.lhbs.vn/lms",
				fileUploadModel: null,
				linkInput: '',
				deleteDialog: { show: false, indexToDelete: null, fileIdToDelete: null, fileName: '' },
				loadingPage: { isLoading: false, text: 'Đang tải dữ liệu...' }
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
				if (s <= 0) return 'error'; // 0 điểm if (max && s>= max) return 'success'; // đạt tối đa
				return 'primary'; // điểm trung gian
			}
		},
		methods: {
			onStudentCommentInput(val) { this.$emit('grading-change', { ...this.grading, comment: val }) },
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
			async handleChangeFile(e) {
				const file = e.target.files[0]; if (!file) return;
				this.uploadToGoogleDrive(file).then((f) => {
					const _ans = this.answer || []; _ans.push(f); this.$emit('answer-change', _ans);
				})
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
			updateTeacherComment(val) { this.$emit('grading-change', { ...this.grading, teacherComment: val }); },
			submitPoints() { this.$emit('grading-change', { ...this.grading, manualScore: parseFloat(this.grading.manualScore) }); }
		}
	}
</script>