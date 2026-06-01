<template>
	<div>
		<GlobalLoading />
		<GlobalApiErrorDialog />
		<GlobalStaleDataBanner />
		<GlobalUiSnackbar ref="snackbarRef" />
		<GlobalIframeWindow ref="iframeWin" />
		<GlobalConfirmDialog ref="confirmRef" />
		<uc-ticket-fab v-if="!isInIframe" />
		<uc-ticket-status v-if="!isInIframe" />
		<v-responsive>
			<v-app theme="light">
				<GlobalNavigationDrawer v-if="hasNavigation" v-model:activeKey="currentNavigationKey"
					v-model:activeModuleCode="currentModuleCode" :permissions="resolvedPermissions"
					:roles="resolvedRoles" :userInfo="resolvedUserInfo" :avatarUrl="resolvedAvatarUrl"
					:schoolName="schoolName" :version="version" :isMobile="isMobile" :menuLeft="resolvedMenuLeft">
					<template #topbar>
						<div ref="headerRef">
							<slot name="header" />
						</div>
					</template>
					<template #topbar-mobile>
						<slot name="header-mobile" />
					</template>
					<v-container fluid class="pa-0">
						<slot />
					</v-container>
				</GlobalNavigationDrawer>

				<template v-else>
					<div ref="headerRef">
						<slot name="header" />
					</div>
					<v-main>
						<v-container fluid class="pa-0">
							<slot />
						</v-container>
					</v-main>
				</template>
			</v-app>
		</v-responsive>
	</div>
</template>

<script>
	export default {
		name: "Global",
		inject: ['iframeRef', 'snackbarRef', 'confirmRef'],
		props: {
			navigation: {
				type: Boolean,
				default: null
			},
			// isTest = true: ẩn drawer, dùng khi module khác nhúng vào mà không muốn hiện nav
			isTest: {
				type: Boolean,
				default: false
			},
			permissions: {
				type: Array,
				default: null
			},
			userInfo: {
				type: Object,
				default: null
			},
			roles: {
				type: Array,
				default: null
			},
			avatarUrl: {
				type: String,
				default: ''
			},
			activeKey: {
				type: [Number, String],
				default: null
			},
			activeModuleCode: {
				type: String,
				default: ''
			},
			schoolName: {
				type: String,
				default: 'LMS Nhà trường'
			},
			version: {
				type: String,
				default: ''
			},
			// Truyền thẳng menuLeft nếu cần override, không truyền thì tự lấy từ vueData
			menuLeft: {
				type: Array,
				default: null
			}
		},
		emits: ['navigate', 'update:activeKey', 'update:activeModuleCode'],
		data() {
			return {
				headerHeight: 0,
				isInIframe: window !== window.top,
				internalActiveKey: this.activeKey,
				internalActiveModuleCode: this.activeModuleCode,
			}
		},
		computed: {
			isMobile() {
				return this.$vuetify?.display?.mobile || false
			},
			resolvedPermissions() {
				return this.permissions
					|| window.vueData?.permissions?.modules
					|| window.vueData?.myPermissions?.modules
					|| window.vueData?.modules
					|| []
			},
			resolvedUserInfo() {
				return this.userInfo || window.vueData?.user || {}
			},
			resolvedRoles() {
				return this.roles
					|| this.resolvedUserInfo?.roles
					|| this.resolvedUserInfo?.Roles
					|| []
			},
			resolvedAvatarUrl() {
				return this.avatarUrl
					|| this.resolvedUserInfo?.avatarUrl
					|| this.resolvedUserInfo?.AvatarUrl
					|| ''
			},
			resolvedMenuLeft() {
				return this.menuLeft
					|| window.vueData?.menuLeft
					|| []
			},
			hasNavigation() {
				if (this.isTest) return true // ← isTest ẩn drawer
				if (this.navigation !== null) return this.navigation // ← prop tường minh
				// return window.vueData?.user?.UserID === 'NA0000022' // ← fallback cũ
			},
			currentNavigationKey: {
				get() {
					return this.activeKey ?? this.internalActiveKey
				},
				set(value) {
					this.internalActiveKey = value
					this.$emit('update:activeKey', value)
				}
			},
			currentModuleCode: {
				get() {
					return this.activeModuleCode || this.internalActiveModuleCode
				},
				set(value) {
					this.internalActiveModuleCode = value
					this.$emit('update:activeModuleCode', value)
				}
			}
		},
		watch: {
			activeKey(value) {
				this.internalActiveKey = value
			},
			activeModuleCode(value) {
				this.internalActiveModuleCode = value
			}
		},
		mounted() {
			this.observer = new ResizeObserver(entries => {
				this.headerHeight = entries[0].contentRect.height
			})
			if (this.$refs.headerRef) {
				this.observer.observe(this.$refs.headerRef)
			}
	
			this.iframeRef.value = this.$refs.iframeWin
			this.snackbarRef.value = this.$refs.snackbarRef
			this.confirmRef.value = this.$refs.confirmRef
		},
		beforeUnmount() {
			this.observer?.disconnect()
		}
	}
</script>