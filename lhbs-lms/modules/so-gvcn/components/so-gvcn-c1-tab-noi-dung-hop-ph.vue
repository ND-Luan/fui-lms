<template>
	<v-card-text class="pa-2 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="ma-2">
			Chọn một lớp ở thanh trên để xem và biên soạn nội dung các buổi họp Phụ huynh học sinh.
		</v-alert>
		<div v-else class="d-flex flex-column ga-4 pa-2">
			<v-card v-for="(meetingTitle, idx) in defaultMeetings" :key="idx" variant="outlined" class="rounded-lg">
				<v-card-title class="bg-lightprimary text-subtitle-1 font-weight-bold d-flex align-center justify-space-between py-2">
					<span>Hội PHHS • {{ meetingTitle }}</span>
				</v-card-title>
				<v-divider />
				<v-card-text class="pa-3">
					<v-textarea
						v-model="notes[idx]"
						label="Nội dung họp Phụ huynh"
						variant="outlined"
						rows="6"
						auto-grow
						hide-details
						placeholder="Nhập nội dung biên bản cuộc họp Phụ huynh..."
					/>
				</v-card-text>
			</v-card>
		</div>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-c1-tab-noi-dung-hop-ph',
		props: {
			selectedLopID: { type: [String, Number], default: '__ALL__' },
			savedRows: { type: Array, default: () => [] },
			sheetHeight: { type: String, default: 'calc(100vh - 230px)' }
		},
		data() {
			return {
				notes: ['', '', ''],
				defaultMeetings: [
					'NỘI DUNG HỌP PHỤ HUYNH LẦN 1',
					'NỘI DUNG HỌP PHỤ HUYNH LẦN 2',
					'NỘI DUNG HỌP PHỤ HUYNH LẦN 3'
				]
			}
		},
		watch: {
			savedRows: {
				immediate: true,
				deep: true,
				handler() {
					this.syncSavedData()
				}
			}
		},
		methods: {
			syncSavedData() {
				const nextNotes = ['', '', '']
				this.defaultMeetings.forEach((title, idx) => {
					const saved = (this.savedRows || []).find(r => r.MeetingIndex === idx || r.DotHop === title) || {}
					nextNotes[idx] = saved.NoiDungChinh || saved.NoiDung || saved.Content || ''
				})
				this.notes = nextNotes
			},
			getRows() {
				return this.defaultMeetings.map((title, idx) => ({
					MeetingIndex: idx,
					DotHop: title,
					NoiDungChinh: this.notes[idx] || ''
				}))
			}
		}
	}
</script>