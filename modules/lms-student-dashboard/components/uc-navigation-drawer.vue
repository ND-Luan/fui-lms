<template>
	<div>

		<!-- ══════════════════════ DESKTOP ══════════════════════ -->
		<div v-if="!isMobile" style="width: 100%; display: flex; flex-direction: column; height: 100dvh; overflow: hidden;">
			<div style="display: flex; flex: 1;">

			<v-navigation-drawer permanent width="240" style="
				background: #ffffff;
				border-right: 1px solid #edf0f7;
				box-shadow: 2px 0 16px rgba(0,0,0,0.05);
			">
				<!-- LOGO -->
				<div style="padding: 22px 20px 14px; display: flex; align-items: center; gap: 11px;">
					<div class="logo-box">
						<v-img src="/_cdn/lhbs-lms/SongNgu_logo.png" />
					</div>
					<div>
						<div class="logo-text">LHBS</div>
						<div class="logo-sub">Learning management system</div>
					</div>
				</div>

				<v-divider style="border-color: #edf0f7; margin: 0 16px 14px;" />

				<!-- STUDENT CARD -->
				<div class="student-card">
					<v-avatar size="42" class="student-avatar">
						<v-icon v-if="!avatarStudent" size="24">mdi-account-circle</v-icon>
						<v-img v-else :src="avatarStudent" contain />
					</v-avatar>
					<div style="overflow: hidden; flex: 1;">
						<div class="student-name">{{ studentInfoDetail?.HoTen }}</div>
						<div class="student-meta">{{ studentInfoDetail?.HocSinhID }} · {{ studentInfoDetail?.TenLop }}</div>
					</div>
				</div>

				<!-- NHÓM ĐANG HỌC -->
				<div v-if="studentInfoDetail?.DSNhomDangHoc?.length" class="sidebar-groups">
					<div class="sidebar-groups-label">Nhóm đang học</div>
					<div class="sidebar-groups-chips">
						<div v-for="nhom in studentInfoDetail.DSNhomDangHoc" :key="nhom.TenNhom" class="sp-nhom-item">
							<div class="sp-nhom-mon">{{ nhom.TenMonHoc_HienThi }}</div>
							<div class="sp-nhom-code">{{ nhom.TenNhom }}</div>
						</div>
					</div>
				</div>

				<!-- LABEL -->
				<div class="menu-label">Menu chính</div>

				<!-- MENU ITEMS -->
				<div style="padding: 0 10px;">
					<div v-for="item in desktopMenu.filter(i => i.activeKey !== 7)" :key="item.activeKey"
						@click="onClickItemDesktop(item)" class="menu-item"
						:class="{ 'menu-item--active': item.activeKey === activeKey }">
						<v-icon size="19">{{ item.icon }}</v-icon>
						<span class="menu-item-text">{{ item.title }}</span>
						<span v-if="item.activeKey === activeKey" class="menu-item-dot" />
					</div>
				</div>

				<v-divider style="border-color: #edf0f7; margin: 12px 20px;" />

				<!-- LOGOUT -->
				<div style="padding: 0 10px 16px;">
					<div @click="onClickItemDesktop(desktopMenu.find(i => i.activeKey === 7))" class="logout-btn">
						<v-icon size="19" color="#ef4444">mdi-logout</v-icon>
						<span style="font-size: 13.5px; color: #ef4444;">Đăng xuất</span>
					</div>
				</div>

				<!-- FOOTER -->
				<div class="sidebar-footer">Version {{ version }}</div>

			</v-navigation-drawer>

			<!-- MAIN CONTENT -->
			<div style="background: #f6f8fc; flex: 1; display: flex; flex-direction: column;">

				<!-- TOPBAR slot — parent truyền vào, fallback mặc định -->
				<slot name="topbar">
					<div class="topbar">
						<div class="topbar-title">{{ currentPageTitle }}</div>
						<div style="margin-left: auto;">
							<div class="topbar-date">
								{{ new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) }}
							</div>
						</div>
					</div>
				</slot>

				<div style=" height: calc(100dvh - 56px); overflow-y: auto;">
					<slot />
				</div>
			</div>

			</div>
		</div>

		<!-- ══════════════════════ MOBILE ══════════════════════ -->
		<div v-else style="width: 100%; display: flex; flex-direction: column;">

			<!-- Mobile Header -->
			<div class="mobile-header">
				<div class="logo-box" style="width:32px;height:32px;border-radius:8px;">
					<v-img src="/_cdn/lhbs-lms/SongNgu_logo.png" />
				</div>
				<div>
					<div class="logo-text" style="font-size:14px;">LHBS</div>
					<div class="logo-sub">{{ currentPageTitle }}</div>
				</div>
				<slot name="topbar-mobile" />
				<div style="margin-left: auto;">
					<v-avatar :image="avatarStudent" size="32" class="mobile-avatar">
						<v-icon v-if="!avatarStudent" size="18">mdi-account-circle</v-icon>
					</v-avatar>
				</div>
			</div>

			<!-- Content -->
			<div style="flex: 1; background: #f6f8fc;">
				<div style="height: calc(100dvh - 56px - 62px); overflow: auto;">
					<slot />
				</div>
			</div>

			<!-- Bottom nav -->
			<div class="bottom-nav">
				<div v-for="item in mobileMenu" :key="item.activeKey" @click="updateActiveKey(item.activeKey)"
					class="bottom-nav-item" :class="{ 'bottom-nav-item--active': item.activeKey === activeKey }">
					<v-icon size="22">{{ item.icon }}</v-icon>
					<span class="bottom-nav-label">{{ item.title }}</span>
				</div>
			</div>
		</div>

	</div>
</template>

<script>
export default {
	props: {
		activeKey: Number,
		activeMonHocID: Number,
		avatarStudent: String,
		studentInfoDetail: Object,
		subjectProgress: Array,
		version: String,
		isMobile: Boolean
	},
	data() {
		return {
			menu: [
				{ icon: "mdi-format-list-checkbox", title: "Nhiệm vụ", activeKey: 0 },
				{ icon: "mdi-history", title: "Hoạt động", activeKey: 1 },
				{ icon: "mdi-chart-line", title: "Tiến độ", activeKey: 2 },
				{ icon: "mdi-account-circle", title: "Cá nhân", activeKey: 3, mobileOnly: true },
				{ icon: "mdi-calendar-month", title: "Thời khóa biểu", activeKey: 4, desktopOnly: true },
				{ icon: "mdi-book-education-outline", title: "Học liệu số", activeKey: 5, desktopOnly: true },
				{ icon: "mdi-trophy-outline", title: "Thành tích", activeKey: 6, desktopOnly: true }, 
				{ icon: "mdi-flag-variant", title: "Câu hỏi đã đánh dấu", activeKey: 8, desktopOnly: true }, 
				{ icon: "mdi-logout", title: "Đăng xuất", activeKey: 7, desktopOnly: true },
			],

		}
	},
	computed: {
		desktopMenu() {
			return this.menu.filter(i => !i.mobileOnly)
		},
		mobileMenu() {
			return this.menu.filter(i => !i.desktopOnly)
		},
		currentPageTitle() {
			return this.menu.find(i => i.activeKey === this.activeKey)?.title ?? 'Tổng quan'
		},
	},
	methods: {
		updateActiveKey(activeKey) {
			this.$emit('update:activeKey', activeKey)
		},
		onClickItemDesktop(item) {
			if (!item) return
			if (item.activeKey === 7) {
				window.open("https://login.lhbs.vn/")
				return
			}
			this.$emit('update:activeKey', item.activeKey)
		},
	},
}
</script>