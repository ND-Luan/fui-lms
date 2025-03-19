<template>
	<div class="d-flex align-center justify-center my-2 ga-2 text-body-2">
		<template v-for="(item, index) in List_TinhTrang">
			<v-badge :color="item.MauTinhTrang" :content="item.Content" inline></v-badge>
			<p :class="'text-'+item.MauTinhTrang">{{item.TenTinhTrang}}</p>
			<v-divider v-if="index !== List_TinhTrang.length - 1" vertical></v-divider>
		</template>
	</div>
</template>

<script>
	export default {
		props: {
			modelValue: {
				type: Array
			}
		},
		computed: {
			List_TinhTrang: function () {
				console.log('modelValue', this.modelValue)
				const list_TinhTrang = [
					{ TinhTrang: 0, TenTinhTrang: 'Chưa lưu', MauTinhTrang: '' },
					{ TinhTrang: 1, TenTinhTrang: 'Lưu tạm', MauTinhTrang: 'yellow' },
					{ TinhTrang: 2, TenTinhTrang: 'GVBM gửi điểm', MauTinhTrang: 'orange' },
					{ TinhTrang: 3, TenTinhTrang: 'GVCN từ chối điểm GVBM', MauTinhTrang: 'error' },
					{ TinhTrang: 4, TenTinhTrang: 'GVCN gửi điểm', MauTinhTrang: 'primary' },
					{ TinhTrang: 5, TenTinhTrang: 'Tổ trưởng từ chối GVCN', MauTinhTrang: 'error' },
					{ TinhTrang: 6, TenTinhTrang: 'Tổ trưởng gửi BGH', MauTinhTrang: 'primary' },
					{ TinhTrang: 7, TenTinhTrang: 'BGH từ chối Tổ trưởng', MauTinhTrang: 'error' },
					{ TinhTrang: 8, TenTinhTrang: 'BGH duyệt (Công bố phụ huynh)', MauTinhTrang: 'success' }
				]
				for (var item of list_TinhTrang) {
					item.Content = this.modelValue.filter(x => x.TinhTrang === item.TinhTrang).length
				}
				return list_TinhTrang
			}
		}
	}
</script>