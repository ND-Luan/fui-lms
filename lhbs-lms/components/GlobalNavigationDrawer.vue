<template>
	<v-layout class="global-nav-layout">
		<!-- ── Desktop drawer ── -->
		<v-navigation-drawer v-if="!isMobile" class="global-nav-drawer" :rail="rail" :width="drawerWidth" permanent>
			<!-- Avatar + tên -->
			<div class="global-nav-header">
				<v-avatar size="42" class="global-nav-avatar" color="primary">
					<v-img v-if="avatarUrl" :src="avatarUrl" />
					<span v-else>{{ userInitials }}</span>
				</v-avatar>
				<div v-if="!rail" class="global-nav-user">
					<div class="global-nav-name">{{ displayName }}</div>
					<div class="global-nav-meta">{{ activeRoleLabel }}</div>
				</div>
				<v-btn class="global-nav-rail-btn" :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
					size="x-small" variant="text" @click="rail = !rail" />
			</div>

			<v-divider />

			<!-- Role switcher — chỉ hiện khi có nhiều hơn 1 role và không thu gọn -->
			<div v-if="!rail && switchableRoles.length > 1" class="global-nav-role-tabs">
				<v-chip-group v-model="activeRoleIndex" mandatory selected-class="global-nav-role-chip--active"
					class="global-nav-role-chipgroup">
					<v-chip v-for="(role, index) in switchableRoles" :key="role.code" :value="index" size="small"
						variant="tonal" color="primary" class="global-nav-role-chip">
						{{ role.label }}
					</v-chip>
				</v-chip-group>
			</div>

			<v-divider v-if="!rail && switchableRoles.length > 1" />

			<!-- Menu list -->
			<v-list class="global-nav-list" density="compact" nav>
				<template v-for="item in visibleItems" :key="item.code || item.key">
					<!-- Item có submenu -->
					<v-list-group v-if="item.submenu && item.submenu.length" :value="item.code || item.key">
						<template #activator="{ props }">
							<v-list-item v-bind="props" :prepend-icon="item.icon || 'mdi-apps'"
								:title="getItemTitle(item)" :active="isGroupActive(item)" color="primary"
								rounded="lg" />
						</template>

						<v-list-item v-for="child in item.submenu" :key="child.url || child.key || child.name"
							:title="getItemTitle(child)" :active="isCurrentRoute(child)" color="primary" rounded="lg"
							class="global-nav-subitem" @click="navigateTo(child)" />
					</v-list-group>

					<!-- Item thường -->
					<v-list-item v-else :active="isActive(item)" :prepend-icon="item.icon || 'mdi-apps'"
						:title="getItemTitle(item)" :value="item.code || item.key" color="primary" rounded="lg"
						@click="selectItem(item)">
						<template v-if="!rail && item.badge" #append>
							<v-chip size="x-small" color="primary" variant="tonal">{{ item.badge }}</v-chip>
						</template>
					</v-list-item>
				</template>
			</v-list>

			<!-- Truy cập nhanh -->
			<div v-if="!rail && quickModules.length" class="global-nav-section">
				<div class="global-nav-section-label">Truy cập nhanh</div>
				<div class="global-nav-chips">
					<v-chip v-for="module in quickModules" :key="module.moduleCode || module.code"
						:color="activeModuleCode === (module.moduleCode || module.code) ? 'primary' : undefined"
						:variant="activeModuleCode === (module.moduleCode || module.code) ? 'flat' : 'tonal'"
						size="small" @click="selectModule(module)">
						{{ getItemTitle(module, true) }}
					</v-chip>
				</div>
			</div>

			<template #append>
				<div class="global-nav-footer">
					<v-icon size="16" color="primary">mdi-school-outline</v-icon>
					<span v-if="!rail">{{ schoolName }}{{ versionText }}</span>
				</div>
			</template>
		</v-navigation-drawer>

		<!-- ── Main content ── -->
		<v-main class="global-nav-main">
			<div v-if="!isMobile" class="global-nav-topbar">
				<slot name="topbar" />
			</div>

			<div v-else class="global-nav-mobile">
				<div class="global-nav-mobile-head">
					<v-btn icon="mdi-menu" variant="text" size="small" @click="mobileDrawer = true" />
					<div class="global-nav-mobile-title">
						{{ activeItem ? getItemTitle(activeItem) : schoolName }}
					</div>
					<slot name="topbar-mobile" />
				</div>
			</div>

			<div class="global-nav-content">
				<slot />
			</div>
		</v-main>

		<!-- ── Mobile drawer ── -->
		<v-navigation-drawer v-if="isMobile" v-model="mobileDrawer" class="global-nav-drawer" temporary
			:width="drawerWidth">
			<div class="global-nav-header">
				<v-avatar size="42" class="global-nav-avatar" color="primary">
					<v-img v-if="avatarUrl" :src="avatarUrl" />
					<span v-else>{{ userInitials }}</span>
				</v-avatar>
				<div class="global-nav-user">
					<div class="global-nav-name">{{ displayName }}</div>
					<div class="global-nav-meta">{{ activeRoleLabel }}</div>
				</div>
			</div>

			<v-divider />

			<!-- Role switcher mobile -->
			<div v-if="switchableRoles.length > 1" class="global-nav-role-tabs">
				<v-chip-group v-model="activeRoleIndex" mandatory selected-class="global-nav-role-chip--active"
					class="global-nav-role-chipgroup">
					<v-chip v-for="(role, index) in switchableRoles" :key="role.code" :value="index" size="small"
						variant="tonal" color="primary" class="global-nav-role-chip">
						{{ role.label }}
					</v-chip>
				</v-chip-group>
			</div>

			<v-divider v-if="switchableRoles.length > 1" />

			<v-list class="global-nav-list" density="compact" nav>
				<template v-for="item in visibleItems" :key="item.code || item.key">
					<v-list-group v-if="item.submenu && item.submenu.length" :value="item.code || item.key">
						<template #activator="{ props }">
							<v-list-item v-bind="props" :prepend-icon="item.icon || 'mdi-apps'"
								:title="getItemTitle(item)" :active="isGroupActive(item)" color="primary"
								rounded="lg" />
						</template>

						<v-list-item v-for="child in item.submenu" :key="child.url || child.key || child.name"
							:title="getItemTitle(child)" :active="isCurrentRoute(child)" color="primary" rounded="lg"
							class="global-nav-subitem" @click="navigateTo(child); mobileDrawer = false" />
					</v-list-group>

					<v-list-item v-else :active="isActive(item)" :prepend-icon="item.icon || 'mdi-apps'"
						:title="getItemTitle(item)" :value="item.code || item.key" color="primary" rounded="lg"
						@click="selectItem(item)" />
				</template>
			</v-list>
		</v-navigation-drawer>
	</v-layout>
