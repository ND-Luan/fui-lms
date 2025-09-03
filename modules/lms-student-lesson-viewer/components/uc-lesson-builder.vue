<template>
	<div class="builder-layout">
		<!-- Cột trái: Thư viện -->
		<div class="builder-sidebar left-sidebar">
			<uc-lesson-component-library @add-element="addElement"></uc-lesson-component-library>
			<!-- {{lesson.elements}} -->
		</div>

		<!-- Cột giữa: Canvas -->
		<div class="builder-canvas" style="overflow: auto; height: calc(100dvh - 16px)">
			<uc-lesson-canvas :elements="lesson.elements" v-model:selected-index="selectedElementIndex"
				@update:elements="updateElements" />
		</div>

		<!-- Cột phải: Thuộc tính và Nút Lưu -->
		<div class="builder-sidebar right-sidebar">
			<uc-lesson-properties v-model:lesson-header="lesson" :element="selectedElement"
				:index="selectedElementIndex" @update:element="updateElement" />
			<div class="action-buttons">
				<v-btn variant="text" block @click="handleSave(false)">Lưu nháp</v-btn>
				<v-btn color="primary" variant="flat" block @click="handleSave(true)">Lưu và Xuất bản</v-btn>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'uc-lesson-builder',
		props: {
			initialLesson: Object,
			isEditMode: Boolean,
			onSave: { type: Function, default: () => { } }
		},
		emits: ['update:initialLesson'],
		data() {
			return {
				vueData,
				lesson: { elements: [] },
				selectedElementIndex: null
			}
		},
		computed: {
			selectedElement() {
				if (this.selectedElementIndex === null || !this.lesson.elements) return null;
				return this.lesson.elements[this.selectedElementIndex];
			}
		},
		watch: {
			initialLesson: {
				handler(newVal) {
					if (newVal) {
						const processedElements = (newVal.elements || []).map(el => {
							try {
								el.ElementData = typeof el.ElementData === 'string' ? JSON.parse(el.ElementData) : (el.ElementData || {});
							} catch (e) {
								console.error("Lỗi parse ElementData:", el.ElementData, e);
								el.ElementData = {};
							}
							return el;
						});
						this.lesson = { ...newVal, elements: processedElements };
					}
				},
				immediate: true,
				deep: true
			}
		},
		methods: {
			addElement(elementInfo) {
				const newElement = {
					LessonID: vueData.LessonID,
					ElementType: elementInfo.type,
					ElementData: JSON.parse(JSON.stringify(elementInfo.defaultData)),
					SortOrder: (this.lesson.elements.length + 1) * 10
				};
				ajaxCALL('lms/EL_Element_Save', newElement, res => {
					// Vue.$toast.success('Thêm nội dung')
					CALL('getLessonData')
					this.selectedElementIndex = this.lesson.elements.length  //- 1;
				})
				// this.lesson.elements.push(newElement);
			},
			updateElements(newElements) {
				this.lesson.elements = newElements;
			},
			updateElement(updatedPayload) {
				const newElements = [...this.lesson.elements];
				if (newElements[updatedPayload.index]) {
					newElements[updatedPayload.index] = updatedPayload.element;
					this.updateElements(newElements);
				}
			},
			handleSave(isPublishing) {
				this.$emit('update:initialLesson', this.lesson);
				this.onSave({ lesson: this.lesson, isPublishing });
			}
		}
	}
</script>