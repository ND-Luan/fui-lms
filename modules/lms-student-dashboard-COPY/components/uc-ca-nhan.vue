<template>
	<v-card>
		<v-card-title class="px-2">Học sinh</v-card-title>
		<v-card-text class="px-2 pb-0">
			<v-list-item class="px-0">
				<v-list-item-title>{{ HocSinh?.HoTen }}</v-list-item-title>
				<v-list-item-subtitle>{{ HocSinh?.TenLop }} • {{ HocSinh?.HocSinhID }} </v-list-item-subtitle>
				<template #prepend>
					<v-avatar size="54">
						<v-img :src="vueData.v_Set.urlAvatarHocSinh + vueData.user.UserID" />
					</v-avatar>
				</template>

			</v-list-item>
		</v-card-text>

	</v-card>
	<v-divider />
	<v-list>
		<v-list-subheader style="padding: 0px 8px !important;">Các tính năng khác</v-list-subheader>

		<uc-lich :HocSinh="HocSinh">
			<template #activator="{ activatorProps }">
				<v-list-item class="px-2" v-bind="activatorProps" prepend-icon="mdi-calendar-month"
					title="Thời khóa biểu" />
			</template>
		</uc-lich>
		<v-divider />
		<v-list-item class="px-2" prepend-icon="mdi-book-education-outline" @click="onOpenHocLieuSo">
			Học liệu số
		</v-list-item>
		<v-divider />
		<v-list-item class="px-2" prepend-icon="mdi-trophy-outline" @click="onOpenThanhTich">Thành tích</v-list-item>
		<v-divider />
		<v-list-item class="text-red px-2" prepend-icon="mdi-login" @click="onLogout">Đăng xuất</v-list-item>
	</v-list>
	<p class="position-absolute text-center text-caption w-100 bg-white" style="bottom: 60px;">Version: 1.0</p>
</template>

<script>
	export default {
		props: {
			NienKhoa: Number
		},
		data() {
			return {
				HocSinh: null,
				vueData
			}
		},
		mounted() {
			this.onLoadDetailHocSinh()
		},
		computed: {},
		watch: {},
		methods: {
			onLogout() {
				redirect("https://login.lhbs.vn/")
			},
			onOpenHocLieuSo() {
				openWindow({
					title: "Học liệu số",
					url: `/kham-pha?capid=${this.HocSinh?.CapID}&khoiid=${this.HocSinh?.KhoiID}`
				})
			},
			onOpenThanhTich() {
	
			},
			async onLoadDetailHocSinh() {
				this.HocSinh = await ajaxCALLPromise("lms/HocSinh_Detail_GetBy_HocSinhID", {
					HocSinhID: vueData.user.UserID,
					NienKhoa: this.NienKhoa
				})
			}
		},
	}
</script>