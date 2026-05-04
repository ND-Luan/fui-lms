<template>
	<div class="border-md rounded-circle border-primary" style="padding: 2px">
		<v-avatar size="56">
			<v-img :src="urlAvatar" contain />
		</v-avatar>
	</div>
</template>

<script>
	export default {
		props: {
			user: Object
		},
		data() {
			return {
				vueData
			}
		},
		mounted() { },
		computed: {
			urlAvatar: function () {
				let stringUrl = ''
				if (!this.user) return stringUrl
				if (this.user?.UserID) stringUrl = vueData.v_Set.urlAvatarPhuHuynh + this.user.UserID
				else stringUrl = vueData.v_Set.urlAvatarHocSinh + (this.user?.HocSinhID || this.user.StudentID)
				console.log("stringUrl", stringUrl)
				return stringUrl
			}
		},
		watch: {},
		methods: {},
	}
</script>