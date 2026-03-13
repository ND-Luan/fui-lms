<template>
	<v-app :theme="isDark ? 'dark' : 'light'">
		<!-- ===== APP BAR ===== -->
		<v-app-bar elevation="0" border="b" color="surface">
			<v-app-bar-title>
				<span class="showcase-title">
					<v-icon color="primary" class="mr-2">mdi-palette-outline</v-icon>
					FUI-LMS · UI Showcase
				</span>
			</v-app-bar-title>
			<template #append>
				<v-btn :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'" variant="text"
					@click="isDark = !isDark" />
			</template>
		</v-app-bar>

		<v-main>
			<v-container fluid class="pa-6" style="max-width: 1400px; margin: 0 auto;">

				<!-- ===== SECTION: TYPOGRAPHY ===== -->
				<section-header title="01 · Typography & Colors" icon="mdi-format-font" />
				<v-card class="showcase-card mb-8">
					<v-card-text class="pa-6">
						<div class="d-flex flex-wrap gap-3 mb-6">
							<v-chip color="primary" variant="tonal">primary</v-chip>
							<v-chip color="secondary" variant="tonal">secondary</v-chip>
							<v-chip color="success" variant="tonal">success</v-chip>
							<v-chip color="warning" variant="tonal">warning</v-chip>
							<v-chip color="error" variant="tonal">error</v-chip>
							<v-chip color="info" variant="tonal">info</v-chip>
						</div>
						<div class="d-flex flex-column ga-2">
							<span style="font-size:2rem;font-weight:700;line-height:1.2">Heading 1 · Quản lý học
								tập</span>
							<span style="font-size:1.5rem;font-weight:600">Heading 2 · Bảng điểm học sinh</span>
							<span style="font-size:1.2rem;font-weight:500">Heading 3 · Nhập điểm kỳ I</span>
							<span style="font-size:var(--font-size-base)">Body · Nguyễn Văn An đã nộp bài tập vào lúc
								08:32 ngày 12/03/2025</span>
							<span style="font-size:0.75rem;color:#6b7280">Caption · Cập nhật lần cuối: 12/03/2025</span>
						</div>
					</v-card-text>
				</v-card>

				<!-- ===== SECTION: BUTTONS ===== -->
				<section-header title="02 · Buttons" icon="mdi-gesture-tap-button" />
				<v-card class="showcase-card mb-8">
					<v-card-text class="pa-6">
						<div class="showcase-label">Variants</div>
						<div class="d-flex flex-wrap align-center ga-3 mb-5">
							<v-btn color="primary" variant="elevated">Elevated</v-btn>
							<v-btn color="primary" variant="tonal">Tonal</v-btn>
							<v-btn color="primary" variant="outlined">Outlined</v-btn>
							<v-btn color="primary" variant="text">Text</v-btn>
							<v-btn color="primary" variant="plain">Plain</v-btn>
							<v-btn color="primary" variant="icon" icon="mdi-plus" />
						</div>
						<div class="showcase-label">Sizes</div>
						<div class="d-flex flex-wrap align-center ga-3 mb-5">
							<v-btn color="primary" variant="tonal" size="x-small">x-small</v-btn>
							<v-btn color="primary" variant="tonal" size="small">small</v-btn>
							<v-btn color="primary" variant="tonal" size="default">default</v-btn>
							<v-btn color="primary" variant="tonal" size="large">large</v-btn>
							<v-btn color="primary" variant="tonal" size="x-large">x-large</v-btn>
						</div>
						<div class="showcase-label">With Icons</div>
						<div class="d-flex flex-wrap align-center ga-3 mb-5">
							<v-btn color="primary" variant="elevated" prepend-icon="mdi-plus">Thêm mới</v-btn>
							<v-btn color="success" variant="tonal" prepend-icon="mdi-check">Duyệt</v-btn>
							<v-btn color="error" variant="outlined" prepend-icon="mdi-delete">Xóa</v-btn>
							<v-btn color="warning" variant="tonal" prepend-icon="mdi-export">Xuất Excel</v-btn>
							<v-btn color="info" variant="tonal" append-icon="mdi-arrow-right">Chi tiết</v-btn>
						</div>
						<div class="showcase-label">Loading & Disabled</div>
						<div class="d-flex flex-wrap align-center ga-3">
							<v-btn color="primary" variant="elevated" :loading="btnLoading" @click="toggleBtnLoading">
								{{ btnLoading ? 'Đang lưu...' : 'Lưu dữ liệu' }}
							</v-btn>
							<v-btn color="primary" variant="elevated" disabled>Disabled</v-btn>
							<v-btn color="primary" variant="outlined" disabled>Outlined Disabled</v-btn>
						</div>
					</v-card-text>
				</v-card>

				<!-- ===== SECTION: CHIPS ===== -->
				<section-header title="03 · Chips" icon="mdi-tag-multiple-outline" />
				<v-card class="showcase-card mb-8">
					<v-card-text class="pa-6">
						<div class="showcase-label">Status Chips</div>
						<div class="d-flex flex-wrap gap-3 mb-5">
							<v-chip color="success" variant="tonal" prepend-icon="mdi-check-circle">Hoàn thành</v-chip>
							<v-chip color="warning" variant="tonal" prepend-icon="mdi-clock-outline">Đang xử lý</v-chip>
							<v-chip color="error" variant="tonal" prepend-icon="mdi-alert-circle">Lỗi</v-chip>
							<v-chip color="info" variant="tonal" prepend-icon="mdi-information">Thông tin</v-chip>
							<v-chip color="primary" variant="tonal" prepend-icon="mdi-school">Cấp 2</v-chip>
						</div>
						<div class="showcase-label">Closable</div>
						<div class="d-flex flex-wrap gap-3 mb-5">
							<v-chip v-for="chip in chips" :key="chip.text" :color="chip.color" variant="tonal" closable
								@click:close="removeChip(chip)">{{ chip.text }}</v-chip>
						</div>
						<div class="showcase-label">Dot Indicator</div>
						<div class="d-flex flex-wrap align-center gap-3">
							<v-chip size="small"><template #prepend><span
										class="status-dot dot-online"></span></template>Trực tuyến</v-chip>
							<v-chip size="small"><template #prepend><span
										class="status-dot dot-busy"></span></template>Bận</v-chip>
							<v-chip size="small"><template #prepend><span
										class="status-dot dot-offline"></span></template>Ngoại tuyến</v-chip>
						</div>
					</v-card-text>
				</v-card>

				<!-- ===== SECTION: STAT CARDS ===== -->
				<section-header title="04 · Cards" icon="mdi-card-multiple-outline" />
				<v-row class="mb-4">
					<v-col v-for="stat in stats" :key="stat.label" cols="12" sm="6" md="3">
						<v-card class="showcase-card stat-card">
							<v-card-text class="pa-5">
								<div class="d-flex align-start justify-space-between mb-3">
									<div>
										<div class="stat-label">{{ stat.label }}</div>
										<div class="stat-value">{{ stat.value }}</div>
									</div>
									<v-avatar :color="stat.color" variant="tonal" size="44" rounded="lg">
										<v-icon :color="stat.color">{{ stat.icon }}</v-icon>
									</v-avatar>
								</div>
								<div class="d-flex align-center ga-1">
									<v-icon :color="stat.trend > 0 ? 'success' : 'error'" size="16">
										{{ stat.trend > 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
									</v-icon>
									<span :class="stat.trend > 0 ? 'text-success' : 'text-error'"
										style="font-size:0.8rem;font-weight:600">
										{{ Math.abs(stat.trend) }}%
									</span>
									<span style="font-size:0.75rem;color:#9ca3af">so với tháng trước</span>
								</div>
							</v-card-text>
						</v-card>
					</v-col>
				</v-row>

				<!-- Activity & List Cards -->
				<v-row class="mb-8">
					<v-col cols="12" md="6">
						<v-card class="showcase-card" height="100%">
							<v-card-title class="pa-4 pb-2 d-flex align-center ga-2">
								<v-icon color="primary" size="20">mdi-bell-outline</v-icon>
								Hoạt động gần đây
							</v-card-title>
							<v-card-text class="pa-0">
								<v-list lines="two">
									<v-list-item v-for="act in activities" :key="act.id" :prepend-avatar="act.avatar"
										:title="act.user" :subtitle="act.action">
										<template #append>
											<span style="font-size:0.72rem;color:#9ca3af">{{ act.time }}</span>
										</template>
									</v-list-item>
								</v-list>
							</v-card-text>
						</v-card>
					</v-col>
					<v-col cols="12" md="6">
						<v-card class="showcase-card" height="100%">
							<v-card-title class="pa-4 pb-2 d-flex align-center ga-2">
								<v-icon color="primary" size="20">mdi-account-group-outline</v-icon>
								Danh sách người dùng
							</v-card-title>
							<v-card-text class="pa-0">
								<v-list>
									<v-list-item v-for="user in users" :key="user.id" :title="user.name"
										:subtitle="user.role">
										<template #prepend>
											<v-avatar :color="user.color" variant="tonal" size="38">
												<span style="font-size:0.8rem;font-weight:700">{{ user.initials
													}}</span>
											</v-avatar>
										</template>
										<template #append>
											<v-chip :color="user.online ? 'success' : 'default'" size="x-small"
												variant="tonal">
												{{ user.online ? 'Online' : 'Offline' }}
											</v-chip>
										</template>
									</v-list-item>
								</v-list>
							</v-card-text>
						</v-card>
					</v-col>
				</v-row>

				<!-- ===== SECTION: DATA TABLE ===== -->
				<section-header title="05 · Data Table" icon="mdi-table" />
				<v-card class="showcase-card mb-8">
					<v-card-title class="pa-4 pb-0 d-flex align-center justify-space-between flex-wrap ga-3">
						<div class="d-flex align-center ga-2">
							<v-icon color="primary" size="20">mdi-receipt-text-outline</v-icon>
							Danh sách đơn hàng
						</div>
						<div class="d-flex align-center ga-2">
							<v-text-field v-model="tableSearch" placeholder="Tìm kiếm..."
								prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" hide-details
								style="max-width:220px" />
							<v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" size="small">Thêm mới</v-btn>
						</div>
					</v-card-title>
					<v-data-table :headers="tableHeaders" :items="tableItems" :search="tableSearch" density="compact"
						hover fixed-header class="showcase-table">
						<template #item.status="{ item }">
							<v-chip :color="statusColor(item.status)" variant="tonal" size="small"
								:prepend-icon="statusIcon(item.status)">
								{{ item.status }}
							</v-chip>
						</template>
						<template #item.amount="{ item }">
							<span style="font-weight:600">{{ item.amount }}</span>
						</template>
						<template #item.actions="{ item }">
							<div class="d-flex ga-1">
								<v-btn icon="mdi-eye-outline" variant="text" size="x-small" color="primary" />
								<v-btn icon="mdi-pencil-outline" variant="text" size="x-small" color="warning" />
								<v-btn icon="mdi-delete-outline" variant="text" size="x-small" color="error" />
							</div>
						</template>
					</v-data-table>
				</v-card>

				<!-- ===== SECTION: FORM INPUTS ===== -->
				<section-header title="06 · Form Inputs" icon="mdi-form-select" />
				<v-card class="showcase-card mb-8">
					<v-card-text class="pa-6">
						<v-row>
							<v-col cols="12" sm="6">
								<div class="showcase-label">Text Field</div>
								<v-text-field v-model="formData.name" label="Họ và tên" placeholder="Nguyễn Văn An"
									variant="outlined" density="comfortable" prepend-inner-icon="mdi-account-outline"
									clearable hide-details="auto" class="mb-4" />
								<v-text-field v-model="formData.email" label="Email" placeholder="example@school.edu.vn"
									variant="outlined" density="comfortable" prepend-inner-icon="mdi-email-outline"
									type="email"
									:rules="[v => !!v || 'Bắt buộc nhập', v => /.+@.+/.test(v) || 'Email không hợp lệ']"
									class="mb-4" />
								<v-text-field v-model="formData.password" label="Mật khẩu" variant="outlined"
									density="comfortable" prepend-inner-icon="mdi-lock-outline"
									:append-inner-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
									:type="showPass ? 'text' : 'password'" hide-details
									@click:append-inner="showPass = !showPass" />
							</v-col>
							<v-col cols="12" sm="6">
								<div class="showcase-label">Select & Autocomplete</div>
								<v-select v-model="formData.role" :items="roleOptions" label="Vai trò"
									variant="outlined" density="comfortable"
									prepend-inner-icon="mdi-shield-account-outline" hide-details class="mb-4" />
								<v-select v-model="formData.grade" :items="gradeOptions" label="Cấp học"
									variant="outlined" density="comfortable" prepend-inner-icon="mdi-school-outline"
									hide-details class="mb-4" />
								<v-autocomplete v-model="formData.subject" :items="subjectOptions" label="Môn học"
									variant="outlined" density="comfortable" prepend-inner-icon="mdi-book-open-outline"
									clearable hide-details no-data-text="Không tìm thấy môn học" />
							</v-col>
							<v-col cols="12">
								<div class="showcase-label">Textarea</div>
								<v-textarea v-model="formData.note" label="Ghi chú" variant="outlined"
									density="comfortable" rows="3" auto-grow counter="200" hide-details="auto" />
							</v-col>
							<v-col cols="12">
								<div class="showcase-label">Checkbox & Switch</div>
								<div class="d-flex flex-wrap align-center ga-6">
									<v-checkbox v-model="formData.notify" label="Nhận thông báo qua email"
										color="primary" hide-details density="compact" />
									<v-checkbox v-model="formData.terms" label="Đồng ý điều khoản sử dụng"
										color="primary" hide-details density="compact" />
									<v-switch v-model="formData.active" label="Kích hoạt tài khoản" color="primary"
										hide-details density="compact" inset />
									<v-switch v-model="formData.twofa" label="Xác thực 2 bước" color="success"
										hide-details density="compact" inset />
								</div>
							</v-col>
							<v-col cols="12" sm="6">
								<div class="showcase-label">Radio Group</div>
								<v-radio-group v-model="formData.gender" inline hide-details color="primary">
									<v-radio label="Nam" value="male" />
									<v-radio label="Nữ" value="female" />
									<v-radio label="Khác" value="other" />
								</v-radio-group>
							</v-col>
							<v-col cols="12" sm="6">
								<div class="showcase-label">File Input</div>
								<v-file-input label="Tải lên tài liệu" variant="outlined" density="comfortable"
									prepend-icon="" prepend-inner-icon="mdi-paperclip" accept=".pdf,.docx,.xlsx"
									hide-details />
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>

				<!-- ===== SECTION: ALERTS ===== -->
				<section-header title="07 · Alerts" icon="mdi-alert-circle-outline" />
				<v-card class="showcase-card mb-8">
					<v-card-text class="pa-6 d-flex flex-column ga-3">
						<v-alert v-if="alerts.success" type="success" variant="tonal" closable title="Thành công"
							text="Điểm học sinh đã được nhập và gửi lên Ban Giám hiệu thành công." density="comfortable"
							@click:close="alerts.success = false" />
						<v-alert v-if="alerts.warning" type="warning" variant="tonal" closable title="Cảnh báo"
							text="Hạn nộp điểm học kỳ I sẽ kết thúc vào ngày 20/03/2025. Vui lòng hoàn thành trước hạn."
							density="comfortable" @click:close="alerts.warning = false" />
						<v-alert v-if="alerts.error" type="error" variant="tonal" closable title="Lỗi kết nối"
							text="Không thể lấy dữ liệu từ máy chủ. Vui lòng kiểm tra kết nối internet và thử lại."
							density="comfortable" @click:close="alerts.error = false" />
						<v-alert v-if="alerts.info" type="info" variant="tonal" closable title="Thông báo"
							text="Hệ thống sẽ bảo trì vào 23:00 ngày 15/03/2025. Vui lòng lưu dữ liệu trước thời điểm này."
							density="comfortable" @click:close="alerts.info = false" />
						<div v-if="!alerts.success && !alerts.warning && !alerts.error && !alerts.info"
							class="text-center py-4">
							<v-btn color="primary" variant="tonal" @click="resetAlerts">Hiện lại tất cả alert</v-btn>
						</div>
					</v-card-text>
				</v-card>

				<!-- ===== SECTION: PROGRESS ===== -->
				<section-header title="08 · Progress, Rating & Loader" icon="mdi-chart-donut" />
				<v-card class="showcase-card mb-8">
					<v-card-text class="pa-6">
						<v-row>
							<v-col cols="12" md="6">
								<div class="showcase-label">Progress Linear</div>
								<div class="d-flex flex-column ga-4">
									<div v-for="prog in progressList" :key="prog.label">
										<div class="d-flex justify-space-between mb-1">
											<span style="font-size:0.8rem">{{ prog.label }}</span>
											<span style="font-size:0.8rem;font-weight:600"
												:class="progressTextClass(prog.color)">{{ prog.value }}%</span>
										</div>
										<v-progress-linear :model-value="prog.value" :color="prog.color" rounded
											height="8" bg-color="grey-lighten-3" />
									</div>
								</div>
							</v-col>
							<v-col cols="12" md="3">
								<div class="showcase-label">Progress Circular</div>
								<div class="d-flex flex-wrap ga-4 align-center justify-center mt-2">
									<v-progress-circular :model-value="78" color="primary" :size="80" :width="7">
										<span style="font-size:0.9rem;font-weight:700">78%</span>
									</v-progress-circular>
									<v-progress-circular :model-value="92" color="success" :size="80" :width="7">
										<span style="font-size:0.9rem;font-weight:700">92%</span>
									</v-progress-circular>
									<v-progress-circular indeterminate color="primary" :size="44" :width="4" />
								</div>
							</v-col>
							<v-col cols="12" md="3">
								<div class="showcase-label">Rating</div>
								<div class="d-flex flex-column ga-4 mt-2">
									<div>
										<div style="font-size:0.78rem;color:#6b7280;margin-bottom:4px">Chất lượng bài
											giảng</div>
										<v-rating v-model="ratings.lesson" color="warning" half-increments hover
											active-color="warning" density="compact" />
									</div>
									<div>
										<div style="font-size:0.78rem;color:#6b7280;margin-bottom:4px">Độ hài lòng học
											sinh</div>
										<v-rating v-model="ratings.satisfaction" color="primary" hover
											active-color="primary" density="compact" />
									</div>
									<div>
										<div style="font-size:0.78rem;color:#6b7280;margin-bottom:4px">Giáo viên
											(readonly)</div>
										<v-rating :model-value="4.2" color="success" half-increments readonly
											active-color="success" density="compact" />
									</div>
								</div>
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>

				<!-- ===== SECTION: TABS ===== -->
				<section-header title="09 · Tabs & Expansion Panels" icon="mdi-tab" />
				<v-card class="showcase-card mb-6">
					<v-tabs v-model="activeTab" color="primary" density="compact">
						<v-tab value="overview">Tổng quan</v-tab>
						<v-tab value="scores">Điểm số</v-tab>
						<v-tab value="attendance">Điểm danh</v-tab>
						<v-tab value="feedback">Nhận xét</v-tab>
					</v-tabs>
					<v-divider />
					<v-tabs-window v-model="activeTab">
						<v-tabs-window-item value="overview" class="pa-5">
							<div class="d-flex ga-4 flex-wrap mb-3">
								<v-chip color="primary" variant="tonal" prepend-icon="mdi-account">Nguyễn Văn An ·
									10A1</v-chip>
								<v-chip color="success" variant="tonal" prepend-icon="mdi-trophy">Học lực: Giỏi</v-chip>
								<v-chip color="info" variant="tonal" prepend-icon="mdi-star">Hạnh kiểm: Tốt</v-chip>
							</div>
							<p style="color:#4b5563;font-size:0.9rem">Học sinh Nguyễn Văn An có thành tích học tập tốt
								trong học kỳ I năm 2024–2025. Tham gia đầy đủ các buổi học và hoàn thành bài tập đúng
								hạn.</p>
						</v-tabs-window-item>
						<v-tabs-window-item value="scores" class="pa-5">
							<div class="d-flex ga-3 flex-wrap">
								<v-card v-for="s in subjectScores" :key="s.subject" variant="tonal" color="primary"
									rounded="lg" class="pa-3" style="min-width:120px">
									<div style="font-size:0.75rem;color:#6b7280">{{ s.subject }}</div>
									<div style="font-size:1.6rem;font-weight:700;color:var(--primary)">{{ s.score }}
									</div>
									<v-chip :color="s.score >= 8 ? 'success' : s.score >= 6.5 ? 'warning' : 'error'"
										size="x-small" variant="flat">
										{{ s.score >= 8 ? 'Giỏi' : s.score >= 6.5 ? 'Khá' : 'TB' }}
									</v-chip>
								</v-card>
							</div>
						</v-tabs-window-item>
						<v-tabs-window-item value="attendance" class="pa-5">
							<v-row>
								<v-col cols="6" sm="3" v-for="att in attendanceSummary" :key="att.label">
									<div style="text-align:center">
										<div style="font-size:1.8rem;font-weight:700"
											:class="progressTextClass(att.color)">{{ att.value }}</div>
										<div style="font-size:0.78rem;color:#6b7280">{{ att.label }}</div>
									</div>
								</v-col>
							</v-row>
						</v-tabs-window-item>
						<v-tabs-window-item value="feedback" class="pa-5">
							<v-alert type="info" variant="tonal" density="compact" class="mb-3"
								text="Nhận xét tháng 2/2025 đã được tổ trưởng duyệt." />
							<p style="font-size:0.9rem;color:#374151">Em Nguyễn Văn An chăm chỉ học tập, tích cực tham
								gia phát biểu xây dựng bài. Cần cải thiện kỹ năng trình bày bài Văn và rèn luyện tư duy
								phản biện.</p>
						</v-tabs-window-item>
					</v-tabs-window>
				</v-card>

				<v-expansion-panels variant="accordion" class="mb-8 showcase-panels">
					<v-expansion-panel v-for="panel in expansionPanels" :key="panel.title" :title="panel.title">
						<v-expansion-panel-text>{{ panel.content }}</v-expansion-panel-text>
					</v-expansion-panel>
				</v-expansion-panels>

				<!-- ===== SECTION: DIALOG & SNACKBAR ===== -->
				<section-header title="10 · Dialog & Snackbar" icon="mdi-dock-window" />
				<v-card class="showcase-card mb-8">
					<v-card-text class="pa-6">
						<div class="d-flex flex-wrap ga-3">
							<v-btn color="primary" variant="tonal" prepend-icon="mdi-open-in-new" @click="openDialog">Mở
								Dialog</v-btn>
							<v-btn color="success" variant="tonal" prepend-icon="mdi-check"
								@click="showSnackbar('success')">Snackbar Thành công</v-btn>
							<v-btn color="error" variant="tonal" prepend-icon="mdi-alert"
								@click="showSnackbar('error')">Snackbar Lỗi</v-btn>
							<v-btn color="info" variant="tonal" prepend-icon="mdi-information"
								@click="showSnackbar('info')">Snackbar Info</v-btn>
						</div>
					</v-card-text>
				</v-card>

				<!-- ===== SECTION: TOOLTIPS, BADGES, AVATARS ===== -->
				<section-header title="11 · Tooltips, Badges & Avatars" icon="mdi-shape-outline" />
				<v-card class="showcase-card mb-8">
					<v-card-text class="pa-6">
						<div class="showcase-label">Avatars</div>
						<div class="d-flex flex-wrap align-center ga-3 mb-5">
							<v-avatar color="primary" size="56"><span
									style="font-size:1.1rem;font-weight:700;color:white">NV</span></v-avatar>
							<v-avatar color="success" size="56"><span
									style="font-size:1.1rem;font-weight:700;color:white">TH</span></v-avatar>
							<v-avatar color="warning" size="56"><span
									style="font-size:1.1rem;font-weight:700;color:white">LM</span></v-avatar>
							<v-avatar image="https://i.pravatar.cc/56?img=5" size="56" />
							<v-avatar image="https://i.pravatar.cc/56?img=10" size="56" />
							<v-avatar size="56" color="error"><v-icon color="white">mdi-account</v-icon></v-avatar>
						</div>
						<div class="showcase-label">Badges</div>
						<div class="d-flex flex-wrap align-center ga-6 mb-5">
							<v-badge color="error" content="3">
								<v-btn icon="mdi-bell-outline" variant="tonal" color="primary" />
							</v-badge>
							<v-badge color="success" dot>
								<v-avatar color="primary" size="40"><span
										style="font-size:0.9rem;font-weight:700;color:white">GV</span></v-avatar>
							</v-badge>
							<v-badge color="warning" content="12" max="9">
								<v-btn icon="mdi-email-outline" variant="tonal" color="primary" />
							</v-badge>
						</div>
						<div class="showcase-label">Tooltips</div>
						<div class="d-flex flex-wrap align-center ga-3">
							<v-tooltip text="Chỉnh sửa thông tin" location="top">
								<template #activator="{ props }">
									<v-btn v-bind="props" icon="mdi-pencil-outline" color="primary" variant="tonal" />
								</template>
							</v-tooltip>
							<v-tooltip text="Xóa bản ghi này" location="top">
								<template #activator="{ props }">
									<v-btn v-bind="props" icon="mdi-delete-outline" color="error" variant="tonal" />
								</template>
							</v-tooltip>
							<v-tooltip text="Xuất ra file Excel" location="top">
								<template #activator="{ props }">
									<v-btn v-bind="props" icon="mdi-microsoft-excel" color="success" variant="tonal" />
								</template>
							</v-tooltip>
							<v-tooltip text="Tải tài liệu PDF" location="right">
								<template #activator="{ props }">
									<v-btn v-bind="props" variant="tonal" color="warning"
										prepend-icon="mdi-file-pdf-box">Xuất PDF</v-btn>
								</template>
							</v-tooltip>
						</div>
					</v-card-text>
				</v-card>

				<div style="height:48px"></div>
			</v-container>
		</v-main>

		<!-- ===== DIALOG ===== -->
		<v-dialog v-model="dialog" max-width="520" :z-index="1010">
			<v-card class="showcase-card">
				<v-toolbar color="primary" density="compact" flat>
					<v-toolbar-title class="d-flex align-center ga-2">
						<v-icon>mdi-account-plus-outline</v-icon>
						Thêm học sinh mới
					</v-toolbar-title>
					<template #append>
						<v-btn icon="mdi-close" variant="text" color="white" @click="closeDialog" />
					</template>
				</v-toolbar>
				<v-card-text class="pa-5">
					<v-row dense>
						<v-col cols="6">
							<v-text-field label="Họ và tên đệm" variant="outlined" density="comfortable" hide-details />
						</v-col>
						<v-col cols="6">
							<v-text-field label="Tên" variant="outlined" density="comfortable" hide-details />
						</v-col>
						<v-col cols="12">
							<v-select :items="gradeOptions" label="Cấp học" variant="outlined" density="comfortable"
								hide-details class="mt-3" />
						</v-col>
						<v-col cols="6">
							<v-text-field label="Ngày sinh" variant="outlined" density="comfortable"
								placeholder="dd/mm/yyyy" hide-details class="mt-3" />
						</v-col>
						<v-col cols="6">
							<v-select :items="['Nam','Nữ','Khác']" label="Giới tính" variant="outlined"
								density="comfortable" hide-details class="mt-3" />
						</v-col>
					</v-row>
				</v-card-text>
				<v-divider />
				<v-card-actions class="pa-4 ga-2 justify-end">
					<v-btn variant="text" @click="closeDialog">Hủy</v-btn>
					<v-btn color="primary" variant="elevated" prepend-icon="mdi-content-save-outline"
						@click="saveDialog">Lưu</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- ===== SNACKBAR ===== -->
		<v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3500" location="bottom right" variant="tonal"
			rounded="lg">
			<div class="d-flex align-center ga-2">
				<v-icon>{{ snackbarIcon }}</v-icon>
				{{ snackbarText }}
			</div>
			<template #actions>
				<v-btn icon="mdi-close" variant="text" size="small" @click="snackbar = false" />
			</template>
		</v-snackbar>
	</v-app>
</template>

<script>
	export default {
		data() {
			return {
				// ---- theme ----
				isDark: false,
	
				// ---- button loading ----
				btnLoading: false,
	
				// ---- dialog & snackbar ----
				dialog: false,
				snackbar: false,
				snackbarText: '',
				snackbarColor: 'success',
				snackbarIcon: 'mdi-check-circle',
	
				// ---- form state ----
				showPass: false,
	
				// ---- tabs ----
				activeTab: 'overview',
	
				// ---- table ----
				tableSearch: '',
	
				// ---- chips ----
				chips: [
					{ text: 'Toán', color: 'primary' },
					{ text: 'Vật Lý', color: 'info' },
					{ text: 'Hóa Học', color: 'success' },
					{ text: 'Sinh Học', color: 'warning' },
					{ text: 'Lịch Sử', color: 'secondary' },
				],
	
				// ---- alerts ----
				alerts: { success: true, warning: true, error: true, info: true },
	
				// ---- ratings ----
				ratings: { lesson: 4.5, satisfaction: 4 },
	
				// ---- stats ----
				stats: [
					{ label: 'Tổng học sinh', value: '1.248', icon: 'mdi-account-group', color: 'primary', trend: 5.2 },
					{ label: 'Giáo viên', value: '87', icon: 'mdi-human-male-board', color: 'success', trend: 2.1 },
					{ label: 'Doanh thu tháng', value: '₫128.500.000', icon: 'mdi-cash-multiple', color: 'warning', trend: -3.4 },
					{ label: 'Tỉ lệ hoàn thành', value: '94,2%', icon: 'mdi-chart-line', color: 'info', trend: 1.8 },
				],
	
				// ---- users ----
				users: [
					{ id: 1, name: 'Nguyễn Thị Hương', role: 'Giáo viên Toán', initials: 'NH', color: 'primary', online: true },
					{ id: 2, name: 'Trần Văn Minh', role: 'Quản trị viên', initials: 'TM', color: 'success', online: true },
					{ id: 3, name: 'Lê Thị Lan', role: 'Kế toán', initials: 'LL', color: 'warning', online: false },
					{ id: 4, name: 'Phạm Quốc Hùng', role: 'Nhân viên kho', initials: 'PH', color: 'info', online: false },
					{ id: 5, name: 'Đỗ Thị Bích Ngọc', role: 'Giáo viên Văn', initials: 'DN', color: 'secondary', online: true },
				],
	
				// ---- activities ----
				activities: [
					{ id: 1, user: 'Nguyễn Thị Hương', action: 'Đã nhập điểm lớp 10A1 – môn Toán', time: '08:32', avatar: 'https://i.pravatar.cc/40?img=1' },
					{ id: 2, user: 'Trần Văn Minh', action: 'Duyệt nhận xét tháng 2/2025', time: '09:15', avatar: 'https://i.pravatar.cc/40?img=3' },
					{ id: 3, user: 'Lê Thị Lan', action: 'Xuất báo cáo tổng kết học kỳ', time: '10:08', avatar: 'https://i.pravatar.cc/40?img=5' },
					{ id: 4, user: 'Phạm Quốc Hùng', action: 'Tạo đơn mua học liệu #DH20250312', time: '11:45', avatar: 'https://i.pravatar.cc/40?img=7' },
				],
	
				// ---- table data ----
				tableHeaders: [
					{ title: 'Mã đơn', key: 'code', sortable: true, width: '110px' },
					{ title: 'Học sinh', key: 'student', sortable: true },
					{ title: 'Lớp', key: 'class', sortable: false },
					{ title: 'Vai trò', key: 'role', sortable: true },
					{ title: 'Số tiền', key: 'amount', sortable: true, align: 'end' },
					{ title: 'Ngày', key: 'date', sortable: true },
					{ title: 'Trạng thái', key: 'status', sortable: true },
					{ title: 'Thao tác', key: 'actions', sortable: false, align: 'center', width: '100px' },
				],
				tableItems: [
					{ code: '#DH001', student: 'Nguyễn Văn An', class: '10A1', role: 'Học sinh', amount: '₫1.250.000', date: '01/03/2025', status: 'Hoàn thành' },
					{ code: '#DH002', student: 'Trần Thị Bảo', class: '11B2', role: 'Học sinh', amount: '₫870.000', date: '03/03/2025', status: 'Đang xử lý' },
					{ code: '#DH003', student: 'Lê Quốc Cường', class: '12C3', role: 'Học sinh', amount: '₫2.100.000', date: '05/03/2025', status: 'Hoàn thành' },
					{ code: '#DH004', student: 'Phạm Thị Dung', class: '9A4', role: 'Học sinh', amount: '₫540.000', date: '07/03/2025', status: 'Hủy' },
					{ code: '#DH005', student: 'Đỗ Minh Đức', class: '8B1', role: 'Học sinh', amount: '₫990.000', date: '10/03/2025', status: 'Đang xử lý' },
					{ code: '#DH006', student: 'Hoàng Lan Anh', class: '7A2', role: 'Học sinh', amount: '₫1.650.000', date: '12/03/2025', status: 'Hoàn thành' },
				],
	
				// ---- progress ----
				progressList: [
					{ label: 'Tiến độ nhập điểm Toán', value: 87, color: 'primary' },
					{ label: 'Hoàn thành bài tập Văn', value: 65, color: 'success' },
					{ label: 'Điểm danh tháng 3', value: 94, color: 'info' },
					{ label: 'Tỉ lệ nộp bài Lý', value: 42, color: 'warning' },
				],
	
				// ---- form data ----
				formData: {
					name: 'Nguyễn Văn An',
					email: 'nvan.an@school.edu.vn',
					password: '',
					role: 'Giáo viên',
					grade: 'Cấp 2 (THCS)',
					subject: 'Toán',
					note: '',
					notify: true,
					terms: false,
					active: true,
					twofa: false,
					gender: 'male',
					dob: '15/08/2000',
				},
				roleOptions: ['Quản trị viên', 'Giáo viên', 'Kế toán', 'Nhân viên kho', 'Ban Giám hiệu'],
				gradeOptions: ['Cấp 1 (Tiểu học)', 'Cấp 2 (THCS)', 'Cấp 3 (THPT)'],
				subjectOptions: ['Toán', 'Văn', 'Tiếng Anh', 'Vật Lý', 'Hóa Học', 'Sinh Học', 'Lịch Sử', 'Địa Lý', 'GDCD', 'Tin Học', 'Thể Dục'],
	
				// ---- scores tab ----
				subjectScores: [
					{ subject: 'Toán', score: 9.2 },
					{ subject: 'Văn', score: 7.8 },
					{ subject: 'Tiếng Anh', score: 8.5 },
					{ subject: 'Vật Lý', score: 8.0 },
					{ subject: 'Hóa', score: 6.5 },
					{ subject: 'Sinh', score: 7.2 },
				],
	
				// ---- attendance tab ----
				attendanceSummary: [
					{ label: 'Có mặt', value: 84, color: 'success' },
					{ label: 'Vắng phép', value: 3, color: 'warning' },
					{ label: 'Vắng không phép', value: 1, color: 'error' },
					{ label: 'Tổng buổi', value: 88, color: 'primary' },
				],
	
				// ---- expansion panels ----
				expansionPanels: [
					{
						title: 'Cấu hình cột điểm học kỳ I',
						content: 'Bao gồm các cột điểm thường xuyên (hệ số 1), điểm giữa kỳ (hệ số 2) và điểm cuối kỳ (hệ số 3). Giáo viên có thể tùy chỉnh số lượng cột điểm trong phần Cấu hình hệ thống.',
					},
					{
						title: 'Quy trình duyệt điểm',
						content: 'Giáo viên nhập điểm → Gửi lên Ban Giám hiệu → BGH xem xét và duyệt → Hệ thống chốt điểm → Thông báo đến phụ huynh và học sinh qua ứng dụng di động.',
					},
					{
						title: 'Hướng dẫn xuất báo cáo',
						content: 'Truy cập module Báo cáo → Chọn loại báo cáo (học kỳ / năm học) → Chọn lớp và năm học → Nhấn Xuất Excel hoặc In PDF để tải về máy tính.',
					},
				],
			}
		},
		computed: {
			progressTextClass() {
				return (color) => {
					const map = {
						primary: 'text-primary',
						secondary: 'text-secondary',
						success: 'text-success',
						warning: 'text-warning',
						error: 'text-error',
						info: 'text-info',
					}
					return map[color] ?? ''
				}
			},
		},
		methods: {
			openDialog() {
				this.dialog = true
			},
			closeDialog() {
				this.dialog = false
			},
			saveDialog() {
				this.closeDialog()
				this.showSnackbar('success')
			},
			showSnackbar(type) {
				const map = {
					success: { text: 'Lưu dữ liệu thành công!', icon: 'mdi-check-circle' },
					error: { text: 'Có lỗi xảy ra. Vui lòng thử lại!', icon: 'mdi-alert-circle' },
					info: { text: 'Hệ thống sẽ bảo trì lúc 23:00 hôm nay.', icon: 'mdi-information' },
				}
				this.snackbarColor = type
				this.snackbarText = map[type].text
				this.snackbarIcon = map[type].icon
				this.snackbar = true
			},
			removeChip(chip) {
				this.chips = this.chips.filter(c => c.text !== chip.text)
			},
			resetAlerts() {
				this.alerts = { success: true, warning: true, error: true, info: true }
			},
			toggleBtnLoading() {
				this.btnLoading = true
				setTimeout(() => { this.btnLoading = false }, 2000)
			},
			statusColor(status) {
				const map = { 'Hoàn thành': 'success', 'Đang xử lý': 'warning', 'Hủy': 'error' }
				return map[status] || 'default'
			},
			statusIcon(status) {
				const map = {
					'Hoàn thành': 'mdi-check-circle-outline',
					'Đang xử lý': 'mdi-clock-outline',
					'Hủy': 'mdi-close-circle-outline',
				}
				return map[status] || 'mdi-help-circle-outline'
			},
		},
	}
</script>