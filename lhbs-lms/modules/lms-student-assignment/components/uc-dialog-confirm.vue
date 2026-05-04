<template>
    <v-dialog v-model="modelValue" max-width="460" @update:model-value="$emit('update:modelValue', $event)">
        <v-card class="confirm-dialog-card">

            <!-- Header -->
            <div class="confirm-dialog__header">
                <v-icon size="26" color="white">mdi-send-check-outline</v-icon>
                <span class="confirm-dialog__title">Xác nhận nộp bài</span>
            </div>

            <!-- Body -->
            <v-card-text class="confirm-dialog__body">

                <!-- Cảnh báo chính -->
                <div class="confirm-dialog__warning">
                    <v-icon size="20" color="warning" class="flex-shrink-0 mt-0_5">mdi-alert-outline</v-icon>
                    <span>
                        Bạn có chắc chắn muốn nộp bài không? Sau khi nộp, bạn sẽ
                        <strong>không thể chỉnh sửa</strong> bài làm của mình.
                    </span>
                </div>

                <!-- Danh sách câu chưa làm -->
                <div v-if="unansweredQuestions" class="confirm-dialog__unanswered mt-3">
                    <v-icon size="15" color="error" class="flex-shrink-0">mdi-alert-circle-outline</v-icon>
                    <span>
                        Còn những câu
                        <span class="text-error font-weight-bold">{{ unansweredQuestions }}</span>
                        chưa làm
                    </span>
                </div>

                <!-- Tổng kết nhanh -->
                <div class="confirm-dialog__summary mt-3">
                    <div class="summary-item">
                        <v-icon size="16" color="primary">mdi-pencil-circle-outline</v-icon>
                        <span>Đã làm: <strong>{{ answeredCount }}</strong> / {{ totalQuestions }} câu</span>
                    </div>
                    <div class="summary-item">
                        <v-icon size="16" color="grey">mdi-help-circle-outline</v-icon>
                        <span>Chưa làm: <strong class="text-error">{{ totalQuestions - answeredCount }}</strong>
                            câu</span>
                    </div>
                </div>
            </v-card-text>

            <!-- Actions -->
            <v-card-actions class="confirm-dialog__actions">
                <v-spacer />
                <v-btn variant="text" color="grey-darken-1" @click="$emit('update:modelValue', false)">
                    <v-icon start size="16">mdi-close</v-icon>
                    Hủy
                </v-btn>
                <v-btn color="success" variant="flat" class="confirm-dialog__submit-btn" @click="$emit('confirm')">
                    <v-icon start size="16">mdi-check-all</v-icon>
                    Xác nhận Nộp
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'ConfirmSubmitDialog',

    props: {
        modelValue: { type: Boolean, default: false },
        unansweredQuestions: { type: String, default: '' }, // vd: "Câu 1, Câu 3"
        answeredCount: { type: Number, default: 0 },
        totalQuestions: { type: Number, default: 0 },
    },

    emits: ['update:modelValue', 'confirm'],
}
</script>

<style scoped>
.confirm-dialog-card {
    border-radius: 16px !important;
    overflow: hidden;
}

/* Header */
.confirm-dialog__header {
    background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.75));
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.confirm-dialog__title {
    color: white;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.01em;
}

/* Body */
.confirm-dialog__body {
    padding: 20px !important;
    display: flex;
    flex-direction: column;
    gap: 0;
}

.confirm-dialog__warning {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 0.9rem;
    line-height: 1.6;
    color: rgba(0, 0, 0, 0.75);
    background: rgba(255, 152, 0, 0.06);
    border: 1px solid rgba(255, 152, 0, 0.22);
    border-radius: 10px;
    padding: 12px 14px;
}

.confirm-dialog__unanswered {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.875rem;
    background: rgba(244, 67, 54, 0.05);
    border: 1px dashed rgba(244, 67, 54, 0.3);
    border-radius: 8px;
    padding: 10px 12px;
    flex-wrap: wrap;
}

.confirm-dialog__summary {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 8px;
    padding: 10px 14px;
}

.summary-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.875rem;
    color: rgba(0, 0, 0, 0.7);
}

/* Actions */
.confirm-dialog__actions {
    padding: 10px 16px 16px !important;
    gap: 8px;
}

.confirm-dialog__submit-btn {
    border-radius: 8px !important;
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 0 18px;
}

.mt-0_5 {
    margin-top: 2px;
}
</style>
