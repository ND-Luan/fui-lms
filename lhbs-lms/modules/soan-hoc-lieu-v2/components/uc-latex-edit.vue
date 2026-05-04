<template>
	<v-dialog max-width="900">
		<template v-slot:activator="{ props: activatorProps }">
			<div v-bind="activatorProps" style="width: 500px">
				<div v-if="isEditable">
					<div v-if="isEmpty" class="cursor-pointer empty-content">
						Bấm để <v-icon color="success" size="small">mdi-pencil</v-icon> soạn nội dung...
					</div>
					<div v-else ref="contentContainer" class="cursor-pointer uc-latex-edit" v-html="renderedContent" />
				</div>
				<div v-else>
					<div ref="contentContainer" class="uc-latex-edit" v-html="renderedContent" />
				</div>
			</div>
		</template>

		<template v-slot:default="{ isActive }">
			<v-card title="Chỉnh sửa nội dung">
				<v-card-text>
					<f-editor v-model="contentEditor" :imageapi="vueData.v_Set.apiImageAdapter" variant="outlined"
						rows="6" auto-grow label="Nội dung (hỗ trợ HTML và LaTeX)"
						@update:modelValue="val => console.log('upd', val)" @input="v => console.log('v', v)" />
					<!-- Preview -->
					<div class="preview-section mt-4">
						<label class="text-subtitle-2 mb-2">Xem trước:</label>
						<div class="preview-content uc-latex-edit">
							<div v-if="previewEmpty" class="text-grey">
								<em>Không có nội dung...</em>
							</div>
							<div v-else ref="previewContainer" v-html="previewContent"></div>
						</div>
					</div>
				</v-card-text>

				<v-card-actions>
					<v-spacer></v-spacer>
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
			this.loadMathJax()
		},
		methods: {
			loadMathJax() {
				if (!window.MathJax) {
	
					const script = document.createElement('script')
					script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-mml-chtml.min.js'
					script.onload = () => {
						this.configureMathJax()
						this.renderContent(this.content)
					}
					document.head.appendChild(script)
				} else {
					console.log("đã loà MathJAX");
					this.renderContent(this.content)
				}
			},
	
			configureMathJax() {
				window.MathJax = {
					tex: {
						inlineMath: [['$', '$'], ['\\(', '\\)']],
						displayMath: [['$$', '$$'], ['\\[', '\\]']]
					},
					svg: {
						fontCache: 'global'
					}
				}
			},
	
			renderContent(content) {
				if (!content) {
					this.renderedContent = ''
					return
				}
	
				this.renderedContent = content
	
				this.$nextTick(() => {
					if (window.MathJax && window.MathJax.typesetPromise) {
						window.MathJax.typesetPromise([this.$refs.contentContainer])
							.catch(err => console.error('MathJax render error:', err))
					}
				})
			},
	
			renderPreview(content) {
				if (!content) {
					this.previewContent = ''
					return
				}
	
				this.previewContent = content
	
				this.$nextTick(() => {
					if (window.MathJax && window.MathJax.typesetPromise && this.$refs.previewContainer) {
						window.MathJax.typesetPromise([this.$refs.previewContainer])
							.catch(err => console.error('MathJax preview error:', err))
					}
				})
			},
	
			saveContent(isActive) {
				this.$emit('update:content', this.contentEditor)
				isActive.value = false
			},
	
			cancelEdit(isActive) {
				this.contentEditor = this.content
				isActive.value = false
			}
		}
	}
</script>

<style scoped>
	.uc-latex-edit {
		line-height: 1.6;
		word-wrap: break-word;
		min-height: 20px;
	}

	.cursor-pointer {
		cursor: pointer;
	}

	.empty-content {
		padding: 12px;
		border: 2px dashed #e0e0e0;
		border-radius: 4px;
		text-align: center;
		color: #666;
		background-color: #fafafa;
	}

	.empty-content:hover {
		border-color: #1976d2;
		background-color: #f3f7ff;
	}

	.preview-content {
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		padding: 16px;
		background-color: #fafafa;
		min-height: 60px;
	}

	.help-content {
		font-size: 0.9rem;
	}

	.help-content code {
		background-color: #f5f5f5;
		padding: 2px 4px;
		border-radius: 3px;
		font-family: 'Courier New', monospace;
	}

	.help-content ul {
		margin-left: 20px;
	}

	.help-content li {
		margin-bottom: 4px;
	}

	/* Style cho các công thức toán */
	.uc-latex-edit :deep(.MathJax) {
		display: inline-block;
		margin: 0 2px;
	}

	.uc-latex-edit :deep(.MathJax_Display) {
		margin: 1em 0;
		text-align: center;
	}

	/* Style cho HTML content */
	.uc-latex-edit :deep(p) {
		margin-bottom: 1em;
	}

	.uc-latex-edit :deep(ul),
	.uc-latex-edit :deep(ol) {
		margin-left: 20px;
		margin-bottom: 1em;
	}

	.uc-latex-edit :deep(h1),
	.uc-latex-edit :deep(h2),
	.uc-latex-edit :deep(h3) {
		margin: 1em 0 0.5em 0;
		font-weight: bold;
	}
</style>