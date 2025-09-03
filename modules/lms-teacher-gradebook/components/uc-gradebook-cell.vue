<template>
	<div class="grade-cell">
		<div v-if="!isEditing" @click="startEditing" class="display-mode" :class="{ 'editable': canEdit }">
			<div v-if="statusInfo.status === 'GRADED'">
				<span class="font-weight-bold" :class="scoreColor">{{ statusInfo.score.toFixed(2) }}</span>
			</div>
			<div v-else-if="statusInfo.status === 'PENDING'">
				<v-btn size="x-small" variant="tonal" color="warning"
					@click.stop="$emit('grade', statusInfo.submissionId)">
					Chấm bài
				</v-btn>
			</div>
			<div v-else class="text-medium-emphasis">
				—
			</div>
		</div>
		<div v-else>
			<v-text-field v-model.number="editedScore" type="number" density="compact" variant="outlined" hide-details
				autofocus @blur="saveEdit" @keydown.enter="saveEdit" @keydown.esc="cancelEdit"></v-text-field>
		</div>
	</div>
</template>

<script>
	export default {
    name: 'uc-gradebook-cell',
    props: ['cellData'],
    emits: ['grade', 'update-score'],
    data() {
        return {
            isEditing: false,
            editedScore: 0
        };
    },
    computed: {
        statusInfo() {
            if (!this.cellData) return { status: 'NOT_SUBMITTED' };
            try { return JSON.parse(this.cellData); } 
            catch (e) { return { status: 'ERROR' }; }
        },
        canEdit() {
            return this.statusInfo.status === 'GRADED';
        },
        scoreColor() {
            const score = this.statusInfo.score;
            if (score < 5.0) return 'text-error';
            if (score < 7.0) return 'text-orange';
            return 'text-success';
        }
    },
    methods: {
        startEditing() {
            if (this.canEdit) {
                this.editedScore = this.statusInfo.score;
                this.isEditing = true;
            }
        },
        cancelEdit() {
            this.isEditing = false;
        },
        saveEdit() {
            if (!this.isEditing) return;
            this.isEditing = false;
            // Chỉ emit nếu điểm thực sự thay đổi
            if (this.editedScore !== this.statusInfo.score) {
                this.$emit('update-score', { 
                    submissionId: this.statusInfo.submissionId, 
                    newScore: this.editedScore 
                });
            }
        }
    }
}
</script> 