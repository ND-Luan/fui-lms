<template>
	<div v-if="uploadTasks.length > 0" class="global-upload-manager">
        <div class="global-upload-manager__header">
            <div class="d-flex align-center ga-2">
                <v-icon color="primary">mdi-cloud-upload-outline</v-icon>
                <span class="text-subtitle-2 font-weight-bold">Tiến trình upload</span>
                <v-chip size="x-small" color="primary" variant="tonal">{{ uploadTasks.length }}</v-chip>
            </div>
            <v-btn icon="mdi-close" size="x-small" variant="text" @click="clearDoneUploadTasks" />
        </div>

        <div class="global-upload-manager__list">
            <div v-for="task in uploadTasks" :key="task.id" class="global-upload-manager__item">
                <div class="d-flex align-center justify-space-between ga-2">
                    <span class="text-caption text-truncate">{{ task.fileName }}</span>
                    <v-btn
                        v-if="isActiveUploadTask(task)"
                        icon="mdi-close"
                        size="x-small"
                        variant="text"
                        color="error"
                        @click="cancelUploadTask(task.id)"
                    />
                    <v-btn
                        v-else
                        icon="mdi-delete-outline"
                        size="x-small"
                        variant="text"
                        @click="removeUploadTask(task.id)"
                    />
                </div>

                <v-progress-linear
                    :model-value="task.progress"
                    :color="getUploadTaskColor(task.status)"
                    height="6"
                    rounded
                />

                <div class="d-flex align-center justify-space-between mt-1">
                    <span class="text-caption text-medium-emphasis">{{ getUploadTaskText(task) }}</span>
                    <span class="text-caption">{{ task.progress }}%</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
	export default {
		name: 'GlobalUploadManager',

    data() {
        return {
            autoClearTimer: null,
        };
    },

    computed: {
        uploadTasks() {
            return window.UploadManager ? window.UploadManager.tasks : [];
        },
    },

    watch: {
        uploadTasks: {
            deep: true,
            handler() {
                this.scheduleAutoClearDoneUploadTasks();
            },
        },
    },

    mounted() {
        this.scheduleAutoClearDoneUploadTasks();
    },

    beforeUnmount() {
        this.clearAutoClearTimer();
    },

    beforeDestroy() {
        this.clearAutoClearTimer();
    },

    methods: {
        getUploadTaskColor(status) {
            if (status === 'success') return 'success';
            if (status === 'error') return 'error';
            if (status === 'cancelled') return 'grey';
            return 'primary';
        },

        getUploadTaskText(task) {
            if (task.statusText) return task.statusText;
            if (task.status === 'success') return 'Hoàn tất';
            if (task.status === 'error') return task.errorMessage || 'Upload lỗi';
            if (task.status === 'cancelled') return 'Đã hủy';
            return 'Đang upload';
        },

        isActiveUploadTask(task) {
            return ['uploading', 'pending', 'processing'].includes(task.status);
        },

        cancelUploadTask(taskId) {
            window.UploadManager?.cancelTask(taskId);
        },

        removeUploadTask(taskId) {
            window.UploadManager?.removeTask(taskId);
        },

        clearDoneUploadTasks() {
            if (!window.UploadManager) return;

            const removableIds = this.uploadTasks
                .filter(task => !this.isActiveUploadTask(task))
                .map(task => task.id);

            removableIds.forEach(id => window.UploadManager.removeTask(id));
            this.clearAutoClearTimer();
        },

        clearAutoClearTimer() {
            if (!this.autoClearTimer) return;
            clearTimeout(this.autoClearTimer);
            this.autoClearTimer = null;
        },

        scheduleAutoClearDoneUploadTasks() {
            const hasTasks = this.uploadTasks.length > 0;
            const hasActiveTask = this.uploadTasks.some(task => this.isActiveUploadTask(task));

            if (!hasTasks || hasActiveTask) {
                this.clearAutoClearTimer();
                return;
            }

            if (this.autoClearTimer) return;

            this.autoClearTimer = setTimeout(() => {
                this.clearDoneUploadTasks();
            }, 3000);
        },
    },
	}
</script>