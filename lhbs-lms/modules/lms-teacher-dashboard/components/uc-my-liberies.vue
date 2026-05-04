<template>
	<v-navigation-drawer v-model="isOpen" temporary location="end" width="400">
		<div class="lib-root">

			<!-- Header -->
			<v-list-item prepend-icon="" class="bg-white"
				style="flex-shrink:0; height:50px; border-bottom:1px solid var(--border-color)">
				<template #prepend>
					<v-icon size="small">mdi-library-shelves</v-icon>
				</template>
				<span class="text-subtitle-1 font-weight-bold">{{ $t('message.MyDocument') }}</span>
				<template v-slot:append>
					<v-btn icon @click="CloseLiberies">
						<v-icon>mdi-close</v-icon>
					</v-btn>
				</template>
			</v-list-item>

			<!-- Subject filter pills -->
			<div class="lib-filter-row">
				<button v-for="(item, index) in DSMonHoc" :key="index" class="lib-pill"
					:class="{ active: item.MonHocName === selected.MonHocName }" @click="getLiberies(item)">
					{{ item.MonHocName == 'Ngoại ngữ' ? ($i18n.locale == 'en' ? 'English' : item.MonHocName) :
					item.MonHocName }}
				</button>
				<span v-if="DSMonHoc.length === 0" class="text-red text-caption">{{ $t('message.NotFoundSubject')
					}}</span>
			</div>

			<!-- Khoi filter pills -->
			<div class="lib-filter-row lib-filter-row--khoi" v-if="availableKhois.length > 1">
				<button class="lib-pill lib-pill--sm" :class="{ active: selectedKhoi === null }"
					@click="selectedKhoi = null">
					{{ $i18n.locale == 'en' ? 'All' : 'Tất cả' }}
				</button>
				<button v-for="k in availableKhois" :key="k" class="lib-pill lib-pill--sm"
					:class="{ active: selectedKhoi === k }" @click="selectedKhoi = k">
					{{ $t('message.Grade') }} {{ k }}
				</button>
			</div>

			<!-- Actions -->
			<div class="lib-actions" v-if="DSMonHoc.length > 0">
				<v-btn color="brown" variant="outlined" size="small" @click="onOpenKhoNoiDung()"
					v-tooltip="$i18n.locale == 'en' ? 'Content Library' : 'Kho nội dung'">
					<v-icon>mdi-archive-outline</v-icon>
					<span style="font-size:.775rem">{{ $t('message.ContentLibrary') }}</span>
				</v-btn>
				<v-menu transition="slide-y-transition">
					<template v-slot:activator="{ props }">
						<v-btn color="primary" variant="outlined" size="small" v-bind="props">
							<v-icon>mdi-plus</v-icon>
							<span style="font-size:.775rem">{{ $t('message.CreateContent') }}</span>
						</v-btn>
					</template>
					<v-list>
						<v-list-item v-for="KhoiItem in selectedGroups" :value="KhoiItem.KhoiID" :key="KhoiItem.KhoiID"
							@click="OpenModalAddNoiDung(KhoiItem)">
							<v-list-item-title>{{ $t('message.Grade') }} {{ KhoiItem.KhoiID }}</v-list-item-title>
						</v-list-item>
					</v-list>
				</v-menu>
			</div>

			<!-- Search -->
			<div class="lib-search">
				<v-text-field v-model="librarySearch" density="compact" variant="outlined" hide-details
					placeholder="Tìm kiếm..." prepend-inner-icon="mdi-magnify" />
			</div>

			<!-- Flat item list -->
			<div class="lib-body">
				<!-- Skeleton loading -->
				<template v-if="isLibraryLoading">
					<div v-for="n in 5" :key="'skel-'+n" class="lib-bt-item" style="pointer-events:none;opacity:.7">
						<div class="lib-bt-icon" style="background:#EAF2FC;flex-shrink:0">
							<v-skeleton-loader type="avatar" width="15" height="15" style="margin:auto" />
						</div>
						<div class="lib-bt-body" style="flex:1;gap:4px">
							<v-skeleton-loader type="text" width="72%" />
							<v-skeleton-loader type="text" width="40%" />
							<v-skeleton-loader type="chip" width="80px" />
						</div>
					</div>
				</template>
				<template v-else>
					<div v-if="flatLibraryItems.length === 0" class="lib-empty">
						<v-icon size="36" class="mb-2 opacity-40">mdi-book-open-blank-variant-outline</v-icon>
						<span>{{ selected ? 'Không có tài liệu nào' : 'Chọn môn học để xem' }}</span>
					</div>
					<div v-for="item in flatLibraryItems" :key="item.ResourceID" class="lib-bt-item"
						@click="onSelectedLibery(item, item._siblings)">
						<div class="lib-bt-icon"
							:style="{ background: item._info.color === 'blue' ? '#EAF2FC' : '#E8F5E9' }">
							<v-icon size="15" :color="item._info.color">{{ item._info.icon }}</v-icon>
						</div>
						<div class="lib-bt-body">
							<div class="lib-bt-name">{{ item.Title }}</div>
							<div class="lib-bt-meta">{{ item._monHocName }} · {{ $t('message.Grade') }} {{ item._khoi }}
								· {{ item._week }}</div>
							<div class="lib-bt-footer">
								<span class="lib-pill-status" :style="getStatusStyle(item._status.color)">{{
									item._status.text }}</span>
							</div>
						</div>
						<v-menu transition="slide-y-transition">
							<template v-slot:activator="{ props }">
								<v-btn size="x-small" variant="text" icon="mdi-dots-vertical" v-bind="props"
									@click.stop />
							</template>
							<v-list density="compact">
								<v-list-item @click.stop="onRedirectToASM(item)">
									<v-list-item-title class="text-subtitle-2">
										<v-icon color="primary" size="small" class="mr-1">mdi-archive-eye-outline
										</v-icon>
										{{ $t('message.ViewDetail') }}
									</v-list-item-title>
								</v-list-item>
								<v-list-item @click.stop="onDeleteItem(item)">
									<v-list-item-title class="text-subtitle-2">
										<v-icon color="red" size="small" class="mr-1">mdi-trash-can-outline</v-icon>
										{{ $t('message.Delete') }} {{ item.ResourceType == 'LESSON' ? ($i18n.locale ==
										'en' ? 'lesson' : 'bài học') : ($i18n.locale == 'en' ? 'assignment' : 'bài tập')
										}}
									</v-list-item-title>
								</v-list-item>
							</v-list>
						</v-menu>
					</div>
				</template>
			</div>

			<uc-libery-details v-if="isShowModalLiberyDetails" v-model:isOpen="isShowModalLiberyDetails"
				v-model:selectedLibery="selectedLibery" :key="keyComp" :DSAssignedClass="DSAssignedClass"
				@update:selectedLibery="() => { vueData.apiCall3() }" />

		</div>
	</v-navigation-drawer>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
	emits: ['update:isOpen', 'CreateContent'],
	props: {
		isOpen: {
			type: Boolean,
			default: false
		},
		DSMonHocActive: {
			type: Array,
			default: () => []
		},
		teachingGroups: {
			type: Array,
			default: () => []
		},
		contentLibrary: {
			type: Array,
			default: () => []
		}
	},
	mounted() {
		document.body.classList.add('no-scroll');
		this.DSMonHoc = [...this.DSMonHocActive]
		this.$nextTick(() => {
			if (this.DSMonHoc.length > 0) this.selected = this.DSMonHoc[0];
		})

	},
	computed: {
		tooltipCreateContent() {
			return 'Tạo nội dung cho môn học ' + this.selected.MonHocName
		},
		selectedGroups() {
			if (!this.selected?.MonHocName) return []
			return this.teachingGroups.filter(item => item.MonHocName == this.selected.MonHocName)
		},
		selectedLibraries() {
			if (!this.selected?.MonHocName) return []
			return this.contentLibrary
				.filter(khoi => khoi.MonHocName == this.selected.MonHocName)
				.map(khoi => ({
					...khoi,
					allIndices: khoi.weeks?.map((_, i) => i) ?? [],
					weeks: khoi.weeks?.map(w => ({
						...w,
						flatItems: w.chapters.flatMap(c => c.items.map(item => ({
							...item,
							_info: item.ResourceType === 'ASSIGNMENT'
								? { icon: 'mdi-notebook-edit-outline', color: 'blue' }
								: { icon: 'mdi-presentation-play', color: 'green' },
							_status: (() => {
								const m = {
									1: { text: this.$i18n.locale == 'en' ? 'Drafting' : 'Đang soạn thảo', color: 'grey' },
									2: { text: this.$i18n.locale == 'en' ? 'Ready to Assign' : 'Sẵn sàng giao', color: 'orange' },
									3: { text: this.$i18n.locale == 'en' ? 'Assigned' : 'Đã giao', color: 'success' },
								}
								return m[item.Status] || m[1]
							})()
						})))
					}))
				}))
		},
		availableKhois() {
			return this.selectedLibraries.map(k => k.KhoiID)
		},
		flatLibraryItems() {
			const s = this.librarySearch.toLowerCase()
			const libs = this.selectedKhoi !== null
				? this.selectedLibraries.filter(k => k.KhoiID === this.selectedKhoi)
				: this.selectedLibraries
			return libs.flatMap(khoi =>
				khoi.weeks.flatMap(week => {
					const siblings = week.flatItems
					return week.flatItems.map(item => ({ ...item, _khoi: khoi.KhoiID, _week: week.title, _monHocName: khoi.MonHocName, _siblings: siblings }))
				})
			).filter(item => !s || item.Title.toLowerCase().includes(s))
		},
	},
	watch: {
		DSMonHocActive(newVal) {
			this.DSMonHoc = [...newVal]
			this.$nextTick(() => {
				if (this.DSMonHoc.length > 0 && !this.DSMonHoc.find(m => m.MonHocName === this.selected?.MonHocName)) {
					this.selected = this.DSMonHoc[0]
				}
			})
		},
		contentLibrary: function (newVal) {
			if (newVal && this.isShowModalLiberyDetails) {

			}
		},
		selected() {
			this.selectedKhoi = null
		},
	},
	data() {

		return {
			keyComp: 0,
			isLibraryLoading: false,
			selectedKhoi: null,
			indentLines: 'default',
			separateRoots: false,
			actionIcons: false,
			prependIcons: true,
			isShowModalLiberyDetails: false,
			DSMonHoc: [],
			selected: '',
			librarySearch: '',
			selectedLibery: {},
			vueData,
			DSAssignedClass: []
		}
	},
	methods: {
		getStatusStyle(color) {
			const m = { grey: { bg: '#F3F4F6', text: '#6B7280' }, orange: { bg: '#FAEEDA', text: '#BA7517' }, success: { bg: '#EAF3DE', text: '#3B6D11' } }
			const c = m[color] || m.grey
			return `background:${c.bg}; color:${c.text}; padding:2px 7px; border-radius:20px; font-size:10px; font-weight:600`
		},
		CloseLiberies() {
			this.$emit('update:isOpen', false);
			document.body.classList.remove('no-scroll');
		},
		getLiberies(item) {
			this.selected = item;
		},
		itemInfo(item) {
			return item.ResourceType === 'ASSIGNMENT'
				? { icon: 'mdi-notebook-edit-outline', color: 'blue' }
				: { icon: 'mdi-presentation-play', color: 'green' };
		},
		statusInfo(item) {
			const statusMap = {
				1: { text: this.$i18n.locale == 'en' ? 'Drafting' : 'Đang soạn thảo', color: 'grey' },
				2: { text: this.$i18n.locale == 'en' ? 'Ready to Assign' : 'Sẵn sàng giao', color: 'orange' },
				3: { text: this.$i18n.locale == 'en' ? `Assigned` : `Đã giao`, color: 'success' },
			};
			return statusMap[item.Status] || statusMap[1];
		},
		onSelectedLibery(item, DSAssignedClass) {
			this.selectedLibery = item
			this.DSAssignedClass = DSAssignedClass
			this.isShowModalLiberyDetails = true
		},
		OpenModalAddNoiDung(item) {
			this.$emit('CreateContent', item)
		},
		onRedirectToASM(item) {
			let url = null
			if (item.ResourceType === 'ASSIGNMENT') {
				url = `/lms_tc_asm_builder?AssignmentID=${item.ResourceID}`
			} else if (item.ResourceType === 'LESSON') {
				url = `/lms_tc_lesson_builder?LessonID=${item.ResourceID}`
			}
			this.iframeRef.value.openWindow({
				title: item.Title,
				url,
				onclose: () => this.refreshLibrary()
			});

		},
		async refreshLibrary() {
			this.isLibraryLoading = true
			try { await vueData.apiCall3() } finally { this.isLibraryLoading = false }
		},
		onDeleteItem(item) {
			this.confirmRef.value.show({
				title: `Xác nhận xóa ${item.ResourceType === 'ASSIGNMENT' ? 'bài tập' : 'bài học'} - ${item.Title}`
			}).then(ok => {
				if (!ok) return
				if (item.ResourceType === 'ASSIGNMENT') {
					ajaxCALL('lms/EL_Assignment_Delete', {
						AssignmentID: item.ResourceID
					}, res => {
						this.refreshLibrary()
						this.snackbarRef.value.showSnackbar({ message: 'Xóa bài tập thành công!', color: 'success' })
					})
				} else {
					ajaxCALL('lms/EL_Lesson_Delete', {
						LessonID: item.ResourceID
					}, res => {
						this.refreshLibrary()
						this.snackbarRef.value.showSnackbar({ message: 'Xóa bài học thành công!', color: 'success' })
					})
				}
			})
		},
		onOpenKhoNoiDung() {
			this.iframeRef.value.openWindow({
				title: 'Kho nội dung',
				url: 'https://lms.lhbs.vn/kho-noi-dung-cong-khai?NienKhoa=' + vueData.NienKhoa,
				onclose: () => vueData.apiCall3()
			})
		},
	}
	}
</script>