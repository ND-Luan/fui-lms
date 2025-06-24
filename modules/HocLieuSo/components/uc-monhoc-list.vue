<!-- === uc-monhoc-list === -->
<template>
	<div class="grid">
		<div class="card" v-for="item in danhSachMonHoc" :key="item.MonHocID" @click="handleClick(item)">
			<div class="card-header">
				<div class="card-icon math-icon">📊</div>
				<div>
					<div class="card-title">{{ item.TenMonHoc }}</div>
					<div class="card-subtitle">Khám phá tri thức</div>
				</div>
			</div>
			<p>Các bài giảng sinh động và bài tập thực hành phong phú.</p>
		</div>
	</div>
</template>

<script>
export default {
  name: 'uc-monhoc-list',
  props: {
    items: { type: Array, default: () => [] },
    // Nhận hàm xử lý từ cha qua prop
    onItemClick: { type: Function, default: () => {} }
  },
  computed: {
    danhSachMonHoc() {
      return this.items || [];
    }
  },
  methods: {
    handleClick(item) {
        // Kiểm tra và gọi hàm từ prop
        if(this.onItemClick) {
            this.onItemClick(item);
        }
    }
  }
}
</script>