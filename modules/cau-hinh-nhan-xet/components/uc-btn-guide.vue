<template>
	<v-dialog max-width="800">
		<template v-slot:activator="{ props: activatorProps }">
			<p class="text-primary text-subtitle-1 font-weight-medium">
				Lưu ý: Khi nhập nhận xét <v-chip v-bind="activatorProps">Hướng dẫn</v-chip>
			</p>
		</template>

		<template v-slot:default="{ isActive }">
			<v-card>
				<v-card-title class="d-flex align-center">
					Hướng dẫn
					<v-spacer></v-spacer>
					<v-icon @click="isActive.value = false">mdi-close</v-icon>
				</v-card-title>
				<v-card-text>
					<v-row>
						<!-- <v-col>
							<p>Student's name: {StudentName}</p>
							<p>She/He: {Gender}</p>
							<p>Herself/Himself: {ReflexivePronouns}</p>
							<p>Her/his: {PossessivePronouns}</p>
							<p>Her/him: {ObjectPronouns}</p>
						</v-col> -->
						<v-divider vertical></v-divider>
						<v-col>
							Tên học sinh: {StudentName}
						</v-col>
						<v-col cols="12">
							<!-- <v-card>
								<v-card-text>
									<p class="text-subtitle-1 font-weight-medium">Ví dụ English</p>
									<p>English: <b>He/She</b> is learning to speak confidently during presentations and
										is
										improving
										<b>his/her</b> ability to express ideas clearly.
									</p>
									<v-divider class="mx-2 my-2" inset></v-divider>
									<p>Khi convert sang:</p>
									<p><b>{Gender}</b> is learning to speak confidently during presentations and
										is improving <b>{PossessivePronouns}</b> ability to express ideas clearly.</p>
								</v-card-text>
							</v-card> -->
							<v-card class="mt-2">
								<v-card-text class="pa-0">
									<p class="text-subtitle-1 font-weight-medium">Ví dụ</p>
									<p>Giáo viên đang hỗ trợ bé <b>(tên bé)</b> cải thiện kỹ năng thuyết trình.
									</p>
									<v-divider class="mx-2 my-2" inset></v-divider>
									<p>Khi convert sang:</p>
									<p>Giáo viên đang hỗ trợ bé <b>{StudentName}</b> cải thiện kỹ năng thuyết trình.</p>
								</v-card-text>
							</v-card>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>
	</v-dialog>
</template>
<script>
export default {
	props: {},
	data() { return {} }
}
</script>