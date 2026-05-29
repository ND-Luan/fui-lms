<template>

	<div class="container" style="height: calc(100dvh - 248px)">
		<v-card class=" mx-auto" style="max-width: 448px;">
			<!-- Header -->
			<v-card-title class=" bg-primary text-white ">
				<div class="d-flex align-center text-subtitle-2	">
					<i class="mdi mdi-school mr-2"></i> English Proficiency Results
				</div>
			</v-card-title>

			<!-- Section 1: Test Results -->
			<v-card class="pa-4">
				<div class="d-flex align-items-center mb-4 ">
					<v-icon icon="mdi-chart-areaspline" class="mr-2" color="primary"></v-icon>
					<span class="font-weight-bold text-subtitle-2">Test Results</span>
				</div>

				<div v-for="skill in skills" :key="skill.name">
					<div class="mb-3 rounded-lg pa-3" :class="'bg-'+skill.bgcolor">
						<div class="d-flex justify-space-between align-center ">
							<div>
								<v-icon :icon="skill.icon" class="mr-2" :color="skill.color"></v-icon>
								<span class="font-weight-bold">{{ skill.label + "(" +skill.percent +"%)" }}</span>
							</div>
							<v-chip :color="skill.color">{{ skill.status }}</v-chip>
						</div>
						<div class="text-sm mt-2">Score: {{ skill.score +"/" + skill.scoreMax }}</div>
					</div>

				</div>

				<!-- Overall -->
				<div class="bg-yellow-lighten-4 pa-2 rounded">

					<div class="pa-2">
						<v-icon icon="mdi-star" class="mr-2" color="yellow-darken-3"></v-icon>
						<span class="font-weight-bold">Overall: 68.75%</span>
					</div>
					<div class="pa-2">
						<v-progress-linear rounded color="yellow-darken-3" model-value="68.75"
							height="10"></v-progress-linear>
					</div>
				</div>

			</v-card>
			<v-divider></v-divider>
			<!-- Section 2: Activities -->

			<v-card class=" pa-4 border-top">

				<div class="d-flex align-items-center mb-4">

					<v-icon icon="mdi-format-list-bulleted" class="mr-2" color="primary"></v-icon>
					<span class="font-weight-bold text-subtitle-2">Activities</span>
				</div>
				<v-row no-gutters>
					<v-col cols="6" v-for="activity in activities" :key="activity.name">
						<div>
							<div class="mb-3 rounded-lg pa-3" :class="'bg-'+activity.bgcolor">
								<div class="d-flex justify-space-between align-center ">
									<div>
										<v-icon :icon="activity.icon" class="mr-2" :color="activity.color"></v-icon>
									</div>
								</div>
								<div>
									<span class=" text-subtitle-1 font-weight-bold">{{ activity.label }}</span>
								</div>
								<div class="text-subtitle-2 mt-2">Score: {{ activity.score +"/" + activity.scoreMax
									}}</div>
								<!-- <div class="text-subtitle-2">Percent: {{ activity.percent +"%" }}</div> -->
							</div>

						</div>
					</v-col>
				</v-row>
			</v-card>
			<v-divider></v-divider>

			<!-- Legend -->
			<v-card class=" pa-4 bg-light">
				<div>
					<v-row class="mb-2">
						<v-col cols="12">
							<v-typography variant="h6" class="font-weight-bold">
								Rating Legend:
							</v-typography>
						</v-col>
					</v-row>

					<v-row class="flex-column">
						<v-col v-for="item in defColor" class="d-flex align-center" cols="12">
							<v-avatar size="20" class="mr-2" :color="item.color"></v-avatar>
							<span class="text-caption">{{item.status +" "+ item.des}}</span>

						</v-col>
						<!-- <v-col class="d-flex align-center" cols="12">
								<v-avatar size="15" class="mr-2" color="primary"></v-avatar>
								<span class="text-caption">Exceeded (≥80%)</span>
							</v-col>
							<v-col class="d-flex align-center" cols="12">
								<v-avatar size="15" class="mr-2" color="success"></v-avatar>
								<span class="text-caption">Met (50-79%)</span>
							</v-col>
							<v-col class="d-flex align-center" cols="12">
								<v-avatar size="15" class="mr-2" color="error"></v-avatar>
								<span class="text-caption">Not met (&lt;50%)</span>
							</v-col> -->
					</v-row>
				</div>
			</v-card>


		</v-card>
	</div>


