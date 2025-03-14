<template>
	<v-list-item :class="item.TenCotDiem_EN === 'Total' ? 'bg-primary' : ''">
		<template v-slot:append>
			<v-chip :color="item.TenCotDiem_EN === 'Total' ? 'white' : 'primary'" size="small" v-if="ketQuaDanhGia">
				{{ ketQuaDanhGia }}
			</v-chip>
			<v-chip color="success" size="small" v-if="item.MaCotDiem.includes('MucDoDanhGia')">
				{{item.KetQuaDanhGia_VI}}
			</v-chip>
		</template>
		<v-list-item-title>
			<p :class="item.TenCotDiem_EN === 'Total' ? 'font-weight-medium ' : ''">{{ item?.TenCotDiem_VI }}</p>
		</v-list-item-title>
		<!-- <v-list-item-subtitle v-if="item.GiaTriCotDiem === 'number'">
			Thang điểm:
			<v-chip size="small">
				{{ item.DiemMin }}
			</v-chip>
			<v-chip class="ml-1" size="small">
				{{ item.DiemMax }}
			</v-chip>
		</v-list-item-subtitle> -->
		<v-list-item-subtitle v-else-if="item.GiaTriCotDiem === 'text' && item.MaCotDiem.includes('NhanXet')" class="noLineClamp">
			{{item.KetQuaDanhGia_VI}}
		</v-list-item-subtitle>
	</v-list-item>
</template>
<script>
	export default {
	    props: {
	        item: {
	            type: Object
	        }
	    },
	    computed: {
	        ketQuaDanhGia: function () {
	            let item = this.item
	            let ketQua = null
	            if (item.LoaiCotDiem === 'Nhập') {
	                //Kiểm tra tồn tại
	                if (!!item.KetQuaDanhGia_VI) ketQua = parseFloat(item.KetQuaDanhGia_VI)
	            }
	            else if (item.LoaiCotDiem === 'Công thức') {
	                ketQua = item.KetQuaDanhGia_VI
	            }
	            return ketQua
	        }
	    }
	}
</script>