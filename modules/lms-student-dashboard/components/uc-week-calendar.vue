<template>
	<v-card variant="outlined">
		<div class="week-calendar">
			<v-menu v-for="day in weekDays" :key="day.date" location="top" open-on-hover>
				<template v-slot:activator="{ props }">
					<div v-bind="props" class="day-cell"
						:class="{ 'is-today': day.isToday, 'has-tasks': day.taskCount > 0 }">
						<div class="day-name">{{ day.name }}</div>
						<div class="day-number">{{ day.number }}</div>
						<div class="task-dots">
							<span v-for="n in Math.min(day.taskCount, 3)" :key="n" class="task-dot"></span>
						</div>
					</div>
				</template>

				<v-list v-if="day.taskCount > 0" density="compact" class="task-list-popup">
					<v-list-subheader>Nhiệm vụ ngày {{ day.number }}</v-list-subheader>
					<v-list-item v-for="task in day.tasks" :key="task.ResourceID"
						:prepend-icon="task.ResourceType === 'ASSIGNMENT' ? 'mdi-notebook-edit-outline' : 'mdi-presentation-play'">
						<v-list-item-title>{{ task.Title }}</v-list-item-title>
					</v-list-item>
				</v-list>

			</v-menu>
		</div>
	</v-card>
</template>
<script>
	export default {
		name: 'uc-week-calendar',
		props: ['tasks'],
		computed: {
			weekDays() {
				const days = [];
				const today = new Date();
				const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
	
				for (let i = 0; i < 7; i++) {
					const date = new Date();
					date.setDate(today.getDate() + i);
					const dateString = date.toISOString().split('T')[0];
	
					// DÒNG NÀY ĐÃ ĐƯỢC SỬA
					const taskOnDay = this.tasks.find(t => t.DueDate.split('T')[0] === dateString);
	
					let parsedTasks = [];
					if (taskOnDay && taskOnDay.TasksJSON) {
						try {
							parsedTasks = JSON.parse(taskOnDay.TasksJSON);
							console.log("Đã parse thành công JSON cho ngày:", dateString, parsedTasks); // Thêm log để xác nhận
						} catch (e) {
							console.error(`Lỗi parse JSON cho ngày ${dateString}:`, taskOnDay.TasksJSON, e);
						}
					}
	
					days.push({
						date: dateString,
						name: i === 0 ? 'H.nay' : dayNames[date.getDay()],
						number: date.getDate(),
						isToday: i === 0,
						taskCount: taskOnDay ? taskOnDay.TaskCount : 0,
						tasks: parsedTasks
					});
				}
				return days;
			}
		}
	}
</script>