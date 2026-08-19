<template>
	<div class="assignment-row rounded-lg"
		:style="{ 'border-left': '4px ' + 'solid ' + getBgColor(assignment.ResourceType) }" style="padding: 4px 8px !important">
		<!-- Cột thông tin bài tập -->
		<div class="assignment-details">
			<div class="assignment-title d-flex flex-md-row flex-column gap-2 align-md-center align-start ma-0">
				<div>
					<v-chip size="small" label variant="text" class="pa-0 font-weight-medium"
						:color="assignment.AssignType == 'CLASS' ? '#4CAF50' : '#7E57C2'"> {{
						assignment.AssignType == 'CLASS' ? 'Theo lớp' : "Theo học sinh" }} </v-chip>
					<v-chip size="small" label variant="text" class="pa-0 font-weight-medium"
						:color="getTypeColor(assignment.ResourceType)"> {{
						getNameType(assignment.ResourceType) }} </v-chip>
					<v-chip v-if="assignment.Chuong" size="small" label variant="text" class="pa-0 font-weight-medium"
						color="#d16a6a"
						> {{
						$t('message.Chapter') }}: {{ assignment.Chuong }} </v-chip>
					<v-chip v-if="isHocLieuMappingLoaded && !isHocLieuLinked" size="small" label
						color="warning" variant="tonal" prepend-icon="mdi-file-tree-outline"
						v-tooltip="'Bài này chưa gán mục lục học liệu số'">
						Chưa gán mục lục học liệu số
					</v-chip>
				</div>
				{{ assignment.AssignmentTitle ?? assignment.LessonTitle }}
			</div>
			<div class="assignment-meta d-flex ga-2"
				v-if="assignment.AssignType == 'CLASS' && assignment.ResourceType === 'ASSIGNMENT'">
				<span>{{ $t('message.DueDate') }}: {{ formatDate(assignment.DueDate) }}</span>
				<span>{{ $t('message.HomeworkGiver')}}: {{ assignment.TenGiaoVien }}</span>
			</div>
			<div class="assignment-meta"
				v-if="assignment.AssignType == 'CLASS' && assignment.ResourceType === 'LESSON'">
				Hạn hoàn thành: {{ formatDate(assignment.DueDate) }}
			</div>
		</div>

		<!-- Cột thống kê -->
		<div class="assignment-stats d-flex flex-wrap gap-2 flex-column flex-md-row"
			v-if="assignment.AssignType == 'CLASS'">
			<v-chip size="small" variant="text" color="info" v-if="assignment.ResourceType === 'ASSIGNMENT'">
				{{ $t('message.Submitted') }}: {{ assignment.SubmittedCount }}/{{ assignment.TotalStudentsInClass }}
			</v-chip>
			<v-chip size="small" variant="text" color="info" v-else>
				{{ $t('message.InProgress') }}: {{ assignment.RemainingToComplete }}/{{ assignment.TotalStudentsInClass }}
			</v-chip>
			<v-chip size="small" variant="text" color="#4CAF50" v-if="assignment.ResourceType === 'ASSIGNMENT'">
				{{ $t('message.Graded') }}: {{ assignment.GradedCount }}
			</v-chip>
			<v-chip size="small" variant="text" color="#4CAF50" v-else>
				{{ $t('message.Completed') }}: {{ assignment.CompletedCount }}
			</v-chip>
			<!-- Cột hành động -->
			<div class="assignment-actions">
				<v-btn size="small" variant="outlined" color="primary" @click="chamBai(assignment)"
					class="font-weight-medium" v-if="assignment.ResourceType === 'ASSIGNMENT'">
					<v-icon start class="me-1">mdi-clipboard-check-outline</v-icon>
					{{
					assignment.GradedCount == assignment.TotalStudentsInClass ? $t('message.ReviewGraded') :
					$t('message.GradeNow')
					}}
				</v-btn>
				<v-btn size="small" variant="outlined" color="primary" @click="LearningProgress(assignment)"
					v-if="assignment.ResourceType === 'LESSON'" class="font-weight-medium">
					{{ $t('message.ViewProgress') }}
				</v-btn>
			</div>
		</div>
		<!-- Cột thống kê -->
		<div class="assignment-stats d-flex flex-wrap gap-2 flex-column flex-md-row" v-else>
			<!-- Cột hành động -->
			<div class="assignment-actions">
				<v-btn size="small" variant="outlined" color="primary" @click="chamBai(assignment)"
					class="font-weight-medium" v-if="assignment.ResourceType === 'ASSIGNMENT'">
					{{
					assignment.GradedCount == assignment.TotalStudentsInClass ? $t('message.ReviewGraded') :
					$t('message.GradeNow')
					}}
				</v-btn>
				<v-btn size="small" variant="outlined" color="primary" @click="LearningProgress(assignment)"
					v-if="assignment.ResourceType === 'LESSON'" class="font-weight-medium">
					{{ $t('message.ViewProgress') }}
				</v-btn>
			</div>
		</div>

		<uc-modal-grade-class v-model:isOpen="isOpen" :assignment="assignmentObj" />
	</div>
