<template>
	<div>
		<v-card>
			<v-card-title class="text-subtitle-1" style="text-wrap: inherit;">
				Pathways test results: (Kết quả đánh giá Tiếng Anh Cambridge theo lộ trình - Giữa HKII)
			</v-card-title>
			<v-table height="250px" fixed-header>
				<thead>
					<tr>
						<th class="text-left">Name</th>
						<th class="text-left">Listening/Nghe</th>
						<th class="text-left">Reading/Đọc</th>
						<th class="text-left">Writing/Viết</th>
						<th class="text-left">Speaking/Nói</th>
						<th class="text-left">Average/Điểm trung bình</th>
					</tr>
				</thead>
				<tbody>
					<!-- v-if="!(item?.name === 'IELTS Equivalent/ Quy đổi điểm IELTS tham khảo' && level == 3)" -->
					<tr v-for="item in pathwaysTestResults" :key="item?.name">
						<td>{{ item?.name }}</td>
						<td>{{ item?.Listening }}</td>
						<td>{{ item?.Reading }}</td>
						<td>{{ item?.Writing }}</td>
						<td>{{ item?.Speaking }}</td>
						<td>{{ item?.Avarage }}</td>
					</tr>
				</tbody>
			</v-table>
		</v-card>

		<v-card>
			<v-card-title class="text-subtitle-1" style="text-wrap: inherit;">
				Activities assessment <br />(Kết quả các hoạt động rèn luyện)</v-card-title>
			<v-table height="300px" fixed-header>
				<thead>
					<tr>
						<th class="text-left">Activities/Hoạt động</th>
						<th class="text-left">EC/Học với video trên hệ thống English Central</th>
						<th class="text-left">My Journal/Viết Nhật ký bằng tiếng Anh</th>
						<th class="text-left">Hobbies and Talents/Trình bày sở thích và tài năng</th>
						<th class="text-left">1:1 session/Tham vấn cá nhân cùng Giáo viên</th>
						<th class="text-left">D.E.A.R. /Đọc sách</th>
						<th class="text-left">Periods without walls /Dự án tại lớp</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in ActivitiesAssessmentResults" :key="item.Activities">
						<td>{{ item.Activities }}</td>
						<td>{{ item.EC }}</td>
						<td>{{ item.MyJournal }}</td>
						<td>{{ item.HobbiesAndTalents }}</td>
						<td>{{ item.oneoroneSession }}</td>
						<td>{{ item.DEAR }}</td>
						<td>{{ item.PeriodsWithoutWalls }}</td>
					</tr>
				</tbody>
			</v-table>
		</v-card>
	</div>
</template>

<script>
	export default {
		props: {
			level: {
				type: Number,
				required: true
			},
			items: {
				type: Object,
				required: true
			},
			nhomDiem: {
				type: Object
			}
		},
		data() {
			const arr = [{
				name: 'Results/ Kết quả',
				Listening: 3.5,
				Reading: 6.25,
				Writing: 7.5,
				Speaking: 9.38,
				Avarage: 6.66
			}
			]
			if (this.level === 3) arr.push({
				name: 'IELTS Equivalent/ Quy đổi điểm IELTS tham khảo',
				Listening: 4.5,
				Reading: 6,
				Writing: 5.5,
				Speaking: 5.5,
				Avarage: 5.5
			})
			arr.push({
				name: 'Pathway Progress/Tiến độ theo lộ trình',
				Listening: "Not Meeting Requirements/ Chưa đạt",
				Reading: "Exceeding Requirements/ Vượt yêu cầu",
				Writing: "Meeting Requirements/Đạt yêu cầu",
				Speaking: "Meeting Requirements/ Đạt yêu cầu",
				Avarage: "Meeting Requirements/ Đạt yêu cầu"
			})
	
			let textTheme_first = ''
			let textTheme_second = ''
			if (this.nhomDiem.value === 'GK1') { textTheme_first = 1; textTheme_second = 2 }
			if (this.nhomDiem.value === 'CK1') { textTheme_first = 3; textTheme_second = 4 }
	
			if (this.nhomDiem.value === 'GK2') { textTheme_first = 5; textTheme_second = 6 }
			if (this.nhomDiem.value === 'CK2') { textTheme_first = 7; textTheme_second = 8 }
	
	
			const Theme_First = `Theme ${textTheme_first}`
			const Theme_Second = `Theme ${textTheme_second}`
	
			return {
				pathwaysTestResults: arr,
				ActivitiesAssessmentResults: [
					{
						"Activities": Theme_First,
						"EC": 7,
						"MyJournal": 8,
						"HobbiesAndTalents": 10,
						"oneoroneSession": 8,
						"DEAR": 8,
						"PeriodsWithoutWalls": 10
					},
					{
						"Activities": Theme_Second,
						"EC": 4.7,
						"MyJournal": 8,
						"HobbiesAndTalents": 8,
						"oneoroneSession": 10,
						"DEAR": 10,
						"PeriodsWithoutWalls": 9
					}
				]
			};
		}
	}
</script>