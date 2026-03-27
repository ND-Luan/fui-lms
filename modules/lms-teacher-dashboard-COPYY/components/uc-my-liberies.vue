<template>
	<v-navigation-drawer v-model="isOpen" temporary location="end" width="400" class="td-library-drawer">
		<v-list-item prepend-icon="" class="bg-white position-sticky top-0 td-library-header">
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
		<v-divider></v-divider>

		<div class="pa-2 td-library-subjects">
			<span class="text-subtitle-1 font-weight-medium">{{ $t('message.ListSubjects') }}: </span><br>
			<v-btn v-for="(item, index) in DSMonHoc" :key="index" size="small" :value="item.MonHocName" variant="tonal"
				active-color="green" @click="getLiberies(item)" :active="item.MonHocName === selected.MonHocName" color="blue-grey">
				<span class="text-subtitle-2 td-library-subject-text">{{ item.MonHocName == 'Ngoại ngữ' ?
					($i18n.locale ==
						'en' ? 'English' : item.MonHocName) : item.MonHocName }}</span>
			</v-btn>
			<span v-if="DSMonHoc && DSMonHoc.length == 0" class="text-red text-caption">{{ $t('message.NotFoundSubject')
			}}</span>
		</div>
		<v-divider></v-divider>
		<div class="pa-2 d-flex ga-2 td-library-toolbar" v-if="DSMonHoc.length > 0">
			<v-spacer></v-spacer>
			<v-btn color="brown" variant="outlined" size="small" @click="onOpenKhoNoiDung()"
				v-tooltip="$i18n.locale == 'en' ? 'Content Library' : 'Kho nội dung'">
				<v-icon>mdi-archive-outline</v-icon>
				<span class="text-subtitle-2 td-library-subject-text">
					{{ $t('message.ContentLibrary') }}
				</span>
			</v-btn>
			<v-menu transition="slide-y-transition">
				<template v-slot:activator="{ props }">
					<v-btn color="primary" variant="outlined" size="small" v-bind="props" v-tooltip="tooltipCreateContent">
						<v-icon>mdi-plus</v-icon>
						<span class="text-subtitle-2 td-library-subject-text">{{
							$t('message.CreateContent') }}</span>
					</v-btn>
				</template>
				<v-list>
					<v-list-item v-for="KhoiItem in teachingGroups.filter(item => item.MonHocName == selected.MonHocName)"
						:value="KhoiItem.KhoiID" :key="KhoiItem.KhoiID" @click="OpenModalAddNoiDung(KhoiItem)">
						<v-list-item-title>{{ $t('message.Grade') }} {{ KhoiItem.KhoiID }}</v-list-item-title>
					</v-list-item>
				</v-list>
			</v-menu>
		</div>
		<v-divider></v-divider>
		<div class="d-flex flex-column ga-2 overflow-y td-library-content">
			<div v-for="KhoiItem in contentLibrary.filter(khoi => khoi.MonHocName == selected.MonHocName)"
				class="bg-grey-lighten-4 pa-2 td-library-grade-block">
				<span class="text-subtitle-1 font-weight-medium">{{ $t('message.Grade') }} {{ KhoiItem.KhoiID }}</span>
				<v-expansion-panels :model-value="KhoiItem.weeks.map((e, index) => { return index })"
					variant="accordion" multiple class="border-t pt-1">
					<v-expansion-panel v-for="(week, index) in KhoiItem.weeks" :key="index"
						class="mb-1 custom-panel-liberies">
						<v-expansion-panel-title class="text-body-2 text-white "
							style="background-color: #009688; min-height: 30px !important ; height: 30px;">
							<div>
							</div>
							{{ week.title }}
						</v-expansion-panel-title>

						<v-expansion-panel-text class="d-flex flex-column">
							<div v-for="(item, indexw) in week.chapters.map(item => { return [...item.items] }).flat()"
								class="flex-md-4 flex-sm-12 d-flex align-center flex-grow-1 px-1 py-2  mb-md-0 td-library-item-row"
								@click="onSelectedLibery(item, week.chapters.map(item => { return [...item.items] }).flat())">
								<v-icon :color="itemInfo(item).color" size="22" class="mr-2">
									{{ itemInfo(item).icon }}
								</v-icon>
								<div class="item-details">
									<div class="item-title text-wrap break-words three-lines"
										style="font-weight: 400;">
										{{ item.Title }}
									</div>
									<div v-if="item.Instructions && item.Instructions.length > 0"
										class=" text-wrap break-words two-lines"
										>
										<span class="font-weight-bold">{{ $t('message.Instructions') }}:</span> {{
											item.Instructions }}
									</div>
								</div>
								<v-spacer></v-spacer>
								<div class="d-flex align-center ga-2">
									<v-chip :color="statusInfo(item).color" class="font-weight-medium" variant="text" size="small">
										{{ statusInfo(item).text }}
									</v-chip>
								</div>
								<v-menu transition="slide-y-transition">
									<template v-slot:activator="{ props }">
										<v-btn size="small" variant="text" icon="mdi-dots-vertical" v-bind="props">
										</v-btn>
									</template>
									<v-list>
										<v-list-item @click="onRedirectToASM(item)">
											<v-list-item-title class="text-subtitle-2"><v-icon color="primary"
													size="small" class="mr-1">mdi-archive-eye-outline</v-icon>{{
														$t('message.ViewDetail')
													}}</v-list-item-title>
										</v-list-item>
										<v-list-item @click="onDeleteItem(item)">
											<v-list-item-title class="text-subtitle-2" v-if="$i18n.locale == 'vi'">
												<v-icon color="red" size="small"
													class="mr-1">mdi-trash-can-outline</v-icon>{{
														$t('message.Delete') }}
												{{ item.ResourceType == 'LESSON' ? 'bài học' : 'bài tập' }}
											</v-list-item-title>
											<v-list-item-title class="text-subtitle-2" v-else>
												<v-icon color="red" size="small"
													class="mr-1">mdi-trash-can-outline</v-icon>{{
														$t('message.Delete') }}
												{{ item.ResourceType == 'LESSON' ? 'lesson' : 'assignment' }}
											</v-list-item-title>
										</v-list-item>
									</v-list>
								</v-menu>
							</div>
						</v-expansion-panel-text>
					</v-expansion-panel>
				</v-expansion-panels>
			</div>
		</div>
		<div class="d-flex border-t pa-2 bg-white td-library-footer">
			<v-spacer></v-spacer>
			<v-btn color="primary" variant="text" @click="CloseLiberies">Đóng</v-btn>
		</div>
		<uc-libery-details v-if="isShowModalLiberyDetails" v-model:isOpen="isShowModalLiberyDetails"
			v-model:selectedLibery="selectedLibery" :key="keyComp" :DSAssignedClass="DSAssignedClass"
			@update:selectedLibery="(newVal) => { vueData.apiCall3(); console.log('newVal', newVal); }" />
	</v-navigation-drawer>
