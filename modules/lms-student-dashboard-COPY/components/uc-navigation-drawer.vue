<template>
	<div>
		<v-layout>
			<div v-if="!isMobile" style="width: 100%">
				<v-navigation-drawer permanent width="220">
					<v-list>
						<v-list-item :prepend-avatar="avatarStudent"
							:subtitle="studentInfoDetail?.HocSinhID + ' - ' + studentInfoDetail?.TenLop"
							:title="studentInfoDetail?.HoTen" />
					</v-list>
					<v-divider />
					<v-list :density="vueData.density" nav>
						<v-list-item v-for="item in menu" :prepend-icon="item.icon" :title="item.title"
							:value="item.activeKey" :key="item.activeKey" active-class="bg-primary text-white"
							:class="item.activeKey === activeKey ? 'bg-primary text-white' : ''"
							@click="$emit('update:activeKey', item.activeKey)" />
					</v-list>
				</v-navigation-drawer>
				<!-- <v-navigation-drawer permanent v-if="activeKey === 2" width="160">
					<v-list>
						<v-list-item title="Môn học" style="height: 64px" />
						<v-divider />
						<div style="height: calc(100dvh - 57px); overflow: auto">
							<v-list-item :title="item.MonHocName" :value="item.MonHocID"
								:class="item.MonHocID === activeMonHocID ? 'bg-primary text-white' :  ''"
								v-for=" item in subjectProgress"
								@click="$emit('update:activeMonHocID', item.MonHocID)" />
						</div>
					</v-list>
				</v-navigation-drawer> -->

				<v-main style="background-color: #fbfbfb;">
					<v-toolbar class="" v-if="activeKey !== 4" title="Tổng quan học tập"
						:density="vueData.density"></v-toolbar>
					<div style="height: calc(100dvh - 48px); overflow: auto">
						<slot />
					</div>
				</v-main>
			</div>
			<div v-else style="width: 100%">
				<v-toolbar v-if="activeKey !== 4" title="Tổng quan học tập" color="success"
					:density="vueData.density"></v-toolbar>
				<v-main>
					<div style="height: calc(100dvh - 104px); overflow: auto">
						<slot />
					</div>
				</v-main>
				<v-bottom-navigation :model-value="activeKey" @update:modelValue="updateActiveKey" color="success"
					active grow>
					<v-btn v-for="item in menu" :value="item.activeKey">
						<v-icon size="24">{{ item.icon }}</v-icon>
						{{ item.title }}
					</v-btn>
				</v-bottom-navigation>
			</div>
		</v-layout>
	</div>
</template>

<script>
export default {
	props: {
		activeKey: Number,
		activeMonHocID: Number,
		avatarStudent: String,
		studentInfoDetail: Object,
		subjectProgress: Array
	},
	data() {
		return {
			vueData,
			menu: [
				{
					icon: "mdi-format-list-checkbox",
					title: "Nhiệm vụ",
					activeKey: 0
				},
				{
					icon: "mdi-history",
					title: "Hoạt động",
					activeKey: 1
				},
				{
					icon: "mdi-chart-line",
					title: "Tiến độ",
					activeKey: 2
				},
				{
					icon: "mdi-account-circle",
					title: "Cá nhân",
					activeKey: 3
				},
				// {
				// 	icon: "",
				// 	title: "",
				// 	activeKey: 2
				// },
			],
			isMobile: false,
			vueData
		}
	},
	mounted() {
		this.isMobile = this.$vuetify.display.mobile
	},
	computed: {},
	watch: {
		"$vuetify.display.mobile": function (isMobile) {
			this.isMobile = isMobile
		}
	},
	methods: {
		updateActiveKey(activeKey) {
			this.$emit('update:activeKey', activeKey)
		}
	},
}
</script>