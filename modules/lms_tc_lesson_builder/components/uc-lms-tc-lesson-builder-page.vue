<template>
	<!-- Bọc toàn bộ bằng v-layout để các component layout của Vuetify hoạt động -->
	<v-layout class="fill-height">

		<!-- 1. Thanh App Bar (Header) -->
		<v-app-bar density="compact" flat border>
			<v-text-field :model-value="vueData.lessonData?.Title" @update:model-value="updateLessonTitle"
				hide-details variant="solo-filled" flat placeholder="Nhập tiêu đề bài giảng..."></v-text-field>
			<v-spacer></v-spacer>
			<v-btn :disabled="!vueData.isDirty" :loading="saving" color="primary" @click="saveChanges" class="mr-2">
				<v-icon start>mdi-content-save</v-icon>
				Lưu
			</v-btn>
		</v-app-bar>

		<!-- 2. Cột trái: Thư viện Component (dùng v-navigation-drawer) -->
		<v-navigation-drawer width="240" permanent location="left" class="bg-grey-lighten-5">
			<uc-component-library v-if="vueData" :components="vueData.componentLibrary"
				@componentSelect="handleComponentSelect" />
		</v-navigation-drawer>

		<!-- 3. Cột phải: Bảng thuộc tính (dùng v-navigation-drawer) -->
		<v-navigation-drawer width="320" permanent location="right" class="bg-grey-lighten-5">
			<uc-element-properties :element="selectedElement" @propertyChange="handlePropertyChange" />
		</v-navigation-drawer>

		<!-- 4. Khu vực nội dung chính (Canvas) -->
		<v-main>
			<!-- Thêm một div bọc ngoài với padding -->
			<div class="pa-4">
				<uc-lesson-canvas v-if="vueData" :elements="vueData.elements" :selected-element="selectedElement"
					@elementSelect="handleElementSelect" @elementDelete="$emit('elementDelete', $event)" />
			</div>
		</v-main>

	</v-layout>
</template>

<script>
	export default {
		name: 'uc-lms-tc-lesson-builder-page',
		props: {
	
		},
		emits: ['elementSelect', 'elementDelete', 'elementAdd', 'elementUpdate', 'save'],
	
		data() {
			return {
				saving: false,
				vueData
			}
		},
		computed: {
			selectedElement() {
				if (!vueData || !vueData.elements || !vueData.selectedElementId) {
					return null;
				}
				return vueData.elements.find(el => el.ElementID === vueData.selectedElementId);
			}
		},
		methods: {
			markAsDirty() {
				const updatedData = { ...vueData, isDirty: true };
				this.$emit('update:vueData', updatedData);
			},
			handleComponentSelect(elementType) {
				const newElement = {
					ElementID: 'new_' + Date.now(),
					LessonID: vueData.lessonId, // Truy cập qua prop modelValue
					ElementType: elementType,
					ElementData: '{}',
					SortOrder: (vueData.elements.length + 1) * 10
				};
				this.$emit('elementAdd', newElement)
			},
			handlePropertyChange(key, value) {
				this.$emit('elementUpdate', {
					elementId: vueData.selectedElementId,
					key: key,
					value: value
				});
			},
			saveChanges() {
				this.saving = true;
				this.$emit('save', {
					lessonData: vueData.lessonData,
					elements: vueData.elements
				});
				setTimeout(() => { this.saving = false; }, 1500);
			}
		}
	}
</script>