</template>

<script>
	export default {
		name: 'uc-assignment-status-row',
		props: { assignment: Object },
		data() {
	
			return {
				isOpen: false,
				url: '',
				assignmentObj: {},
				isHocLieuMappingLoaded: false,
				isHocLieuLinked: false
			}
		},
		mounted() { this.loadHocLieuMapping() },
		watch: {
			assignment: { deep: true, handler() { this.loadHocLieuMapping() } }
		},
		methods: {
			loadHocLieuMapping() {
				this.isHocLieuMappingLoaded = false
				const resourceType = this.assignment?.ResourceType
				const resourceID = this.assignment?.ResourceID
					|| (resourceType === 'ASSIGNMENT' ? this.assignment?.AssignmentID : this.assignment?.LessonID)
				if (!resourceType || !resourceID) {
					this.isHocLieuLinked = !!(this.assignment?.HocLieuID && this.assignment?.NoiDungID)
					this.isHocLieuMappingLoaded = true
					return
				}
				ajaxCALL('lms/EL_HocLieuResource_Get', { ResourceType: resourceType, ResourceID: resourceID }, response => {
					const rows = response?.data ?? response ?? []
					const mapping = Array.isArray(rows?.[0]) ? rows[0][0] : (Array.isArray(rows) ? rows[0] : rows)
					this.isHocLieuLinked = !!(mapping?.HocLieuID && mapping?.NoiDungID)
					this.isHocLieuMappingLoaded = true
				})
			},
	
			chamBai(assignment) {
				this.assignmentObj = _.cloneDeep(assignment)
				this.isOpen = true
				// openWindow({
				// 	title: "Giao Bài Tập Theo Lớp",
				// 	url: `/lms_Assignment-Class-Detail?AssignToClassID=${assignment?.AssignToClassID}&LopID=${assignment?.LopID}&MonHocID=${assignment?.MonHocID}`,
				// 	id: "WinGiaoBaiTap111",
				// 	onclose: {
				// 		EXE: "vueData.initPage()"
				// 	}
				// });
			},
			formatDate(dateString) {
				if (!dateString) return 'N/A';
				return new Date(dateString).toLocaleDateString('vi-VN', {
					day: '2-digit', month: '2-digit', year: 'numeric'
				});
			},
			getTypeColor(type) {
				const resourceType = (type || '')
				if (resourceType.includes('ASSIGNMENT')) return '#2196F3';
				if (resourceType.includes('LESSON')) return 'teal';
	
			},
			getBgColor(type) {
				const resourceType = (type || '')
				if (resourceType.includes('ASSIGNMENT')) return '#42A5F5';
				if (resourceType.includes('LESSON')) return '#66BB6A';
	
			},
			getNameType(nameType) {
				const name = (nameType || '')
				if (name.includes('ASSIGNMENT')) return this.$i18n.locale == 'en' ? 'ASSIGNMENT' : 'Bài Tập';
				if (name.includes('LESSON')) return this.$i18n.locale == 'en' ? 'LESSON' : 'Bài Học';
	
			},
			LearningProgress(lesson) {
				this.assignmentObj = _.cloneDeep(lesson)
				this.isOpen = true
			}
		}
	}
</script>