</template>

<script>
	export default {
		props: [],
		data() {
			return {
				skills: [
					{
						label: "Listening",
						name: "Listening",
						percent: 30,
						status: "Not Meet",
						score: 0.675,
						scoreMax: 2.25,
						icon: "mdi mdi-headphones",
	
	
					},
	
					{
						label: "Reading",
						name: "Reading",
						percent: 53,
						status: "Meet",
						score: 1.2,
						scoreMax: 2.25,
						icon: "mdi mdi-book-open-variant-outline",
	
					},
					{
						label: "Writing",
						name: "Writing",
						percent: 100,
						status: "Exceeded",
						score: "1",
						scoreMax: 1,
						icon: "mdi mdi-lead-pencil",
	
					},
					{
						label: "Speaking",
						name: "Speaking",
						percent: 90,
						status: "Exceeded",
						score: 1.8,
						scoreMax: 2,
						icon: "mdi mdi-forum",
	
					}
				],
				activities: [
					{
						label: "EC Videos",
						name: "EC Videos",
						percent: 30,
						status: "Not Meet",
						score: 0.675,
						scoreMax: 2.25,
						icon: "mdi mdi-video",
	
	
					},
	
					{
						label: "My Journal",
						name: "My Journal",
						percent: 53,
						status: "Meet",
						score: 1.2,
						scoreMax: 2.25,
						icon: "mdi mdi-book-open-variant-outline",
	
					},
					{
						label: "Hobbies",
						name: "Hobbies",
						percent: 100,
						status: "Exceeded",
						score: "1",
						scoreMax: 1,
						icon: "mdi mdi-music",
	
					},
					{
						label: "1:1 Session",
						name: "1:1 Session",
						percent: 90,
						status: "Exceeded",
						score: 1.8,
						scoreMax: 2,
						icon: "mdi mdi-account-voice",
	
					},
					{
						label: "D.E.A.R.",
						name: "D.E.A.R.",
						percent: 90,
						status: "Exceeded",
						score: 1.8,
						scoreMax: 2,
						icon: "mdi mdi-checkbook",
	
					},
					{
						label: "Class Projects",
						name: "Class Projects",
						percent: 55,
						status: "Exceeded",
						score: 1.8,
						scoreMax: 2,
						icon: "mdi mdi-account-group-outline",
	
					}
				],
				defColor: [
					{
						status: "Not Meet",
						des: "<50%",
						color: "red",
						bgcolor: "red-lighten-5"
					},
					{
						status: "Meet",
						des: "50%-79%",
						color: "yellow-darken-3",
						bgcolor: "yellow-lighten-4"
					},
					{
						status: "Exceeded",
						des: ">=80%",
						color: "green",
						bgcolor: "green-lighten-5"
					}
	
	
				]
			}
		},
		mounted() {
			this.activities = this.processColor(this.activities, this.defColor)
			this.skills = this.processColor(this.skills, this.defColor)
		},
		computed: {},
		watch: {},
		methods: {
			processColor(arr, arrColor) {
				return arr.map(element => {
					// Xác định trạng thái dựa trên percent
					let computedStatus;
					if (element.percent < 50 || element.status =='Not Meet') { computedStatus = "Not Meet"; } else if (element.percent <= 80 || element.status =='Meet') { computedStatus = "Meet"; }
					else { computedStatus = "Exceeded"; } // Tìm định nghĩa màu ứng với trạng thái vừa tính const
	
					colorDef = arrColor.find(item => item.status === computedStatus);
	
					// Nếu tìm thấy định nghĩa màu, gán lại thuộc tính cho element
					if (colorDef) {
						return {
							...element,
							color: colorDef.color,
							bgcolor: colorDef.bgcolor
						};
					}
					// Nếu không tìm thấy, trả về element không thay đổi
					return element;
				});
			}
	
		},
	}
</script>