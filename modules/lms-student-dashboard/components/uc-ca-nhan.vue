<template>
	<div class="sp-wrap">

		<!-- ── PROFILE HERO ── -->
		<div class="sp-hero">
			<div class="sp-hero-bg">
				<div class="sp-hero-orb"></div>
			</div>

			<div class="sp-profile">
				<div class="sp-avatar-wrap">
					<v-avatar size="64" class="sp-avatar">
						<v-img :src="vueData.v_Set.urlAvatarHocSinh + HocSinh?.HocSinhID" />
					</v-avatar>
					<div class="sp-avatar-ring"></div>
				</div>

				<div class="sp-profile-info">
					<div class="sp-name">{{ HocSinh?.HoTen || '…' }}</div>
					<div class="sp-meta">
						<span class="sp-meta-chip">
							<v-icon size="10">mdi-school-outline</v-icon>
							{{ HocSinh?.TenLop }}
						</span>
						<span class="sp-meta-id">{{ HocSinh?.HocSinhID }}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- ── NHÓM ĐANG HỌC ── -->
		<div v-if="HocSinh?.DSNhomDangHoc?.length" class="sp-groups">
			<div class="sp-section-label">Nhóm đang học</div>
			<div class="sp-groups-chips">
				<div
					v-for="nhom in HocSinh.DSNhomDangHoc"
					:key="nhom.TenNhom"
					class="sp-nhom-item"
				>
					<div class="sp-nhom-mon">{{ nhom.TenMonHoc_HienThi }}</div>
					<div class="sp-nhom-code">{{ nhom.TenNhom }}</div>
				</div>
			</div>
		</div>

		<!-- ── MENU ── -->
		<div class="sp-menu">
			<div class="sp-section-label">Tính năng</div>

			<!-- Thời khóa biểu -->
			<uc-lich :HocSinh="HocSinh" :isMobile>
				<template #activator="{ activatorProps }">
					<div class="sp-item" v-bind="activatorProps">
						<div class="sp-item-icon sp-item-icon--primary">
							<v-icon size="18" color="white">mdi-calendar-month</v-icon>
						</div>
						<div class="sp-item-body">
							<div class="sp-item-title">Thời khóa biểu</div>
							<div class="sp-item-sub">Lịch học theo tuần</div>
						</div>
						<v-icon size="16" class="sp-item-arrow">mdi-chevron-right</v-icon>
					</div>
				</template>
			</uc-lich>

			<!-- Học liệu số -->
			<div class="sp-item" @click="onOpenHocLieuSo">
				<div class="sp-item-icon sp-item-icon--teal">
					<v-icon size="18" color="white">mdi-book-education-outline</v-icon>
				</div>
				<div class="sp-item-body">
					<div class="sp-item-title">Học liệu số</div>
					<div class="sp-item-sub">Tài liệu & bài giảng</div>
				</div>
				<v-icon size="16" class="sp-item-arrow">mdi-chevron-right</v-icon>
			</div>

			<!-- Thành tích -->
			<uc-achievement-card :HocSinh="HocSinh">
				<template #activator="{ activatorProps }">
					<div class="sp-item" v-bind="activatorProps">
						<div class="sp-item-icon sp-item-icon--amber">
							<v-icon size="18" color="white">mdi-trophy-outline</v-icon>
						</div>
						<div class="sp-item-body">
							<div class="sp-item-title">Thành tích</div>
							<div class="sp-item-sub">Huy hiệu & danh hiệu</div>
						</div>
						<v-icon size="16" class="sp-item-arrow">mdi-chevron-right</v-icon>
					</div>
				</template>
			</uc-achievement-card>
		</div>

		<!-- ── FOOTER ── -->
		<div class="sp-footer">
			<div class="sp-logout" @click="onLogout">
				<v-icon size="16" color="error">mdi-logout</v-icon>
				<span>Đăng xuất</span>
			</div>
			<div class="sp-version">v{{version}}</div>
		</div>

	</div>
</template>

<script>
	export default {
		props: {
			NienKhoa: Number,
			HocSinh: Object,
			version: String,
			isMobile: Boolean
		},
		data() {
			return {
				vueData
			}
		},
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
		}
	}
</script>