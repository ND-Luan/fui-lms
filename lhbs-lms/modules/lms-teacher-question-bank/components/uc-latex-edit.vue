<template>
	<v-dialog max-width="900">
		<template v-slot:activator="{ props: activatorProps }">
			<div v-bind="activatorProps" style="width: 100%">
				<div v-if="isEditable">
					<div v-if="isEmpty" class="cursor-pointer empty-content text-caption">
						Bấm <v-icon color="success" size="small">mdi-pencil</v-icon> để soạn
					</div>
					<uc-latex-view v-else ref="contentContainer" class="cursor-pointer uc-latex-edit"
						:content="renderedContent" :escapeHtml="false" />
				</div>
				<uc-latex-view v-else ref="contentContainer" class="uc-latex-edit" :content="renderedContent" :escapeHtml="false" />
			</div>
		</template>

		<template v-slot:default="{ isActive }">
			<v-card title="Chỉnh sửa nội dung">
				<v-card-text>
					<f-editor v-model="contentEditor" :imageapi="vueData.v_Set.apiImageAdapter" variant="outlined"
						rows="6" auto-grow label="Nội dung (hỗ trợ HTML và LaTeX)" />
					<!-- Preview -->
					<div class="preview-section mt-4">
						<label class="text-subtitle-2 mb-2">Xem trước:</label>
						<div class="preview-content uc-latex-edit">
							<div v-if="previewEmpty" class="text-grey">
								<em>Không có nội dung...</em>
							</div>
							<uc-latex-view v-else ref="previewContainer" v-model:content="previewContent" :escapeHtml="false" />
						</div>
					</div>
				</v-card-text>

				<v-card-actions>
					<v-spacer />
					<v-btn text="Hủy" variant="text" @click="cancelEdit(isActive)"></v-btn>
					<v-btn text="Lưu" color="primary" @click="saveContent(isActive)"></v-btn>
				</v-card-actions>
			</v-card>
		</template>
	</v-dialog>
</template>

<script>
	export default {
		name: 'uc-latex-edit',
		props: {
			content: {
				type: String,
				default: ''
			},
			isEditable: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				contentEditor: this.content,
				renderedContent: '',
				previewContent: '',
				vueData
			}
		},
		computed: {
			isEmpty() {
				return !this.content || this.content.trim() === ''
			},
			previewEmpty() {
				return !this.contentEditor || this.contentEditor.trim() === ''
			}
		},
		watch: {
			content: {
				immediate: true,
				handler(newContent) {
					this.contentEditor = newContent
					this.renderContent(newContent)
				}
			},
			contentEditor(newContent) {
				this.renderPreview(newContent)
			}
		},
		mounted() {
			this.renderContent(this.content)
		},
		methods: {
			preprocessMathML(content) {
				let result = content;
	
				// Lặp tối đa 10 lần để xử lý nested
				for (let i = 0; i < 10; i++) {
					const before = result;
	
					// Match bất kỳ <mfenced> nào có open="{"
					result = result.replace(
						/<mfenced([^>]+open="\{"[^>]*)>([\s\S]*?)<\/mfenced>/g,
						(fullMatch, attributes, innerContent) => {
							// Kiểm tra xem có close="}" không
							const hasClosingBrace = /close="\}"/.test(attributes);
	
							if (hasClosingBrace) {
								return `<mo>{</mo><mrow>${innerContent}</mrow><mo>}</mo>`;
							} else {
								return `<mo>{</mo><mrow>${innerContent}</mrow>`;
							}
						}
					);
	
					// Nếu không còn thay đổi thì dừng
					if (before === result) break;
				}
	
				return result;
			},
			renderContent(content) {
				if (!content) {
					this.renderedContent = ''
					return
				}
				this.renderedContent = this.preprocessMathML(content);
				// this.renderedContent = content
			},
			renderPreview(content) {
				if (!content) {
					this.previewContent = ''
					return
				}
				this.previewContent = this.preprocessMathML(content);
			},
			saveContent(isActive) {
				this.$emit('update:content', this.preprocessMathML(this.contentEditor));
				isActive.value = false;
			},
			cancelEdit(isActive) {
				this.contentEditor = this.content
				isActive.value = false
			}
		}
	}
</script>