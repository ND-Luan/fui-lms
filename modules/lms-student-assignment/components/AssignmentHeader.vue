<template>
	<v-card flat border>
		<v-card-text class="py-2">
			<div class="d-flex align-center flex-wrap ga-2">
				<div class="d-flex align-center ga-2">
					<v-icon color="primary">mdi-book-open-variant</v-icon>
					<span class="font-weight-medium text-truncate" style="max-width: 38ch;">
						{{ assignment.Title }}
					</span>
					<v-chip size="small" class="pa-0 font-weight-medium" variant="text" color="primary">
						{{ monHocName }}
					</v-chip>
				</div>

				<v-divider vertical class="mx-2 d-none d-md-block"></v-divider>

				<div class="d-flex align-center ga-2">
					<v-icon size="18">mdi-account-outline</v-icon>
					<span class="text-caption">
						{{ student?.HoTen }} • {{ student?.HocSinhID }}
						<span v-if="student?.HocSinhID" class="text-medium-emphasis">• {{ student?.TenLop }}</span>
					</span>
				</div>

				<v-spacer />

				<!-- Hướng dẫn gọn -->
				<v-tooltip text="Hướng dẫn" v-if="assignment?.Instructions">
					<template #activator="{ props }">
						<v-btn v-bind="props" icon="mdi-information-outline" variant="text" density="comfortable"
							@click="showInstructions = !showInstructions" />
					</template>
				</v-tooltip>
			</div>

			<v-expand-transition>
				<v-alert v-if="showInstructions && assignment.Instructions" class="mt-2" density="comfortable"
					variant="tonal" type="info">
					{{ assignment.Instructions }}
				</v-alert>
			</v-expand-transition>

			<v-expand-transition>
				<v-alert v-if="assignment.Reason" class="mt-2" density="comfortable" variant="tonal" type="warning">
					Lý do yêu cầu nộp lại: {{ assignment.Reason }}
				</v-alert>
			</v-expand-transition>
		</v-card-text>
	</v-card>
</template>

<script>
export default {
	name: 'AssignmentHeader',
	props: {
		assignment: {
			type: Object,
			required: true
		},
		monHocName: {
			type: String,
			default: ''
		},
		student: {
			type: Object,
			default: () => ({})
		},
		draft: {
			type: Object,
			default: () => ({})
		}
	},
	data() {
		return {
			showInstructions: false
		};
	},
	computed: {
		dueDateStatus() {
			if (!this.assignment?.DueDate) {
				return {
					color: 'grey',
					variant: 'outlined',
					icon: 'mdi-calendar-blank',
					text: 'Không giới hạn'
				};
			}

			const now = new Date();
			const dueDate = new Date(this.assignment.DueDate);
			const timeDiff = dueDate.getTime() - now.getTime();
			const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
			const hoursDiff = Math.ceil(timeDiff / (1000 * 3600));

			if (timeDiff < 0) {
				return { color: 'error', variant: 'elevated', icon: 'mdi-clock-alert-outline', text: 'Quá hạn' };
			}
			if (hoursDiff <= 24) {
				return {
					color: 'warning',
					variant: 'elevated',
					icon: 'mdi-clock-fast',
					text: hoursDiff <= 1 ? 'Gấp!' : `Còn ${hoursDiff}h`
				};
			}
			if (daysDiff <= 3) {
				return { color: 'orange', variant: 'elevated', icon: 'mdi-clock-outline', text: `Còn ${daysDiff} ngày` };
			}
			return {
				color: 'success',
				variant: 'tonal',
				icon: 'mdi-clock-check-outline',
				text: daysDiff <= 7 ? `Còn ${daysDiff} ngày` : 'Trong hạn'
			};
		}
	},
	methods: {
		formatDate(dateString) {
			if (!dateString) return 'Chưa có thông tin';
			try {
				const date = new Date(dateString);
				return date.toLocaleString('vi-VN', {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				});
			} catch (e) {
				console.error('Error formatting date:', e);
				return 'Chưa có thông tin';
			}
		}
	}
}
</script>