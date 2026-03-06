<template>
	<div class="nv">
		<!-- Header -->
		<div class="nv__header">
			<div class="nv__header-left">
				<div class="nv__header-icon">
					<v-icon size="18" color="white">mdi-lightning-bolt</v-icon>
				</div>
				<div>
					<div class="nv__header-title">Nhiệm Vụ</div>
					<div class="nv__header-count">{{ DSNhiemVu_Filter.length }} nhiệm vụ</div>
				</div>
			</div>
			<div class="nv__header-actions">
				<v-btn size="small" variant="text" icon="mdi-refresh" @click="onRefresh" />

				<!-- Mobile only: bottom sheet filter -->
				<v-badge class="d-sm-none" :model-value="!IsBtnDot" color="red" location="top right" dot :offset-x="5"
					:offset-y="5">
					<uc-bts-mon-hoc v-model:monHocSelected="monHocSelected" :NienKhoa="NienKhoa" size="small"
						icon="mdi-filter-variant" variant="tonal" color="primary" />
				</v-badge>
			</div>
		</div>

		<!-- Desktop only: chip filter (hidden on mobile) -->
		<div class="nv__chips d-none d-sm-flex">
			<div class="nv__chip" :class="{ 'nv__chip--active': selectedMonHoc === null }"
				@click="selectedMonHoc = null">
				<v-icon size="13" start>mdi-view-grid</v-icon>
				Tất cả
				<span class="nv__chip-badge">{{ DSNhiemVu.length }}</span>
			</div>
			<div v-for="mh in DSMonHoc" :key="mh.MonHocID" class="nv__chip"
				:class="{ 'nv__chip--active': selectedMonHoc === mh.MonHocID }" @click="selectedMonHoc = mh.MonHocID">
				<v-icon :color="selectedMonHoc === mh.MonHocID ? 'white' : mh.Color" size="13" start>{{ mh.Icon }}
				</v-icon>
				{{ mh.TenMonHoc_HienThi }}
				<span class="nv__chip-badge">{{ countByMonHoc(mh.MonHocID) }}</span>
			</div>
		</div>

		<!-- Empty state -->
		<div v-if="DSNhiemVu_Filter.length === 0" class="nv__empty">
			<v-icon size="52" color="grey-lighten-2">mdi-lightning-bolt-outline</v-icon>
			<div class="nv__empty-title">Không có nhiệm vụ</div>
			<div class="nv__empty-sub">Bạn đã hoàn thành tất cả!</div>
		</div>

		<!-- Danh sách -->
		<div class="nv__list" style="min-height: calc(100dvh)">
			<v-row dense>
				<v-col v-for="(nv, idx) in DSNhiemVu_Filter" :key="idx" cols="12" sm="6" lg="4">
					<div class="nv__card" :class="'nv__card--' + nv.ResourceType.toLowerCase()" @click="onRedirect(nv)">

						<!-- Left color bar -->
						<div class="nv__card-bar"
							:style="{ background: nv.Color || (nv.ResourceType === 'ASSIGNMENT' ? '#1976D2' : '#388E3C') }">
						</div>

						<!-- Icon -->
						<div class="nv__card-icon"
							:style="{ background: (nv.Color || (nv.ResourceType === 'ASSIGNMENT' ? '#1976D2' : '#388E3C')) + '18' }">
							<v-icon :color="nv.Color || (nv.ResourceType === 'ASSIGNMENT' ? '#1976D2' : '#388E3C')"
								size="22">{{ nv.Icon }}</v-icon>
						</div>

						<!-- Content -->
						<div class="nv__card-content">
							<div class="nv__card-title">{{ nv.Title }}</div>
							<div class="nv__card-meta">
								<span class="nv__card-subject">{{ nv.TenMonHoc_HienThi }}</span>
								<span class="nv__card-dot">·</span>
								<span class="nv__card-teacher">{{ nv.HoTenNguoiGiao }}</span>
							</div>
							<div class="nv__card-footer">
								<span class="nv__badge"
									:class="nv.ResourceType === 'ASSIGNMENT' ? 'nv__badge--assignment' : 'nv__badge--lesson'">
									{{ nv.ResourceType === 'ASSIGNMENT' ? 'Bài tập' : 'Bài học' }}
								</span>
								<span class="nv__badge" :class="'nv__badge--' + (statusInfo(nv).key || 'default')">
									{{ statusInfo(nv).text }}
								</span>
								<span v-if="nv.DueDate && nv.ResourceType === 'ASSIGNMENT'" class="nv__due"
									:class="dueDateInfo(nv).colorClass">
									<v-icon size="11">mdi-clock-outline</v-icon>
									{{ dueDateInfo(nv).text }}
								</span>
							</div>
						</div>

						<!-- Arrow -->
						<v-icon size="16" color="grey-lighten-1" class="nv__card-arrow">mdi-chevron-right</v-icon>
					</div>
				</v-col>
			</v-row>
		</div>
		<uc-iframe-window ref="iframeWindow" />
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
				DSMonHoc: [],
				selectedMonHoc: null
			};
		},
		async mounted() {
			this.DSMonHoc = await ajaxCALLPromise('lms/EL_Student_Get_MonHoc_ByHocSinhID', {
				HocSinhID: vueData.user.UserID,
				NienKhoa: this.NienKhoa
			});
			this.onRefresh();
		},
		computed: {
			IsBtnDot() {
				const uniqueMonHocInNV = [...new Set(this.DSNhiemVu.map(x => x.MonHocID))];
				const selectedIDs = this.monHocSelected.map(x => x.MonHocID);
				return selectedIDs.length === uniqueMonHocInNV.length;
			},
			DSNhiemVu_Filter() {
				let list = this.DSNhiemVu;
				if (this.monHocSelected && this.monHocSelected.length > 0) {
					const selectedIDs = this.monHocSelected.map(x => x.MonHocID);
					list = list.filter(nv => selectedIDs.includes(nv.MonHocID));
				}
				if (this.selectedMonHoc) {
					list = list.filter(nv => nv.MonHocID === this.selectedMonHoc);
				}
				return list;
			},
		},
		methods: {
			countByMonHoc(id) {
				return this.DSNhiemVu.filter(nv => nv.MonHocID === id).length;
			},
			onRedirect(nv) {
				const type = (nv.ResourceType || '').toLowerCase();
				const id = nv.ResourceID;
				if (!type || !id) return;
				if (type === 'assignment') {
					this.$refs.iframeWindow.openWindow({
						title: nv.Title,
						url: `/lms-student-assignment?AssignToClassID=${id}&Is_SendToClass=${nv.Is_SendToClass}`,
						onclose: () => {
							this.onRefresh();
						}
					});
				} else if (type === 'lesson') {
					this.$refs.iframeWindow.openWindow({
						title: nv.Title,
						url: `/lms-student-lesson-viewer?AssignToClassID=${id}`,
						onclose: () => {
							this.onRefresh();
						}
					});
				}
			},
			async onRefresh() {
				this.DSNhiemVu = await ajaxCALLPromise('lms/EL_Student_Get_NhiemVu_ByHocSinhID', {
					NienKhoa: this.NienKhoa,
					HocSinhID: vueData.user.UserID
				});
			},
			statusInfo(nv) {
				const statuses = {
					'OVERDUE': { key: 'overdue', text: 'Quá hạn' },
					'IN_PROGRESS': { key: 'inprogress', text: nv.ResourceType === 'ASSIGNMENT' ? 'Đang làm' : 'Đang học' },
					'NOT_STARTED': { key: 'notstarted', text: 'Chưa bắt đầu' },
					'RESUBMIT': { key: 'resubmit', text: 'Nộp lại' },
				};
				return statuses[nv.Status] || statuses['NOT_STARTED'];
			},
			dueDateInfo(nv) {
				if (!nv.DueDate) return { text: '', colorClass: '' };
				const now = new Date();
				const due = new Date(nv.DueDate);
				const diff = Math.floor((due - now) / 1000);
				if (diff < 0) return { text: 'Đã quá hạn', colorClass: 'nv__due--overdue' };
				const mins = Math.floor(diff / 60);
				if (mins < 60) return { text: `còn ${mins} phút`, colorClass: 'nv__due--urgent' };
				const hrs = Math.floor(mins / 60);
				if (hrs < 24) return { text: `còn ${hrs} giờ`, colorClass: 'nv__due--urgent' };
				const days = Math.ceil((due - now) / 86400000);
				return { text: `còn ${days} ngày`, colorClass: 'nv__due--ok' };
			},
		}
	}
</script>