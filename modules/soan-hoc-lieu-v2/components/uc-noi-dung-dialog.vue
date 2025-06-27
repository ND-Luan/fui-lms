<!-- === uc-noi-dung-dialog (Flow mới) === -->
<template>
	<v-dialog :model-value="isOpen" @update:modelValue="closeDialog" max-width="900px" persistent>
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
								label="Loại nội dung*" variant="outlined" density="compact" />
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
						<uc-quiz-editor v-if="isQuiz" :loai-noi-dung="editableItem.LoaiNoiDung"
							v-model="editableItem.DataJson" />

						<!-- 2. Nếu là VIDEO hoặc AUDIO -->
						<v-text-field v-else-if="isMediaLink" label="Đường dẫn (URL)"
							v-model="editableItem.DataJson.url" variant="outlined" density="compact"
							placeholder="https://www.youtube.com/watch?v=..."></v-text-field>

						<!-- 3. Nếu là HTML (cần trình soạn thảo Rich Text) -->
						<div v-else-if="isHtml" class="html-editor-wrapper">
							<!-- Tạm thời dùng v-textarea, sẽ thay bằng TinyMCE/CKEditor sau -->
							<v-textarea v-model="htmlContent" label="Nội dung HTML" variant="outlined"
								rows="15"></v-textarea>
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
					"CHUONG", "BAI", "NHOM_KY_NANG", "VIDEO", "HTML",
					"QUIZ_SINGLE_CHOICE", "QUIZ_MULTIPLE_CHOICE", "QUIZ_ORDERING",
					"QUIZ_MATCHING", "QUIZ_DRAG_DROP_CATEGORIZE", "QUIZ_FILL_IN_BLANK", "QUIZ_CONNECTION", "QUIZ_COMPOSITE"
				],
			};
		},
		computed: {
			formTitle() { return this.item && this.item.NoiDungID ? 'Cập nhật mục' : 'Thêm mục mới'; },
			isQuiz() { return this.editableItem?.LoaiNoiDung?.startsWith('QUIZ'); },
			isMediaLink() { return ['VIDEO', 'AUDIO', 'TAILIEU'].includes(this.editableItem?.LoaiNoiDung); },
			isHtml() { return ['HTML', 'INTERACTIVE', 'READING'].includes(this.editableItem?.LoaiNoiDung); },
			htmlContent: {
				get() {
					// KHI HIỂN THỊ: Lấy giá trị từ object và trả về chuỗi
					if (this.editableItem && this.editableItem.DataJson) {
						// Nếu là object, lấy thuộc tính htmlContent, nếu không thì lấy chính nó
						return this.editableItem.DataJson.htmlContent || '';
					}
					return '';
				},
				set(newValue) {
					// KHI NHẬP LIỆU: Cập nhật lại object DataJson
					if (this.editableItem) {
						// Luôn đảm bảo DataJson là một object
						if (typeof this.editableItem.DataJson !== 'object' || this.editableItem.DataJson === null) {
							this.editableItem.DataJson = {};
						}
						this.editableItem.DataJson.htmlContent = newValue;
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
						try { initialData.DataJson = JSON.parse(initialData.DataJson); }
						catch (e) {
							// Nếu không phải JSON, coi nó là HTML thô
							initialData.DataJson = { htmlContent: initialData.DataJson };
						}
					} else if (!initialData.DataJson) {
						initialData.DataJson = {};
					}
	
					this.editableItem = initialData;
				}
			}
		},
		methods: {
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

</style>