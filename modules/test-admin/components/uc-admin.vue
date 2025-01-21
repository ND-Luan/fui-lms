<template>
	<v-app>
		<v-layout>
			<v-navigation-drawer v-model="drawer" :rail="rail" permanent>
				<v-list>
					<v-list-item prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg"
						subtitle="sandra_a88@gmailcom" title="Sandra Adams"></v-list-item>
				</v-list>
				<v-divider></v-divider>
				<div class="">
					<v-list density="compact" nav style="max-height: calc(100vh - 200px)">
						<div v-for="item in ListMenu">
							<v-list-subheader v-if="item.subHeader">{{item.subHeader}}</v-list-subheader>
							<v-list-item v-else :title="item.title" :prepend-icon="item.icon"></v-list-item>
							<div v-if="item.children">
								<v-list-group value="Users">
									<template v-slot:activator="{ props }">
										<v-list-item v-bind="props" :prepend-icon="item.icon"
											:title="item.title"></v-list-item>
									</template>
									<v-list-item v-for="(itemChildren, i) in item.children" :key="i"
										:prepend-icon="itemChildren.icon" :title="itemChildren.title">
									</v-list-item>
								</v-list-group>
							</div>
						</div>
					</v-list>
					<v-spacer></v-spacer>
				</div>
			</v-navigation-drawer>
			<v-navigation-drawer permanent v-if="rail === true">
				<v-list>
					<v-list-item title="Home" value="home"></v-list-item>

					<v-list-item title="Contacts" value="contacts"></v-list-item>

					<v-list-item title="Settings" value="settings"></v-list-item>
				</v-list>
			</v-navigation-drawer>
			<v-main style="height: 100vh">
				<v-toolbar>
					<v-btn icon="mdi-arrow-left" @click.stop="rail = !rail"></v-btn>
					<v-toolbar-title>Dashboard</v-toolbar-title>
					<v-spacer></v-spacer>
					<v-btn icon>
						<v-icon>mdi-export</v-icon>
					</v-btn>
				</v-toolbar>
			</v-main>
		</v-layout>
	</v-app>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				drawer: true,
				rail: false,
				keyMenuSelected: null,
				ListMenu: [
					{
						subHeader: "Menu 1"
					},
					{
						key: 1,
						title: "Folder 1",
						icon: "mdi-folder",
						children: [
							{
								title: "File 1",
								icon: "mdi-file"
							},
							{
								title: "File 2",
								icon: "mdi-file"
							},
							{
								title: "File 3",
								icon: "mdi-file"
							},
							{
								title: "File 4",
								icon: "mdi-file"
							}
						]
					},
					{
						key: 2,
						title: "Folder 2",
						icon: "mdi-folder"
					},
					{
						key: 3,
						title: "Folder 3",
						icon: "mdi-folder"
					},
					{
						subHeader: "Menu 2"
					},
					{
						key: 4,
						title: "Folder 4",
						icon: "mdi-folder"
					},
					{
						key: 5,
						title: "Folder 5",
						icon: "mdi-folder"
					},
					{
						key: 6,
						title: "Folder 6",
						icon: "mdi-folder"
					}
				]
			}
		},
		mounted() { },
		computed: {},
		watch: {},
		methods: {},
	}
</script>