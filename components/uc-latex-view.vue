<!-- uc-latex-view.vue -->
<template>
	<div ref="contentContainer" class="uc-latex-view d-flex align-center" v-html="renderedContent" />
</template>

<script>
	export default {
		name: 'uc-latex-view',
		props: {
			content: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				renderedContent: ''
			}
		},
		watch: {
			content: {
				handler(newContent) {
					this.renderContent(newContent)
				},
				immediate: true
			}
		},
		async mounted() {
			await this.setupMathJax()
		},
		methods: {
			setupMathJax() {
				// Đảm bảo MathJax được cấu hình đúng
				if (!window.MathJax) {
					// Cấu hình MathJax từ đầu
					window.MathJax = {
						...window.MathJax,
						tex: {
							inlineMath: [['$', '$'], ['\\(', '\\)']],
							displayMath: [['$$', '$$'], ['\\[', '\\]']]
						},
						options: {
							enableMenu: false,
							enableExplorer: false,
							enableAssistiveMml: false
						},
						startup: {
							ready: () => {
								window.MathJax.startup.defaultReady()
								this.disableAllInteractions()
							}
						}
					}
				} else {
					window.MathJax = {
						...window.MathJax,
						tex: {
							inlineMath: [['$', '$'], ['\\(', '\\)']],
							displayMath: [['$$', '$$'], ['\\[', '\\]']]
						},
						options: {
							enableMenu: false,
							enableExplorer: false,
							enableAssistiveMml: false
						},
						startup: {
							ready: () => {
								window.MathJax.startup.defaultReady()
								this.disableAllInteractions()
							}
						}
					}
					// MathJax đã tồn tại, disable interactions
					this.disableAllInteractions()
				}
			},
	
			disableAllInteractions() {
				// Override MathJax menu functions
				if (window.MathJax && window.MathJax.startup) {
					// Disable context menu completely
					// document.addEventListener('contextmenu', this.preventMathJaxMenu, true)
					// document.addEventListener('click', this.preventMathJaxClick, true)
				}
	
				// Apply CSS to disable pointer events
				this.addDisableStyles()
			},
	
			preventMathJaxMenu(event) {
				const target = event.target
				// if (target.closest('.MathJax') ||
				// 	target.closest('mjx-container') ||
				// 	target.closest('[data-mathml]')) {
				// 	event.preventDefault()
				// 	event.stopPropagation()
				// 	return false
				// }
			},
	
			preventMathJaxClick(event) {
				const target = event.target
				// if (target.closest('.MathJax') ||
				// 	target.closest('mjx-container') ||
				// 	target.closest('[data-mathml]')) {
				// 	event.preventDefault()
				// 	event.stopPropagation()
				// 	return false
				// }
			},
	
			addDisableStyles() {
				// Thêm CSS để disable hoàn toàn interactions
				// if (!document.getElementById('mathjax-disable-styles')) {
				// 	const style = document.createElement('style')
				// 	style.id = 'mathjax-disable-styles'
				// 	style.textContent = `
				// 			.MathJax, .MathJax_Display, mjx-container {
				// 				pointer-events: none !important;
				// 				user-select: none !important;
				// 				-webkit-user-select: none !important;
				// 				-moz-user-select: none !important;
				// 				-ms-user-select: none !important;
				// 				cursor: default !important;
				// 			}
	
				// 			.MathJax *, mjx-container * {
				// 				pointer-events: none !important;
				// 				cursor: default !important;
				// 			}
	
				// 			.MathJax_Menu, .MathJax_MenuFrame, .MathJax_ContextMenu {
				// 				display: none !important;
				// 				visibility: hidden !important;
				// 				opacity: 0 !important;
				// 			}
				// 		`
				// 	document.head.appendChild(style)
				// }
			},
	
			renderContent(content) {
				if (!content) {
					this.renderedContent = ''
					return
				}
	
				this.renderedContent = content
	
				this.$nextTick(() => {
					if (window.MathJax && window.MathJax.typesetPromise && this.$refs.contentContainer) {
						window.MathJax.typesetPromise([this.$refs.contentContainer])
							.then(() => {
								// Đảm bảo disable interactions sau khi render
								this.forceDisableRenderedElements()
							})
							.catch(err => console.error('MathJax render error:', err))
					}
				})
			},
	
			forceDisableRenderedElements() {
				// Force disable trên tất cả elements đã render
				// this.$nextTick(() => {
				// 	const mathElements = this.$refs.contentContainer?.querySelectorAll(
				// 		'.MathJax, .MathJax_Display, mjx-container, [data-mathml]'
				// 	)
	
				// 	if (mathElements) {
				// 		mathElements.forEach(el => {
				// 			el.style.pointerEvents = 'none'
				// 			el.style.userSelect = 'none'
				// 			el.style.cursor = 'default'
	
				// 			// Remove all event listeners
				// 			el.oncontextmenu = (e) => {
				// 				e.preventDefault()
				// 				e.stopPropagation()
				// 				return false
				// 			}
	
				// 			el.onclick = (e) => {
				// 				e.preventDefault()
				// 				e.stopPropagation()
				// 				return false
				// 			}
				// 		})
				// 	}
				// })
			}
		},
	
		beforeUnmount() {
			// Clean up event listeners
			// document.removeEventListener('contextmenu', this.preventMathJaxMenu, true)
			// document.removeEventListener('click', this.preventMathJaxClick, true)
		}
	}
</script>

<style scoped>
	.uc-latex-view {
		position: relative;
	}

	/* Đảm bảo không có interactions */
	.uc-latex-view ::v-deep .MathJax,
	.uc-latex-view ::v-deep .MathJax_Display,
	.uc-latex-view ::v-deep mjx-container {
		pointer-events: none !important;
		user-select: none !important;
		cursor: default !important;
	}
</style>