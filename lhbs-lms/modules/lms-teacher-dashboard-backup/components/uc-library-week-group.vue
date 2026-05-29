<template>
	<v-list class="week-group">
		<v-list-subheader class="week-header pl-2">
			Tuần {{ weekGroup.weekNumber || '[Chưa xếp tuần]' }}
		</v-list-subheader>
		<div v-for="chapterGroup in weekGroup.chapters" :key="chapterGroup.chapterName">
			<uc-content-library-item v-for="item in chapterGroup.items" :key="item.ResourceType + item.ResourceID"
				:item="item" />
		</div>
	</v-list>
</template>

<script>
	export default {
		name: 'uc-library-week-group',
		props: { weekGroup: Object }
	}
</script>