<template>

	<!-- <div class="pa-2">
		<v-switch v-model="version" label="Version" color="green"></v-switch>
	</div> -->
	<v-list class="py-0" v-if="!version" :density="vueData.density" style="background-color: #f5f5f5;">
		<v-list-subheader class=" px-1">
			<div class="d-flex align-center w-100 ">
				Danh sách nhiệm vụ
				<v-spacer />
				<!-- Nút refresh -->
				<v-btn size="small" variant="text" icon="mdi-refresh" @click="onRefresh" />
				<v-badge :model-value="!IsBtnDot" color="red" location="top right" dot :offset-x="5" :offset-y="5">
					<uc-bts-mon-hoc v-model:monHocSelected="monHocSelected" :NienKhoa="NienKhoa" size="small"
						icon="mdi-filter-outline" variant="text" />
				</v-badge>
			</div>
		</v-list-subheader>

		<!-- DANH SÁCH NHIỆM VỤ SAU FILTER -->
		<template v-for="(nv, idx) in DSNhiemVu_Filter" :key="idx">
			<v-list-item @click="onRedirect(nv)" class="px-2 mx-2 rounded bg-white mb-2">
				<v-list-item-title class="text-subtitle-1 font-weight-medium" @click="onRedirect(nv)"
					style="white-space: unset !important">
					{{ nv.Title }}
				</v-list-item-title>
				<v-list-item-subtitle class="d-flex flex-column ga-1">
					<div class="d-flex ga-2 align-center">
						<v-chip size="small" color="blue" label>{{ nv.TenMonHoc_HienThi }}</v-chip>
						<div class="text-caption" v-if="nv.ResourceType === 'ASSIGNMENT'">
							<v-icon>mdi-clock-alert-outline</v-icon>
							<span>{{
								nv.DueDate
							}}</span>
						</div>
					</div>
					<v-chip size="small" class="opacity-100" color="primary" style="width: fit-content">GV: {{
						nv.HoTenNguoiGiao }}</v-chip>
				</v-list-item-subtitle>
				<template #prepend>
					<v-icon :color="nv.Color" class="opacity-100">{{ nv.Icon }}</v-icon>
				</template>
				<!-- <template #append>
					<v-menu>
						<template v-slot:activator="{ props }">
							<v-btn color="primary" v-bind="props" icon="mdi-book" size="small" variant="tonal" />
						</template>

						<v-list :density="vueData.density">
							<v-list-item title="Xem điểm" @click="onXemDiem(nv)" />
							<v-list-item title="Xem chi tiết" @click="onXemChiTiet(nv)" />
							<v-list-item title="Xếp hạng" @click="onXepHang(nv)" />
						</v-list>
					</v-menu>
				</template> -->
			</v-list-item>

			<!-- <v-divider inset v-if="idx !== DSNhiemVu_Filter.length - 1" /> -->
		</template>
	</v-list>
	<div v-else class="px-2 pb-2" style="height: calc(100vh - 48px); background-color: #fbfbfb;">
		<div class="d-flex flex-wrap ga-2 my-2">
			<div @click="selectedMonHoc = null" class="hover-chip px-2 py-1 d-flex justify-center" :key="null"
				:class="{ active: selectedMonHoc === null }">
				<v-icon icon="mdi-server-plus" start></v-icon>
				Tất cả
			</div>
			<div v-for="(mh, index) in DSMonHoc" @click="selectedMonHoc = mh.MonHocID"
				class="hover-chip px-2 py-1 d-flex justify-center" :key="mh.MonHocID"
				:class="{ active: selectedMonHoc === mh.MonHocID }">
				<v-icon :color="mh.Color" :icon="mh.Icon" start></v-icon>
				{{ mh.TenMonHoc_HienThi }}
			</div>
		</div>
		<v-row dense>
			<v-col v-for="nv in DSNhiemVu_Filter_V2" cols="12" sm="6" md="3">
				<v-card class="elevation-0 rounded-0 hover-card" @click="onRedirect(nv)"
					:style="[{ 'background-color': nv.ResourceType == 'ASSIGNMENT' ? '#c8e6ff94' : 'rgb(216 237 217)' }]">
					<v-card-title class="d-flex  pa-1"
						:class="[nv.ResourceType == 'ASSIGNMENT' ? 'bg-blue' : 'bg-success']"
						style="height: 60px; padding-bottom: 4px !important;">
						<span class="text-subtitle-2 font-weight-medium text-wrap text-title-nhiem-vu">{{ nv.Title
						}}</span>
						<v-spacer></v-spacer>
						<v-chip color="white" class="task-status-chip" label variant="tonal" size="small"
							style="width: fit-content;">{{
								statusInfo(nv).text
							}}</v-chip>
					</v-card-title>
					<v-card-text class="py-2">
						<div class="d-flex flex-column">
							<span class="text-caption">Môn học:</span>
							<span class="text-body-2 font-weight-medium">{{ nv.TenMonHoc_HienThi }}</span>
						</div>
						<div class="d-flex flex-column mt-1">
							<span class="text-caption">Giáo viên giao bài:</span>
							<span class="text-body-2 font-weight-medium">{{ nv.HoTenNguoiGiao }}</span>
						</div>
						<div class="d-flex flex-column mt-1">
							<span class="text-caption">Hạn nộp:</span>
							<span class="text-body-2 font-weight-medium">
								<span>{{
									nv.DueDate ?? '-'
								}}</span>
							</span>
						</div>
					</v-card-text>

					<!-- <v-card-actions class="border-t py-1">
						<v-spacer></v-spacer>
						<v-btn size="small" color="green" text="Bắt đầu" variant="text"></v-btn>
					</v-card-actions> -->
				</v-card>
			</v-col>
		</v-row>
	</div>
