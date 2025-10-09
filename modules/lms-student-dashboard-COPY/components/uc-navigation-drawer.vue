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
					<v-list density="compact" nav>
						<v-list-item v-for="item in menu" :prepend-icon="item.icon" :title="item.title"
							:value="item.activeKey" :key="item.activeKey" active-class="bg-primary text-white"
							:class="item.activeKey === activeKey ? 'bg-primary text-white'  :''"
							@click="$emit('update:activeKey', item.activeKey)" />
					</v-list>
				</v-navigation-drawer>
				<v-navigation-drawer permanent v-if="activeKey === 1" width="160">
					<v-list>
						<v-list-item title="Môn học" />
						<v-divider />
						<div style="height: calc(100dvh - 57px); overflow: auto">
							<v-list-item :title="item.MonHocName" :value="item.MonHocID"
								:class="item.MonHocID === activeMonHocID ? 'bg-primary text-white' :  ''"
								v-for=" item in subjectProgress"
								@click="$emit('update:activeMonHocID', item.MonHocID)" />
						</div>
					</v-list>
				</v-navigation-drawer>

				<v-main>
					<v-toolbar title="Tổng quan học tập" height="64"></v-toolbar>
					<div class="pa-4" style="height: calc(100dvh - 64px); overflow: auto">
						<slot />
					</div>
				</v-main>
			</div>
			<div v-else style="width: 100%">
				<v-toolbar title="Tổng quan học tập" height="64"></v-toolbar>
				<v-main>
					<div class="pa-4" style="height: calc(100dvh - 64px); overflow: auto">
						<slot />
					</div>
				</v-main>
				<v-bottom-navigation :model-value="activeKey" @update:modelValue="updateActiveKey" color="primary"
					active>
					<v-btn v-for="item in menu" :value="item.activeKey">
						<v-icon>{{item.icon}}</v-icon>
						{{item.title}}
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
				menu: [
					{
						icon: "",
						title: "Hoạt động gần đây",
						activeKey: 0
					},
					{
						icon: "",
						title: "Tiến độ môn học",
						activeKey: 1
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