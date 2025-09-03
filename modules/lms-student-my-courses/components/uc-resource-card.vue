<!-- File: uc-resource-card.vue -->
<template>
	<v-card class="mb-4" @click="goToResource" outlined>
		<v-row no-gutters>
			<!-- Cột trái: Thumbnail hoặc Icon -->
			<v-col cols="auto">
				<v-img :src="imageSrc" @error="onImageError" width="180" height="150" cover class="rounded-l">
					<!-- Hiển thị icon overlay trên ảnh -->
					<div class="fill-height d-flex align-center justify-center"
						style="background-color: rgba(0,0,0,0.2);">
						<v-icon dark size="56">{{ resourceTypeIcon }}</v-icon>
					</div>

					<!-- Slot này sẽ được hiển thị khi ảnh đang tải -->
					<template v-slot:placeholder>
						<v-row class="fill-height ma-0" align="center" justify="center">
							<v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
						</v-row>
					</template>
				</v-img>
			</v-col>

			<!-- Cột phải: Nội dung chi tiết -->
			<v-col>
				<div class="d-flex flex-column fill-height pa-4">
					<div class="flex-grow-1">
						<div class="text-caption grey--text text--darken-1">{{ resource.MonHocName }}</div>
						<h3 class="text-h6 font-weight-bold mb-2">{{ resource.Title }}</h3>
						<p class="text-body-2 grey--text text--darken-2 mb-0">
							{{ resource.Description }}
						</p>
					</div>

					<div class="d-flex align-center mt-3">
						<v-chip :color="resource.IsCompleted ? 'success' : 'grey'" small label
							:outlined="!resource.IsCompleted">
							<v-icon left small>
								{{ resource.IsCompleted ? 'mdi-check-circle' : 'mdi-circle-outline' }}
							</v-icon>
							{{ resource.IsCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành' }}
						</v-chip>
						<v-spacer></v-spacer>
						<span v-if="resource.LastAccessed" class="text-caption grey--text">
							Truy cập lần cuối: {{ formatTimeAgo(resource.LastAccessed) }}
						</span>
					</div>
				</div>
			</v-col>
		</v-row>
	</v-card>
</template>

<script>
	export default {
  name: 'uc-resource-card',
  props: {
    resource: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      // Biến để lưu đường dẫn ảnh, ban đầu sẽ là ảnh từ API
      imageSrc: this.resource.ThumbnailURL,
      // Ảnh mặc định
      defaultImage: '/_cdn/lhbs-lms/homework.png'
    }
  },
  computed: {
    resourceTypeIcon() {
      return this.resource.ResourceType === 'LESSON' ? 'mdi-book-open-variant' : 'mdi-clipboard-text';
    }
  },
  methods: {
    goToResource() {
      const type = this.resource.ResourceType.toLowerCase();
      const id = this.resource.ResourceID;
      window.location.href = `/student/${type}/${id}`;
    },
    // Hàm này sẽ được gọi khi v-img không tải được ảnh từ `imageSrc`
    onImageError() {
      // Chỉ gán lại ảnh mặc định nếu ảnh hiện tại chưa phải là ảnh mặc định
      // để tránh vòng lặp vô hạn nếu ảnh mặc định cũng bị lỗi
      if (this.imageSrc !== this.defaultImage) {
        this.imageSrc = this.defaultImage;
      }
    },
    formatTimeAgo(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now - date) / 1000);

      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + " năm trước";
      
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + " tháng trước";

      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + " ngày trước";
      
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + " giờ trước";
      
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + " phút trước";
      
      return "vài giây trước";
    }
  },
  // Theo dõi sự thay đổi của prop resource
  watch: {
    'resource.ThumbnailURL': {
      handler(newVal) {
        // Nếu prop resource thay đổi, cập nhật lại imageSrc
        // Nếu newVal là null hoặc undefined, dùng ảnh mặc định ngay lập tức
        this.imageSrc = newVal || this.defaultImage;
      },
      immediate: true // Chạy ngay khi component được tạo
    }
  }
}
</script>

<style scoped>
	.v-card {
		transition: all 0.2s ease-in-out;
		cursor: pointer;
	}

	.v-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12) !important;
	}

	/* Đảm bảo nội dung không bị tràn khi tiêu đề quá dài */
	.v-card-title {
		font-size: 1.1rem;
		line-height: 1.4rem;
		word-break: break-word;
		/* Hoặc 'break-all' tùy theo yêu cầu */
	}

	/* Cắt ngắn mô tả nếu nó quá dài, hiển thị dấu "..." */
	.text-body-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		/* Số dòng tối đa */
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
		min-height: 40px;
		/* Đảm bảo chiều cao tối thiểu ngay cả khi text ngắn */
	}
</style>