</template>



<script>
export default {
	props: {
		NienKhoa: Number
	},

	data() {
		return {
			DSNhiemVu: [],
			monHocSelected: [],
			vueData,
			version: true,
			DSMonHoc: [],
			selectedMonHoc: null
		};
	},

	async mounted() {
		this.DSMonHoc = await ajaxCALLPromise(
			"lms/EL_Student_Get_MonHoc_ByHocSinhID",
			{
				HocSinhID: vueData.user.UserID,
				NienKhoa: this.NienKhoa
			}
		);
		this.onRefresh();
	},

	computed: {
		// Kiểm tra xem đã chọn FULL chưa
		IsBtnDot() {
			const uniqueMonHocInNV = [
				...new Set(this.DSNhiemVu.map(x => x.MonHocID))
			];

			const selectedIDs = this.monHocSelected.map(x => x.MonHocID);

			return selectedIDs.length === uniqueMonHocInNV.length;
		},

		// FILTER NHIỆM VỤ THEO MONHOCSELECTED
		DSNhiemVu_Filter() {
			if (!this.monHocSelected || this.monHocSelected.length === 0) {
				return this.DSNhiemVu;
			}

			const selectedIDs = this.monHocSelected.map(x => x.MonHocID);

			return this.DSNhiemVu.filter(nv =>
				selectedIDs.includes(nv.MonHocID)
			);
		},

		// FILTER NHIỆM VỤ THEO MONHOCSELECTED
		DSNhiemVu_Filter_V2() {
			if (!this.selectedMonHoc || this.selectedMonHoc.length === 0) {
				return this.DSNhiemVu;
			}


			return this.DSNhiemVu.filter(nv =>
				nv.MonHocID == this.selectedMonHoc
			);
		}
	},

	methods: {
		onRedirect(nv) {
			console.log('this.task.', nv)
			const type = (nv.ResourceType || '').toLowerCase();
			const id = nv.ResourceID;
			const Is_SendToClass = nv.Is_SendToClass
			if (type && id) {
				if (type === 'assignment') {
					openWindow({
						title: nv.Title,
						url: `/lms-student-assignment?AssignToClassID=${id}&Is_SendToClass=${Is_SendToClass}`,
						id: 'StudentDoASM' + id,
						onclose: {
							"EXE": "vueData.initPage()"
						}
					})

				} else if (type === 'lesson') {
					openWindow({
						title: nv.Title,
						url: `/lms-student-lesson-viewer?AssignToClassID=${id}`,
						onclose: {
							"EXE": "vueData.initPage()"
						}
					})
				}
			}
		},

		async onRefresh() {
			this.DSNhiemVu = await ajaxCALLPromise(
				"lms/EL_Student_Get_NhiemVu_ByHocSinhID",
				{
					NienKhoa: this.NienKhoa,
					HocSinhID: vueData.user.UserID
				}
			);
		},
		onXemDiem() { },
		onXemChiTiet() { },
		onXepHang() { },
		statusInfo(nv) {
			const statuses = {
				'OVERDUE': { color: 'error', text: 'Quá hạn', cardClass: 'urgent' },
				'IN_PROGRESS': { color: 'warning', text: nv.ResourceType === 'ASSIGNMENT' ? 'Đang làm' : 'Đang học', cardClass: 'warning' },
				'NOT_STARTED': { color: 'success', text: 'Bắt đầu', cardClass: 'normal' },
				'RESUBMIT': { color: 'warning', text: 'Nộp bài lại', cardClass: 'normal' },
			};
			return statuses[nv.Status] || statuses['NOT_STARTED'];
		},
		dueDateInfo(nv) {
			if (!nv.DueDate) return { text: '', colorClass: '' };
			const now = new Date();
			const dueDate = new Date(nv.DueDate);
			const diffSeconds = Math.floor((dueDate - now) / 1000);
			if (diffSeconds < 0) return { text: 'đã quá hạn', colorClass: 'text-error' };
			const diffMinutes = Math.floor(diffSeconds / 60);
			if (diffMinutes < 60) return { text: `còn ${diffMinutes} phút`, colorClass: 'text-warning-darken-2' };
			const diffHours = Math.floor(diffMinutes / 60);
			if (diffHours < 24) return { text: `còn ${diffHours} giờ`, colorClass: 'text-warning-darken-2' };
			const timeDiff = dueDate.getTime() - now.getTime();
			const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
			return { text: `còn ${daysDiff} ngày`, colorClass: 'text-success-darken-1' };
		},
		colorType(nv) {
			if (nv.ResourceType === 'ASSIGNMENT') {
				return 'blue';
			} else if (nv.ResourceType === 'LESSON') {
				return 'green';
			} else {
				return 'grey';
			}
		}
	}
}
</script>