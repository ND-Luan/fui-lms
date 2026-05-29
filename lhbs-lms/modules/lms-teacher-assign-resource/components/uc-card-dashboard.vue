<template>
	<div class="flex-1-1 d-flex flex-column bg-white rounded-lg" :style="borderStyle">
		<v-list class="py-1">
			<v-list-item class="px-3">
				<template #title>
					<span class="font-weight-medium">{{ title }}</span>
				</template>
				<template #prepend>
					<v-icon :color="color" size="32" style="opacity: 1;">{{ icon }}</v-icon>
				</template>
				<v-chip :color="color" style="font-size: 12px !important;" class="text-caption" size="small">
					<slot v-if="!value" name="content" />
					<div v-else>{{ value }}</div>
				</v-chip>
			</v-list-item>
		</v-list>
	</div>
</template>

<script>
export default {
	props: {
		title: String,
		value: [Number, String],
		icon: String,
		color: String,
	},
	computed: {
		borderStyle() {
			return `border-left: 4px solid ${this.color};`
		}
	},
}
</script>