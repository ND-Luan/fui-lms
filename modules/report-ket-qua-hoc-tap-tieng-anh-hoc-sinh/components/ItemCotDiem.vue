<template>
	<v-list-item :class="DSCotDiem_Final.includes(item.TenCotDiem_VI) ? 'bg-primary' : ''">
		<template v-slot:append>
			<v-chip v-if="(item.KetQuaDanhGia_VI || item.KetQuaDanhGia_EN) && item.MaCotDiem.includes('MucDoDanhGia')"
				:color="DSCotDiem_Final.includes(item.TenCotDiem_VI) ? 'white' : 'success'">
				{{ IsLanguage ? item.KetQuaDanhGia_EN : item.KetQuaDanhGia_VI }}
			</v-chip>

			<v-chip
				v-if="(item.KetQuaDanhGia_VI || item.KetQuaDanhGia_EN) && !item.MaCotDiem.includes('NhanXet') && !item.MaCotDiem.includes('MucDoDanhGia')"
				:color="DSCotDiem_Final.includes(item.TenCotDiem_VI) ? 'white' : 'success'">
				{{ IsLanguage ? item.KetQuaDanhGia_EN : item.KetQuaDanhGia_VI }}
			</v-chip>
		</template>
		<v-list-item-title :class="DSCotDiem_Final.includes(item.TenCotDiem_VI) ? 'font-weight-medium ' : ''">
			{{ IsLanguage ? item?.TenCotDiem_EN : item?.TenCotDiem_VI }}
		</v-list-item-title>
		<v-list-item-subtitle v-if="item.MaCotDiem.includes('NhanXet')"
			class="text-black text-body-2 font-weight-medium"
			style="-webkit-line-clamp: unset; opacity: 1 !important; line-height: 1.425 !important;">
			<v-icon class="mr-2" color="orange">mdi-pencil</v-icon>
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
		data() {
			const IsLanguage = localStorage.getItem('IsLanguage')
			return {
				DSCotDiem_Final: ['Total', 'DiemCK', 'DiemGK'],
				IsLanguage: IsLanguage ? JSON.parse(IsLanguage) : false
			};
		}
	}
</script>