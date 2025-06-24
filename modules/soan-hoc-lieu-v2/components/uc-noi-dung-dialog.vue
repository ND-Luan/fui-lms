<!-- === uc-noi-dung-dialog.vue === -->
<template>
	<v-dialog :model-value="isOpen" @update:modelValue="closeDialog" max-width="800px" persistent>
		<v-card>
			<v-card-title class="d-flex justify-space-between align-center">
				<span class="text-h5">{{ formTitle }}</span>
				<v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
			</v-card-title>

			<v-divider></v-divider>

			<v-card-text>
				<v-container>
					<v-row>
						<v-col cols="12">
							<v-text-field v-model="editableItem.TenNoiDung" label="Tên mục*" variant="outlined"
								density="compact" autofocus :rules="[rules.required]" />
						</v-col>

						<v-col cols="12" sm="6">
							<v-select v-model="editableItem.LoaiNoiDung" :items="loaiHocLieuOptions"
								label="Loại nội dung*" variant="outlined" density="compact" :rules="[rules.required]" />
						</v-col>

						<v-col cols="12" sm="6">
							<v-text-field v-model.number="editableItem.ThuTu" label="Thứ tự" type="number"
								variant="outlined" density="compact" />
						</v-col>

						<uc-Quiz-single-choice-editor v-if="editableItem.LoaiNoiDung === 'QUIZ_SINGLE_CHOICE'"
							v-model="editableItem.DataJson" />

						<v-col cols="12">
							<label class="form-label">Nội dung chi tiết (DataJson)</label>
							<div class="code-editor-wrapper">
								<textarea ref="codeEditor"></textarea>
							</div>
							<div class="text-caption mt-1">
								Nhập nội dung dưới dạng JSON. Ví dụ cho Video: {"url": "..."}
							</div>
						</v-col>


					</v-row>
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
	  props: {
	    isOpen: Boolean,
	    item: Object,
	  },
	  emits: ['update:isOpen', 'save'],
	  data() {
	    return {
	      editableItem: {},
	      editorInstance: null,
	      loaiHocLieuOptions: [
	        "CHUONG", "BAI", "NHOM_KY_NANG", "VIDEO", "HTML",
	        "QUIZ_SINGLE_CHOICE", "QUIZ_MULTIPLE_CHOICE", "QUIZ_ORDERING",
	        "QUIZ_MATCHING", "QUIZ_DRAG_DROP_CATEGORIZE", "QUIZ_FILL_IN_BLANK", "QUIZ_CONNECTION"
	      ],
	      rules: {
	        required: value => !!value || 'Không được để trống.',
	      }
	    };
	  },
	  computed: {
	    formTitle() {
	      return this.editableItem.NoiDungID ? 'Cập nhật mục' : 'Thêm mục mới';
	    }
	  },
	  watch: {
	    isOpen(newVal) {
	      if (newVal) {
	        // Gán lại dữ liệu và khởi tạo hoặc cập nhật CodeMirror
	        this.editableItem = JSON.parse(JSON.stringify(this.item || {}));
	        this.$nextTick(() => {
	          this.setupCodeMirror();
	        });
	      } else {
	        this.destroyEditor(); // cleanup khi đóng dialog
	      }
	    },
	    // ✅ Khi DataJson thay đổi (do người dùng tương tác UI quiz)
	    "editableItem.DataJson": {
	      handler(val) {
	        if (this.editorInstance && typeof val !== 'string') {
	          this.editorInstance.setValue(JSON.stringify(val, null, 2));
	        }
	      },
	      deep: true,
	    }
	  },
	  methods: {
	    closeDialog() {
	      this.$emit('update:isOpen', false);
	    },
	    save() {
	      if (this.editorInstance) {
	        this.editableItem.DataJson = this.editorInstance.getValue();
	      }
	      this.$emit('save', this.editableItem);
	      this.closeDialog();
	    },
	    setupCodeMirror() {
	      if (!this.$refs.codeEditor) return;
	
	      if (!this.editorInstance) {
	        this.editorInstance = CodeMirror.fromTextArea(this.$refs.codeEditor, {
	          lineNumbers: true,
	          lineWrapping: true,
	          mode: { name: "javascript", json: true },
	          theme: 'default',
	          lint: true,
	          gutters: ["CodeMirror-lint-markers"]
	        });
	
	        // ✅ Gán sự kiện cập nhật ngược lại vào editableItem.DataJson
	        this.editorInstance.on("change", () => {
	          try {
	            const newVal = this.editorInstance.getValue();
	            const parsed = JSON.parse(newVal);
	            this.editableItem.DataJson = parsed;
	          } catch (e) {
	            // Nếu JSON không hợp lệ thì không cập nhật
	          }
	        });
	      }
	
	      const jsonContent = this.editableItem.DataJson
	        ? (typeof this.editableItem.DataJson === 'string'
	          ? this.editableItem.DataJson
	          : JSON.stringify(this.editableItem.DataJson, null, 2))
	        : '';
	
	      this.editorInstance.setValue(jsonContent);
	      setTimeout(() => this.editorInstance.refresh(), 10);
	    },
	    destroyEditor() {
	      if (this.editorInstance) {
	        this.editorInstance.toTextArea();
	        this.editorInstance = null;
	      }
	    }
	  },
	  beforeUnmount() {
	    this.destroyEditor();
	  }
	}
</script>