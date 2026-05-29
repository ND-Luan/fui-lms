<template>
	<div>
		<!-- Nếu loading thì render count skeleton -->
		<div v-if="loading">
			<v-skeleton-loader v-for="n in count" :key="n" type="list-item-two-line" class="mb-2" />
		</div>

		<!-- Khi load xong thì hiển thị nội dung -->
		<div v-else>
			<slot />
		</div>
	</div>
</template>

<script>
	export default {
		props: {
			loading: {
				type: Boolean,
				default: false
			},
			count: {
				type: Number,
				default: 5   // mặc định 5 phần tử
			}
		}
	}
</script>