</template>

<script>
	export default {
		name: 'GlobalNavigationDrawer',
	props: {
		activeKey: {
			type: [Number, String],
			default: null
		},
		activeModuleCode: {
			type: String,
			default: null
		},
		userInfo: {
			type: Object,
			default: () => ({})
		},
		avatarUrl: {
			type: String,
			default: ''
		},
		items: {
			type: Array,
			default: () => []
		},
		permissions: {
			type: Array,
			default: () => []
		},
		roles: {
			type: Array,
			default: () => []
		},
		schoolName: {
			type: String,
			default: 'LMS Nhà trường'
		},
		version: {
			type: String,
			default: ''
		},
		drawerWidth: {
			type: [Number, String],
			default: 296
		},
		isMobile: {
			type: Boolean,
			default: false
		},
		// menuLeft từ config JSON (có submenu, url, right.SystemRight...)
		menuLeft: {
			type: Array,
			default: () => []
		}
	},
	emits: [
		'update:activeKey',
		'update:activeModuleCode',
		'update:activeRole',
		'navigate',
		'select'
	],
	data() {
		return {
			mobileDrawer: false,
			rail: false,
			// Index của role đang được chọn trong tab switcher
			activeRoleIndex: 0,
			defaultItems: [
				{ key: 'dashboard',         code: 'lms.dashboard',         title: 'Tổng quan',           icon: 'mdi-view-dashboard-outline',        routePath: '/dashboard',                 quick: true  },
				{ key: 'teacher-dashboard', code: 'lms.teacher.dashboard', title: 'Dashboard giáo viên', icon: 'mdi-account-school-outline',        routePath: '/lms-teacher-dashboard',     quick: true  },
				{ key: 'class-lesson',      code: 'lms.class.lesson',      title: 'Lớp và bài học',      icon: 'mdi-google-classroom',              routePath: '/mon-hoc-lop',               quick: true  },
				{ key: 'assignment',        code: 'lms.assignment',        title: 'Bài tập',             icon: 'mdi-clipboard-text-outline',        routePath: '/lms_tc_asm_list',           quick: true  },
				{ key: 'gradebook',         code: 'lms.gradebook',         title: 'Bảng điểm',           icon: 'mdi-table-edit',                    routePath: '/nhap-diem',                 quick: true  },
				{ key: 'question-bank',     code: 'lms.question_bank',     title: 'Ngân hàng câu hỏi',   icon: 'mdi-help-box-outline',              routePath: '/lms-teacher-question-bank'              },
				{ key: 'learning-resource', code: 'lms.learning_resource', title: 'Học liệu',            icon: 'mdi-book-open-page-variant-outline', routePath: '/quan-ly-hoc-lieu'                       },
				{ key: 'report',            code: 'lms.report',            title: 'Báo cáo',             icon: 'mdi-chart-box-outline',             routePath: '/bc-tong-hop-bao-cao'                    },
				{ key: 'approval',          code: 'lms.approval',          title: 'Duyệt',               icon: 'mdi-check-decagram-outline',        routePath: '/bgh-duyet-diem'                         },
				{ key: 'system-config',     code: 'lms.system_config',     title: 'Cấu hình',            icon: 'mdi-cog-outline',                   routePath: '/set-default-func'                       }
			],

			// Map SystemRight số → role code nội bộ
			// Chỉnh lại nếu hệ thống dùng số khác
			systemRightRoleMap: {
				1: 'gv_cn',      // Giáo viên chủ nhiệm
				2: 'gv_bm',      // Giáo viên bộ môn
				3: 'bgh',        // Ban giám hiệu
				5: 'to_truong',  // Tổ trưởng
				9: 'admin'       // Admin
			},

			// Cấu hình từng role: label hiển thị + danh sách SystemRight thuộc role đó
			// Thứ tự ưu tiên: role cao hơn thấy được menu của role thấp hơn khi có dạy
			roleConfig: [
				{
					code: 'gv_cn',
					label: 'GVCN',
					systemRights: [1],
					// Các role này được thấy menu của gv_cn khi họ có dạy
					inheritsTo: ['to_truong', 'bgh', 'admin']
				},
				{
					code: 'gv_bm',
					label: 'GV Bộ môn',
					systemRights: [2],
					inheritsTo: ['to_truong', 'bgh', 'admin']
				},
				{
					code: 'to_truong',
					label: 'Tổ trưởng',
					systemRights: [5],
					inheritsTo: ['bgh', 'admin']
				},
				{
					code: 'bgh',
					label: 'BGH',
					systemRights: [3],
					inheritsTo: ['admin']
				},
				{
					code: 'admin',
					label: 'Admin',
					systemRights: [9],
					inheritsTo: []
				}
			]
		}
	},
	computed: {
		// Lấy SystemRight hiện tại của user từ permissions hoặc userInfo
		userSystemRights() {
			// Hệ thống cũ trả về mảng số trong userInfo.SystemRight hoặc myPermissions
			const fromUser = this.userInfo?.SystemRight
				|| this.userInfo?.systemRight
				|| vueData?.myPermissions?.SystemRight
				|| vueData?.user?.SystemRight
				|| []
			return Array.isArray(fromUser) ? fromUser.map(Number) : []
		},

		// Role nào user thực sự có (dựa trên SystemRight)
		userRoleCodes() {
			const rights = this.userSystemRights
			if (!rights.length) return []
			return this.roleConfig
				.filter(rc => rc.systemRights.some(sr => rights.includes(sr)))
				.map(rc => rc.code)
		},

		// Danh sách tab role để chuyển đổi
		// Nếu user là tổ trưởng + có dạy → thêm tab GV vào
		switchableRoles() {
			const codes = this.userRoleCodes
			if (!codes.length) return []

			const result = []

			// Thêm role chính
			codes.forEach(code => {
				const cfg = this.roleConfig.find(r => r.code === code)
				if (cfg) result.push({ code: cfg.code, label: cfg.label })
			})

			// Tổ trưởng/BGH/Admin: nếu có phân công dạy thì thêm tab GV
			const hasTeachingAssignment = !!(
				vueData?.hasTeachingAssignment
				|| vueData?.user?.hasTeachingAssignment
			)
			const isHigherRole = codes.some(c => ['to_truong', 'bgh', 'admin'].includes(c))
			const alreadyHasGvTab = result.some(r => ['gv_cn', 'gv_bm'].includes(r.code))

			if (isHigherRole && hasTeachingAssignment && !alreadyHasGvTab) {
				result.unshift({ code: 'gv_bm', label: 'Giáo viên' })
			}

			return result
		},

		// Role đang active theo tab
		activeRole() {
			return this.switchableRoles[this.activeRoleIndex] || null
		},

		activeRoleLabel() {
			if (this.activeRole) return this.activeRole.label
			// Fallback về roles prop
			const roles = this.roles.length ? this.roles : this.userInfo?.roles
			if (Array.isArray(roles) && roles.length) return roles.join(', ')
			return this.userInfo?.roleName || this.userInfo?.RoleName || 'Nhà trường'
		},

		permissionMap() {
			return new Map(this.permissions.map(module => [module.code, module]))
		},

		// Nguồn item: ưu tiên menuLeft → items prop → permissions → defaultItems
		baseItems() {
			// 1. menuLeft từ config (format: { name, icon, url, submenu, right.SystemRight[] })
			if (this.menuLeft && this.menuLeft.length) {
				return this.menuLeft.map((item, index) => this.normalizeMenuLeftItem(item, index))
			}

			// 2. items prop truyền thẳng
			if (this.items.length) return this.items

			// 3. navigationItems từ vueData
			const globalItems = vueData?.navigationItems || vueData?.lmsNavigationItems
			if (Array.isArray(globalItems) && globalItems.length) return globalItems

			// 4. Từ permissions
			if (this.permissions.length) {
				return this.permissions
					.filter(module => module.sysright)
					.map((module, index) => ({
						key: module.code,
						code: module.code,
						title: module.name || module.title || module.code,
						icon: module.icon || this.getModuleIcon(module.code),
						routePath: module.routePath || module.route_path || module.url,
						menuOrder: module.menuOrder ?? module.menu_order ?? index,
						quick: module.quick || index < 6
					}))
			}

			// 5. Default
			return this.defaultItems
		},

		// Lọc item theo role đang active + sysright
		visibleItems() {
			const activeRoleCode = this.activeRole?.code || null
			const userRights = this.userSystemRights

			return this.baseItems
				.filter(item => {
					if (item.hidden) return false

					// Lọc theo SystemRight trong right.SystemRight (menuLeft format)
					const requiredRights = item._systemRights
					if (requiredRights && requiredRights.length) {
						const hasRight = requiredRights.some(r => userRights.includes(r))
						if (!hasRight) return false
					}

					// Lọc theo sysright (permissions format)
					const moduleCode = item.moduleCode || item.code
					if (moduleCode && this.permissions.length) {
						const modulePermission = this.permissionMap.get(moduleCode)
						if (modulePermission && !modulePermission.sysright) return false
					}

					// Lọc theo role đang active
					// Nếu item có _visibleForRoles thì chỉ hiện khi role active thuộc danh sách đó
					if (activeRoleCode && item._visibleForRoles && item._visibleForRoles.length) {
						return item._visibleForRoles.includes(activeRoleCode)
					}

					return true
				})
				.sort((a, b) => (a.menuOrder ?? a.order ?? 0) - (b.menuOrder ?? b.order ?? 0))
		},

		activeItem() {
			return this.visibleItems.find(item => this.isActive(item))
				|| this.visibleItems.find(item => this.isCurrentRoute(item))
		},

		quickModules() {
			return this.visibleItems.filter(item => item.quick && !item.submenu?.length).slice(0, 6)
		},

		displayName() {
			return this.userInfo?.displayName
				|| this.userInfo?.HoTen
				|| this.userInfo?.FullName
				|| this.userInfo?.UserName
				|| 'Người dùng'
		},

		userInitials() {
			return this.displayName
				.split(' ')
				.filter(Boolean)
				.slice(-2)
				.map(part => part[0])
				.join('')
				.toUpperCase()
		},

		versionText() {
			return this.version ? ` ${this.version}` : ''
		}
	},
	watch: {
		activeRoleIndex(val) {
			const role = this.switchableRoles[val]
			if (role) this.$emit('update:activeRole', role.code)
		}
	},
	methods: {
		// Chuyển đổi item từ format menuLeft → format nội bộ
		normalizeMenuLeftItem(item, index) {
			const systemRights = item.right?.SystemRight || []
			return {
				key: item.url || item.name || String(index),
				code: item.url || item.name || String(index),
				title: item.name || item.title || '',
				icon: item.icon || 'mdi-apps',
				routePath: item.url,
				url: item.url,
				menuOrder: index,
				quick: index < 5 && !item.submenu?.length,
				_systemRights: systemRights,
				// submenu cũng normalize
				submenu: (item.submenu || []).map((child, ci) => ({
					key: child.url || child.name || String(ci),
					title: child.name || child.title || '',
					url: child.url,
					routePath: child.url,
					_systemRights: child.right?.SystemRight || systemRights
				}))
			}
		},

		getItemTitle(item, compact = false) {
			if (compact && item.shortTitle) return item.shortTitle
			return item.title || item.name || item.label || item.code || ''
		},

		getModuleIcon(moduleCode = '') {
			const iconMap = {
				'lms.dashboard':          'mdi-view-dashboard-outline',
				'lms.teacher.dashboard':  'mdi-account-school-outline',
				'lms.class.lesson':       'mdi-google-classroom',
				'lms.assignment':         'mdi-clipboard-text-outline',
				'lms.gradebook':          'mdi-table-edit',
				'lms.question_bank':      'mdi-help-box-outline',
				'lms.learning_resource':  'mdi-book-open-page-variant-outline',
				'lms.report':             'mdi-chart-box-outline',
				'lms.approval':           'mdi-check-decagram-outline',
				'lms.system_config':      'mdi-cog-outline'
			}
			return iconMap[moduleCode] || 'mdi-apps'
		},

		isActive(item) {
			const moduleCode = item.moduleCode || item.code
			const matchedByState = this.activeModuleCode
				? this.activeModuleCode === moduleCode
				: this.activeKey === item.key
			return matchedByState || this.isCurrentRoute(item)
		},

		isGroupActive(item) {
			return item.submenu?.some(child => this.isCurrentRoute(child)) || false
		},

		isCurrentRoute(item) {
			const target = item.to || item.routePath || item.url
			if (!target || !window.location?.pathname) return false
			const normalizedTarget = target.split('?')[0].replace(/\/$/, '')
			const normalizedPath = window.location.pathname.replace(/\/$/, '')
			return normalizedTarget === normalizedPath
		},

		selectItem(item) {
			this.$emit('update:activeKey', item.key)
			this.$emit('update:activeModuleCode', item.moduleCode || item.code || null)
			this.$emit('select', item)
			this.$emit('navigate', item)
			this.mobileDrawer = false
			this.navigateTo(item)
		},

		selectModule(module) {
			this.selectItem(module)
		},

		navigateTo(item) {
			if (typeof item.onClick === 'function') {
				item.onClick(item)
				return
			}
			const target = item.to || item.routePath || item.url
			if (!target || this.isCurrentRoute(item)) return
			if (typeof redirect === 'function') {
				redirect(target)
				return
			}
			window.location.href = target
		}
	}
	}
</script>