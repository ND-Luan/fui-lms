<template>
	<v-dialog max-width="900">
		<template v-slot:activator="{ props: activatorProps }">
			<div v-bind="activatorProps" style="width: 500px">
				<div v-if="isEditable">
					<div v-if="isEmpty" class="cursor-pointer empty-content">
						{{ $t('message.ClickTo') }} <v-icon color="success" size="small">mdi-pencil</v-icon> {{
						$t('message.EditContentShort') }}
					</div>
					<div v-else ref="contentContainer" class="cursor-pointer uc-latex-edit" v-html="renderedContent"
						style="word-break: auto-phrase;" />
				</div>
				<div v-else ref="contentContainer" class="uc-latex-edit" v-html="renderedContent" />
			</div>
		</template>

		<template v-slot:default="{ isActive }">
			<v-card :title="$t('message.EditContent')">
				<v-card-text>
					<f-editor v-model="contentEditor" :imageapi="vueData.v_Set.apiImageAdapter" variant="outlined"
						rows="6" auto-grow :label="$t('message.ContentHtmlLatex')"
						@update:modelValue="val => console.log('upd', val)" @input="v => console.log('v', v)" />
					<!-- Preview -->
					<div class="preview-section mt-4">
						<label class="text-subtitle-2 mb-2">{{ $t('message.Preview') }}</label>
						<div class="preview-content uc-latex-edit">
							<div v-if="previewEmpty" class="text-grey">
								<em>{{ $t('message.NoContent') }}</em>
							</div>
							<div v-else ref="previewContainer" v-html="previewContent" style="word-break: auto-phrase;">
							</div>
						</div>
					</div>
				</v-card-text>

				<v-card-actions>
					<v-spacer />
					<v-btn :text="$t('message.Cancel')" variant="text" @click="cancelEdit(isActive)"></v-btn>
					<v-btn :text="$t('message.Save')" color="primary" @click="saveContent(isActive)"></v-btn>
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
			this.$i18n.locale = (localStorage.getItem('IsLanguage') && localStorage.getItem('IsLanguage') == 'true') ? 'en' : 'vi'
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