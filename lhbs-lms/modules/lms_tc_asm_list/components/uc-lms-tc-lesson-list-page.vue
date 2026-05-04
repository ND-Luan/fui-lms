<!-- file: uc-lms-tc-lesson-list-page.vue (Phiên bản cuối cùng) -->
<template>
	<div class="pa-4">
		<!-- Header và Nút hành động -->
		<div class="d-flex align-center mb-4">
			<h1 class="text-h4">Bài giảng của tôi</h1>
			<v-spacer></v-spacer>
			<!-- Khi click, sẽ emit sự kiện 'create' -->
			<v-btn color="primary" @click="$emit('create')">
				<v-icon start>mdi-plus-circle</v-icon>
				Tạo bài giảng mới
			</v-btn>
		</div>

		<!-- Thanh Filter -->
		<v-card class="mb-4 pa-4" variant="outlined">
			<v-row align="center">
				<v-col cols="12" md="6">
					<v-text-field v-model="filters.searchTerm" label="Tìm theo tiêu đề" prepend-inner-icon="mdi-magnify"
						hide-details clearable @update:modelValue="$emit('filterChange', filters)"
						@click:clear="clearSearch"></v-text-field>
				</v-col>
				<v-col cols="12" md="3">
					<v-select v-model="filters.status" :items="statusOptions" label="Trạng thái" hide-details clearable
						@update:modelValue="$emit('filterChange', filters)"></v-select>
				</v-col>
			</v-row>
		</v-card>

		<!-- Hiển thị Loading hoặc danh sách bài giảng -->
		<div v-if="loading" class="text-center pa-10">
			<v-progress-circular indeterminate color="primary"></v-progress-circular>
		</div>
		<div v-else>
			<!-- Grid hiển thị các bài giảng -->
			<v-row v-if="items && items.length > 0">
				<v-col v-for="lesson in items[0]" :key="lesson.LessonID" cols="12" sm="6" md="4" lg="3">
					<uc-lesson-card :lesson="lesson" @edit="$emit('edit', lesson)" @assign="$emit('assign', lesson)"
						@delete="$emit('delete', lesson)" />
				</v-col>
			</v-row>
			<!-- Thông báo khi không có dữ liệu -->
			<v-alert v-else type="info" variant="tonal" class="mt-4">
				Không tìm thấy bài giảng nào. Hãy tạo một bài giảng mới!
			</v-alert>
		</div>

		<!-- Thanh Phân trang -->
		<v-pagination v-if="totalPages > 1" v-model="pagination.page" :length="totalPages" :total-visible="7"
			class="mt-6" @update:modelValue="$emit('pageChange', pagination.page)"></v-pagination>
	</div>
</template>

<script>
	export default {
    name: 'uc-lms-tc-lesson-list-page',
    props: {
        items: { type: Array, default: () => [] },
        loading: { type: Boolean, default: false },
        pagination: { type: Object, default: () => ({ page: 1, pageSize: 12 }) },
        totalItems: { type: Number, default: 0 }
    },
    // Khai báo tất cả các sự kiện mà component này sẽ phát ra
    emits: ['create', 'edit', 'assign', 'delete', 'filterChange', 'pageChange'],
    data() {
        return {
            filters: {
                searchTerm: '',
                status: null
            },
            statusOptions: [
                { title: 'Đang soạn thảo', value: 1 },
                { title: 'Đã xuất bản', value: 2 },
                { title: 'Lưu trữ', value: 3 }
            ]
        }
    },
    computed: {
        totalPages() {
            if (!this.totalItems || !this.pagination.pageSize) return 0;
            return Math.ceil(this.totalItems / this.pagination.pageSize);
        }
    },
    methods: {
        clearSearch() {
            this.filters.searchTerm = '';
            this.$emit('filterChange', this.filters);
        }
    }
}
</script>