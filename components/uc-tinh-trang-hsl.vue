<template>
	<div v-if="!isMonHoc" class="d-flex  align-center justify-center my-2 ga-2 text-body-2">
		<template v-for="(item, index) in List_TinhTrang">
			<v-badge :color="item.MauTinhTrang" :content="item.Content" inline></v-badge>
			<p :class="'text-' + item.MauTinhTrang">{{ item.TenTinhTrang }}</p>
			<v-divider v-if="index !== List_TinhTrang.length - 1" vertical></v-divider>
		</template>
	</div>
	<div v-else>
		<v-row v-for="(itemMonHoc, indexMonHoc) in List_MonHoc_TinhTrang">
			<v-col cols="12">
				<p class="font-weight-medium text-title">{{ itemMonHoc.TenMonHoc_HienThi }}</p>
			</v-col>
			<v-col cols="12">
				<v-row>
					<v-col v-for="(item, index) in itemMonHoc.List_TinhTrang"
						class="d-flex justify-center align-center">
						<v-badge :color="item.MauTinhTrang" :content="item.Content" inline></v-badge>
						<p :class="'text-' + item.MauTinhTrang">{{ item.TenTinhTrang }}</p>
					</v-col>
				</v-row>
			</v-col>
			<v-divider v-if="indexMonHoc !== List_MonHoc_TinhTrang.length - 1" class="my-2 mx-2"></v-divider>
		</v-row>
	</div>
</template>

<script>
export default {
	props: {
		modelValue: {
			type: Array
		},
		isMonHoc: {
			type: Boolean
		}
	},
	data() {
		return {
			list_TinhTrang: [
				{ TinhTrang: 0, TenTinhTrang: 'Chưa lưu', MauTinhTrang: '' },
				{ TinhTrang: 1, TenTinhTrang: 'Lưu tạm', MauTinhTrang: 'light-green-lighten-1' },
				{ TinhTrang: 2, TenTinhTrang: 'GVBM gửi điểm', MauTinhTrang: 'orange' },
				{ TinhTrang: 3, TenTinhTrang: 'GVCN từ chối điểm GVBM', MauTinhTrang: 'error' },
				{ TinhTrang: 4, TenTinhTrang: 'GVCN gửi điểm', MauTinhTrang: 'primary' },
				{ TinhTrang: 5, TenTinhTrang: 'Tổ trưởng từ chối GVCN', MauTinhTrang: 'error' },
				{ TinhTrang: 6, TenTinhTrang: 'Tổ trưởng gửi BGH', MauTinhTrang: 'primary' },
				{ TinhTrang: 7, TenTinhTrang: 'BGH từ chối Tổ trưởng', MauTinhTrang: 'error' },
				{ TinhTrang: 8, TenTinhTrang: 'BGH duyệt (Công bố phụ huynh)', MauTinhTrang: 'success' }
			]
		}
	},
	computed: {
		List_TinhTrang: function () {
			const _list_TinhTrang = _.cloneDeep(this.list_TinhTrang)
			for (var item of _list_TinhTrang) {
				item.Content = this.modelValue.filter(x => x.TinhTrang === item.TinhTrang).length
			}
			return _list_TinhTrang
		},
		List_MonHoc_TinhTrang() {
			const _list_TinhTrang = _.cloneDeep(this.list_TinhTrang);
			const firstStudent = this.modelValue[0];
			const listMonHoc = [];

			if (firstStudent) {
				const DSMonHoc = firstStudent?.DSCotDiem || [];
				const uniqueMonHocNhom = [...new Set(DSMonHoc.map(x => `${x.MonHocID}_${x.MaNhomCotDiem}`))];

				for (const monHocNhom of uniqueMonHocNhom) {
					const [MonHocID, MaNhomCotDiem] = monHocNhom.split("_");
					console.log(MonHocID, MaNhomCotDiem);
					const List_TinhTrang = _list_TinhTrang.map(tinhTrang => {
						// Đếm số lượng học sinh có ít nhất một điểm với MonHocID & MaNhomCotDiem ở trạng thái TinhTrang này
						const count = this.modelValue.filter(hocSinh =>
							hocSinh.DSCotDiem.some(x =>
								x.MonHocID === MonHocID &&
								x.MaNhomCotDiem === MaNhomCotDiem &&
								x.TinhTrang === tinhTrang.TinhTrang
							)
						).length;

						return { ...tinhTrang, Content: count };
					});

					const existMonHoc = DSMonHoc.find(x => x.MonHocID === MonHocID && x.MaNhomCotDiem === MaNhomCotDiem);
					if (existMonHoc) {
						listMonHoc.push({
							MonHocID,
							MaNhomCotDiem,
							TenHienThi_MonHoc: existMonHoc.TenHienThi_MonHoc,
							List_TinhTrang
						});
					}
				}
			}

			return listMonHoc;
		}

	}
}
</script>