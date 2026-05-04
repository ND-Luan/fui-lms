<template>
	<div class="d-flex justify-center align-center flex-column ga-2 pa-2">
		<v-avatar size="80">
			<v-img :src="urlAvatarHocSinh + item?.HocSinhID" />
		</v-avatar>
		<p class="font-weight-medium  ">{{item.SoDanhBo}} • {{item?.HoTen }}</p>
		<div class="text-caption  ">
			{{item?.HocSinhID}} • {{item?.NgaySinh}}
		</div>
		<v-chip v-if="item.TenTinhTrang" variant="text" class="text-body-2" :color="item.MauTinhTrang">{{item.TenTinhTrang}}</v-chip>
	</div>
</template>

<script>
	export default {
		props: {
			item: {
				type: Object
			}
		},
		data() {
			return {
				urlAvatarHocSinh: vueData.v_Set.urlAvatarHocSinh
			}
		},
		mounted() { },
		computed: {},
		watch: {},
		methods: {},
	}
</script>