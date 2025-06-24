<!-- === uc-lop-list === -->
<template>
	<div class="grade-grid">
		<div class="grade-card" v-for="item in danhSachLop" :key="item.LopID" @click="handleClick(item)">
			<div class="grade-number">LỚP {{ item.TenLop }}</div>
			<p>{{ subjectNameDisplay }}</p>
		</div>
	</div>
</template>

<script>
export default {
  name: 'uc-lop-list',
  props: {
    items: { type: Array, default: () => [] },
    selectedmonhoc: { type: Object, default: null },
    // Nhận hàm xử lý từ cha qua prop
    onItemClick: { type: Function, default: () => {} }
  },
  computed: {
    danhSachLop() {
      return this.items || [];
    },
    subjectNameDisplay() {
      if (this.selectedmonhoc && this.selectedmonhoc.TenMonHoc) {
        return this.selectedmonhoc.TenMonHoc;
      }
      return '';
    }
  },
  methods: {
    handleClick(item) {
        if(this.onItemClick) {
            this.onItemClick(item);
        }
    }
  }
}
</script>