</template>
<script>
export default {


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
		console.log('this.DSMonHoc ',this.DSMonHoc )
		this.$nextTick(() => {
			if (this.DSMonHoc.length > 0) this.selected = this.DSMonHoc[0];
			console.log('contentLibrary', this.contentLibrary)
		})

	},
	computed: {
		tooltipCreateContent: function () {
			return 'Tạo nội dung cho môn học ' + this.selected.MonHocName
		}
	},
	watch: {
		contentLibrary: function (newVal) {
			if (newVal && this.isShowModalLiberyDetails) {

			}
		},
	},
	data() {

		return {
			keyComp: 0,
			indentLines: 'default',
			separateRoots: false,
			actionIcons: false,
			prependIcons: true,
			isShowModalLiberyDetails: false,
			DSMonHoc: [],
			selected: '',
			selectedLibery: {},
			vueData,
			DSAssignedClass: []
		}
	},
	methods: {
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
			console.log('DSAssignedClass', DSAssignedClass)
			this.selectedLibery = item
			this.DSAssignedClass = DSAssignedClass
			this.isShowModalLiberyDetails = true
		},
		OpenModalAddNoiDung(item) {
			this.$emit('CreateContent', item)
		},
		onRedirectToASM(item) {
			console.log('item', item)
			let url = null
			if (item.ResourceType === 'ASSIGNMENT') {
				url = `/lms_tc_asm_builder?AssignmentID=${item.ResourceID}`
			} else if (item.ResourceType === 'LESSON') {
				url = `/lms_tc_lesson_builder?LessonID=${item.ResourceID}`
			}
			openWindow({
				title: item.Title,
				url,
				onclose: {}
			});

		},
		onDeleteItem(item) {
			const $this = this
			confirm({
				title: `Xác nhận xóa ${item.ResourceType === 'ASSIGNMENT' ? 'bài tập' : 'bài học'} - ${item.Title}`,
				action: function () {
					if (item.ResourceType === 'ASSIGNMENT') {
						ajaxCALL('lms/EL_Assignment_Delete', {
							AssignmentID: item.ResourceID
						}, res => {
							vueData.initPage()
							Vue.$toast.success("Xóa bài tập thành công!", { position: "top" });
						})
					} else {
						ajaxCALL('lms/EL_Lesson_Delete', {
							LessonID: item.ResourceID
						}, res => {
							vueData.initPage()
							Vue.$toast.success("Xóa bài học thành công!", { position: "top" });
						})
					}
				}
			})
		},
		onOpenKhoNoiDung() {
			openWindow({
				url: 'https://lms.lhbs.vn/kho-noi-dung-cong-khai?NienKhoa=' + vueData.NienKhoa,
				title: 'Kho nội dung',
				onclose: {
					"EXE": "vueData.apiCall3()"
				}
			})
		},
	}
}
</script>