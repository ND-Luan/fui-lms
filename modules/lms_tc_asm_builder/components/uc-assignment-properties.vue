<template>
	<v-card sticky top="80px">
		<div class="d-flex align-center text-subtitle-1 font-weight-medium flex-wrap ga-2">
			{{ $t('message.Attribute') }}
			<div class="ml-2" v-if="item.type === 'question' && globalQuestionNumber !== 0">
				<v-chip v-if="isQuestionTextField === false" label color="primary"
					@click="isQuestionTextField = true; $nextTick(() => { $refs.questionInput.focus() });">
					{{ $t('message.Question') }} {{ selectedQuestionData.ordinalNumber }} <v-icon
						end>mdi-pencil-circle</v-icon>
				</v-chip>
				<v-text-field v-else ref="questionInput" v-model="selectedQuestionData.ordinalNumber"
					hide-details="auto" @blur="isQuestionTextField = false" />
			</div>
			<v-chip v-else-if="item.type === 'group'" class="ml-2" label color="primary">
				{{ selectedGroupData.title }}
			</v-chip>
			<v-spacer></v-spacer>
			<div class="d-flex">
				<v-spacer></v-spacer>
				<v-btn v-if="item.type === 'group'" variant="tonal" color="primary"
					@click="onOpenModalImportFromHocLieu()">Import từ kho
					học liệu</v-btn>
				<v-btn v-else icon variant="text" @click="onOpenModalKiNang()"><v-icon>mdi-cog-outline</v-icon></v-btn>
			</div>
		</div>
		<v-divider class="my-2" />
		<div v-if="!item" class="text-center pa-10 text-grey">
			<v-icon size="48" class="mb-2">mdi-cursor-default-click-outline</v-icon>
			<div>{{ $t('message.SelectSectionOrQuestionToEdit') }}</div>
		</div>

		<div v-else>
			<div v-if="item.type === 'group'" class="d-flex flex-column ga-2">
				<v-text-field class="mt-2" :model-value="selectedGroupData.title"
					@update:model-value="updateItem('title', $event)" :label="$t('message.SectionGroupName')"
					variant="outlined" density="compact" />
				<div class="d-flex align-center ga-2 w-100">
					<v-checkbox :model-value="selectedGroupData.advancedFeatures.isShuffleQuestions"
						@update:model-value="(value) => { updateShuffleQuestions(selectedGroupData.id, value) }"
						:label="$t('message.ShuffleQuestions')"></v-checkbox>
					<v-checkbox :model-value="selectedGroupData.advancedFeatures.isShuffleAnswers"
						@update:model-value="(value) => { updateShuffleAnswers(selectedGroupData.id, value) }"
						:label="$t('message.ShuffleAnswers')"></v-checkbox>
				</div>

				<v-divider />
				<!-- Thêm các YT, IMG, RECOURD_AUDIO source -->
				<uc-media :key="item.groupIndex" :selectedData="selectedGroupData" :item="item"
					v-model:loadingPage="loadingPage" @update:selectedData="handleGroupMediaUpdate" />
				<!-- END -->
				<v-divider />
				<v-textarea :model-value="selectedGroupData.description"
					@update:model-value="updateItem('description', $event)" :label="$t('message.SectionDescription')"
					variant="outlined" density="compact" rows="3" />
				<v-checkbox v-model="selectedGroupData.isCheckShowAllQuestion"
					:label="$t('message.ShowAllQuestionsInGroup')" />
			</div>

			<div v-else-if="item.type === 'question' && selectedQuestionData">
				<v-row dense>
					<v-col cols="12">
						<div class="d-flex flex-wrap ga-2">
							<b>Cấu hình kĩ năng: </b>
							<v-chip v-for="(skill, index) in groups[item.groupIndex]?.questions[item.qIndex].skills"
								color="primary" size="small" closable @click:close="removeChip(index)"
								:key="skill.KyNang_MonHoc_ChiTietID">
								{{ getSkillLabel(skill) }}
							</v-chip>
						</div>
					</v-col>
					<v-col cols="6">
						<v-text-field :model-value="selectedQuestionData.points"
							@update:model-value="updateQuestion('points', parseFloat($event) || 0)"
							:label="$t('message.Score')" type="number" min="0" step="0.25" variant="outlined"
							density="compact" :clearable="false" />
					</v-col>
					<v-col cols="6">
						<v-select :model-value="selectedQuestionData.gradingType || 'auto'"
							@update:model-value="updateQuestion('gradingType', $event)"
							:label="$t('message.GradingMethod')"
							:items="[{ value: 'auto', title: IsEngLish == 'en' ? 'auto' : 'Tự động' }, { value: 'manual', title: IsEngLish == 'en' ? 'manual' : 'Chấm tay' }]"
							variant="outlined" density="compact" :disabled="!isAutoGradable(selectedQuestionData.type)"
							:clearable="false" />
					</v-col>
				</v-row>
				<v-divider class="my-2" />
				<uc-media :selectedData="selectedQuestionData.config" :item="item" v-model:loadingPage="loadingPage"
					@update:selectedData="handleQuestionMediaUpdate" />
				<v-divider class="my-2" />
				<p class="mb-2 text-subtitle-1 font-weight-medium">{{ $t('message.QuestionContent') }}:</p>
				<div :key="selectedQuestionData.id">
					<f-editor :model-value="selectedQuestionData.config.questionText"
						:placeholder="$t('message.EnterQuestion')"
						@update:model-value="updateQuestionConfig('questionText', $event)"
						:imageapi="vueData.v_Set.apiImageAdapter" />
				</div>
				<v-divider class="my-2" />
				<!-- END -->
				<div class="d-flex justify-space-between align-center"
					v-if="!['QUIZ_TRUE_FALSE', 'ESSAY', 'AUDIO_RESPONSE', 'FILE_UPLOAD', 'SHORT_ANSWER'].includes(selectedQuestionData.type)">
					<p class="font-weight-medium">{{ $t('message.Answer') }}:</p>
					<v-checkbox v-model="selectedQuestionData.config.isAdvanced" :label="$t('message.Advanced')" />
				</div>
				<!-- QUIZ_SINGLE_CHOICE -->
				<div v-if="selectedQuestionData.type === 'QUIZ_SINGLE_CHOICE'">
					<v-row dense v-for="(option, index) in selectedQuestionData.config.options" :key="option.id">
						<v-col cols="2" class="d-flex justify-center align-center">
							<v-radio-group :model-value="selectedQuestionData.config.correctAnswer"
								@update:model-value="updateQuestionConfig('correctAnswer', $event)"
								class="flex-shrink-0">
								<v-radio :value="option.id" hide-details />
							</v-radio-group>
						</v-col>
						<v-col cols="8" class="d-flex justify-center align-center">
							<v-text-field v-if="!selectedQuestionData.config.isAdvanced" :model-value="option.text"
								@update:model-value="updateOptionText(index, $event)" dense variant="outlined"
								hide-details :clearable="false" />
							<uc-latex-edit class="w-100" v-else v-model:content="option.text" />
						</v-col>
						<v-col cols="2" class="d-flex justify-center align-center">
							<v-btn size="x-small" @click="removeOption(index)" class="ml-1" icon="mdi-close" />
						</v-col>
					</v-row>
					<v-btn block small @click="addOption" variant="tonal" class="mt-2">
						<v-icon start>mdi-plus</v-icon>{{ $t('message.MoreAnswer') }}
					</v-btn>
				</div>
				<!-- QUIZ_MULTIPLE_CHOICE -->
				<div v-else-if="selectedQuestionData.type === 'QUIZ_MULTIPLE_CHOICE'">
					<v-row dense v-for="(option, index) in selectedQuestionData.config.options" :key="option.id">
						<v-col cols="2" class="d-flex justify-center align-center">
							<v-checkbox :model-value="selectedQuestionData.config.correctAnswers" :value="option.id"
								@update:model-value="updateQuestionConfig('correctAnswers', $event)" hide-details
								class="flex-shrink-0">
							</v-checkbox>
						</v-col>
						<v-col cols="8" class="d-flex justify-center align-center">
							<v-text-field v-if="!selectedQuestionData.config.isAdvanced" :model-value="option.text"
								@update:model-value="updateOptionText(index, $event)" dense variant="outlined"
								hide-details :clearable="false" />
							<uc-latex-edit v-else v-model:content="option.text" />
						</v-col>
						<v-col cols="2" class="d-flex justify-center align-center">
							<v-btn icon size="small" @click="removeOption(index)" class="ml-1">
								<v-icon>mdi-close</v-icon>
							</v-btn>
						</v-col>
					</v-row>
					<v-btn small @click="addOption" variant="tonal" class="mt-2">
						<v-icon left>mdi-plus</v-icon>{{ $t('message.MoreAnswer') }}
					</v-btn>
				</div>
				<!-- QUIZ_TRUE_FALSE -->
				<div v-else-if="selectedQuestionData.type === 'QUIZ_TRUE_FALSE'">
					<v-radio-group :model-value="selectedQuestionData.config.correctAnswer"
						@update:model-value="updateQuestionConfig('correctAnswer', $event)">
						<v-radio :value="true" :label="$t('message.Correct')" />
						<v-radio :value="false" :label="$t('message.Incorrect')" />
					</v-radio-group>
				</div>
				<!-- QUIZ_MULTIPLE_TRUE_FALSE -->
				<div v-else-if="selectedQuestionData.type === 'QUIZ_MULTIPLE_TRUE_FALSE'">
					<v-row v-for="(option, index) in selectedQuestionData.config.options" :key="index" dense>
						<v-col class="d-flex justify-space-evenly" cols="2">
							<v-checkbox v-model="option.correctAnswer" color="primary"
								@update:modelValue="(val) => { if (val) option.inCorrectAnswer = false }" />
							<v-checkbox v-model="option.inCorrectAnswer" color="red"
								@update:modelValue="(val) => { if (val) option.correctAnswer = false }" />
						</v-col>
						<v-col cols="8">
							<v-text-field v-if="!selectedQuestionData.config.isAdvanced" v-model="option.text"
								density="compact" variant="outlined" hide-details :clearable="false" />
							<uc-latex-edit v-else v-model:content="option.text" :isEditable="true" />
						</v-col>
						<v-col cols="2">
							<v-btn v-if="selectedQuestionData.config.options.length > 2" icon="mdi-delete-outline"
								variant="text" size="small" color="red" @click="removeOption(index)" />
						</v-col>
					</v-row>
					<v-btn prepend-icon="mdi-plus" variant="text" color="primary" @click="addOption('options')">
						{{ $t('message.MoreAnswer') }}
					</v-btn>
				</div>

				<!-- QUIZ_FILL_IN_BLANK -->
				<div v-else-if="selectedQuestionData.type === 'QUIZ_FILL_IN_BLANK'">
					<p class="text-caption">{{ $t('message.Structure') }}</p>
					<div v-for="(part, index) in selectedQuestionData.config.parts" :key="index"
						class="d-flex flex-wrap align-center mb-2">
						<v-text-field v-if="part.type === 'text'" :model-value="part.value"
							@update:model-value="updatePart(index, 'value', $event)" :label="$t('message.TextContent')"
							variant="outlined" density="compact" hide-details :clearable="false" />

						<v-text-field v-if="part.type === 'blank'" :model-value="part.acceptedAnswers[0]"
							@update:model-value="updatePart(index, 'acceptedAnswers', [$event])"
							:label="$t('message.CorrectAnswer')" variant="outlined" density="compact" hide-details
							class="ml-2" :clearable="false" />
						<v-btn icon size="small" @click="removePart(index)" class="ml-1">
							<v-icon>mdi-close</v-icon>
						</v-btn>
					</div>
					<v-btn small @click="addPart('text')" variant="tonal" class="mr-2 mt-2">{{ $t('message.AddText')
					}}</v-btn>
					<v-btn small @click="addPart('blank')" variant="tonal" class="mt-2">{{ $t('message.AddBlank')
					}}</v-btn>
				</div>
				<!-- QUIZ_MATCHING -->
				<div v-else-if="selectedQuestionData.type === 'QUIZ_MATCHING'">
					<v-row>
						<v-col><label class="form-label">{{ $t('message.Column') }} A</label></v-col>
						<v-col><label class="form-label">{{ $t('message.Column') }} B
								({{ $t('message.Similar') }})</label></v-col>
					</v-row>
					<v-row v-for="(pair, index) in selectedQuestionData.config.columnA" :key="index" class="mb-n5">
						<v-col cols="5">
							<v-text-field v-if="!selectedQuestionData.config.isAdvanced" v-model="pair.text"
								density="compact" variant="outlined" hide-details :clearable="false" />
							<uc-latex-edit v-else v-model:content="pair.text" style="width: 50%" />
						</v-col>
						<v-col cols="5" class="d-flex align-center">
							<v-text-field v-if="!selectedQuestionData.config.isAdvanced"
								v-model="selectedQuestionData.config.columnB[index].text" density="compact"
								variant="outlined" hide-details style="width: 40%" :clearable="false" />
							<uc-latex-edit v-else v-model:content="selectedQuestionData.config.columnB[index].text" />

						</v-col>
						<v-col cols="2">
							<v-btn icon="mdi-delete-outline" variant="text" size="small" color="red"
								@click="removePair(index)" />
						</v-col>
					</v-row>
					<v-btn prepend-icon="mdi-plus" variant="tonal" color="primary" @click="addPair" class="mt-4 mb-4">
						{{ $t('message.AddPair') }}
					</v-btn>
				</div>
				<!-- QUIZ_MATCHING_V2 -->
				<div v-else-if="selectedQuestionData.type === 'QUIZ_MATCHING_V2'">
					<v-row>
						<v-col><label class="form-label">{{ $t('message.Column') }} A</label></v-col>
						<v-col><label class="form-label">{{ $t('message.Column') }} B
								({{ $t('message.Similar') }})</label></v-col>
					</v-row>
					<v-row v-for="(pair, index) in selectedQuestionData.config.columnA" :key="index" class="mb-n5">
						<v-col cols="5">
							<v-text-field v-if="!selectedQuestionData.config.isAdvanced" v-model="pair.text"
								density="compact" variant="outlined" hide-details :clearable="false" />
							<uc-latex-edit v-else v-model:content="pair.text" style="width: 50%" />
						</v-col>
						<v-col cols="5" class="d-flex align-center">
							<v-text-field v-if="!selectedQuestionData.config.isAdvanced"
								v-model="selectedQuestionData.config.columnB[index].text" density="compact"
								variant="outlined" hide-details style="width: 40%" :clearable="false" />
							<uc-latex-edit v-else v-model:content="selectedQuestionData.config.columnB[index].text" />

						</v-col>
						<v-col cols="2">
							<v-btn icon="mdi-delete-outline" variant="text" size="small" color="red"
								@click="removePair(index)" />
						</v-col>
					</v-row>
					<v-btn prepend-icon="mdi-plus" variant="tonal" color="primary" @click="addPair" class="mt-4 mb-4">
						{{ $t('message.AddPair') }}
					</v-btn>
				</div>
				<!-- FILE_UPLOAD -->
				<div v-else-if="selectedQuestionData.type === 'FILE_UPLOAD'">
					<div v-if="selectedQuestionData.config.media.type === 'VIDEO'">
						<video :src="selectedQuestionData.config.media.source" controls />
					</div>
				</div>

				<div v-else-if="selectedQuestionData.type === 'ESSAY'">
					<v-number-input v-model="selectedQuestionData.config.maxLength" :label="$t('message.MaxCharacters')"
						variant="outlined" density="compact" />
				</div>

				<div v-else-if="['SHORT_ANSWER', 'AUDIO_RESPONSE'].includes(selectedQuestionData.type)">
					<p class="text-caption text-grey">
						{{ $t('message.NoAnswerConfig') }}.
					</p>
				</div>
			</div>
		</div>
	</v-card>

	<uc-loading-page v-model="loadingPage.isLoading" v-model:text="loadingPage.text" />
	<uc-question-from-hoc-lieu v-if="isShowModalImportFromHocLieu" v-model:isOpen="isShowModalImportFromHocLieu"
		:assignmentDetail="assignment" @importJson="bindingImport" />
	<uc-chon-ki-nang v-model:dialog="isShowModalSkill" @skillApplied="handleSubmitSkill"></uc-chon-ki-nang>
</template>

<script>
export default {
	name: 'uc-assignment-properties',
	props: { groups: { type: Array, default: () => [] }, item: Object, assignment: Object },
	emits: ['update:groups', 'update:item'],
	data() {
		this.$i18n.locale = (localStorage.getItem('IsLanguage') && localStorage.getItem('IsLanguage') == 'true') ? 'en' : 'vi'
		return {
			vueData,
			window,
			fileRecordAudio: null,
			loadingPage: {
				isLoading: false,
				text: "Đang tải dữ liệu..."
			},
			isSaveFile: false,
			isQuestionTextField: false,
			isShowModalImportFromHocLieu: false,
			isShowModalSkill: false,
			skills: new Map()
		}
	},
	watch: {},
	computed: {
		selectedGroupData() {
			if (!this.item || this.item.type !== 'group') return null;
			let mapGroup = this.groups[this.item.groupIndex]
			if (!mapGroup.advancedFeatures) {
				this.groups[this.item.groupIndex].advancedFeatures = {
					isShuffleQuestions: false,
					isShuffleAnswers: false
				}
			}
			return mapGroup;
		},
		selectedQuestionData() {
			if (!this.item || this.item.type !== 'question') return null;
			return this.groups[this.item.groupIndex]?.questions?.[this.item.qIndex];
		},
		globalQuestionNumber() {
			if (!this.item || this.item.type !== 'question') return 0;
			let n = 1;
			for (let i = 0; i < this.item.groupIndex; i++) {
				n += this.groups[i].questions.length;
			}
			return n + this.item.qIndex;
		},
		IsEngLish: function () {
			return this.$i18n.locale == 'en'
		}
	},
	methods: {
		isAutoGradable(type) { return type.startsWith('QUIZ_'); },
		// Handle emit từ uc-media cho group
		handleGroupMediaUpdate(updatedData) {
			if (!this.item || this.item.type !== 'group') return;
			const ng = this.groups;
			const media = updatedData.media

			ng[this.item.groupIndex] = {
				...ng[this.item.groupIndex],
				media: {
					...ng[this.item.groupIndex].media,
					sourceYT: media.sourceYT,
					sourceRecord: media.sourceRecord,
					sourceFiles: {
						file: media.sourceFiles.file ?? [],
						image: media.sourceFiles.image ?? [],
					}
				}
			};
			this.updateGroups(ng);
		},
		// Handle emit từ uc-media cho question
		handleQuestionMediaUpdate(updatedData) {
			if (!this.item || this.item.type !== 'question') return;
			const ng = this.groups;
			const media = updatedData.media

			const keysToRemove = ["sourceYT", "sourceRecord", "sourceFiles"]; //Này bị thêm do phần cấu trúc uc-media, xóa đi cho gọn json, media đã thêm vào config, phần này bị dư ra

			keysToRemove.forEach(key => {
				if (ng[this.item.groupIndex].questions[this.item.qIndex].config.hasOwnProperty(key)) {
					delete ng[this.item.groupIndex].questions[this.item.qIndex].config[key];
				}
			});

			ng[this.item.groupIndex].questions[this.item.qIndex] = {
				...ng[this.item.groupIndex].questions[this.item.qIndex],
				config: {
					...ng[this.item.groupIndex].questions[this.item.qIndex].config,
					sourceYT: media.sourceYT,
					sourceRecord: media.sourceRecord,
					sourceFiles: {
						file: media.sourceFiles.file,
						image: media.sourceFiles.image,
					}
				}
			};
			this.updateGroups(ng);
		},

		updateGroups(newGroups) {
			this.$emit('update:groups', newGroups);
		},
		updateItem(key, value) {
			const ng = JSON.parse(JSON.stringify(this.groups));
			if (this.item.type === 'group') {
				ng[this.item.groupIndex][key] = value;
			}
			this.updateGroups(ng);
		},
		updateQuestion(key, value) { const ng = JSON.parse(JSON.stringify(this.groups)); ng[this.item.groupIndex].questions[this.item.qIndex][key] = value; this.updateGroups(ng); },
		updateQuestionConfig(key, value) { const ng = JSON.parse(JSON.stringify(this.groups)); ng[this.item.groupIndex].questions[this.item.qIndex].config[key] = value; this.updateGroups(ng); },
		updateOptionText(optionIndex, text) { const ng = JSON.parse(JSON.stringify(this.groups)); ng[this.item.groupIndex].questions[this.item.qIndex].config.options[optionIndex].text = text; this.updateGroups(ng); },
		addOption() { const ng = JSON.parse(JSON.stringify(this.groups)); const opts = ng[this.item.groupIndex].questions[this.item.qIndex].config.options; opts.push({ id: `opt_${Date.now()}`, text: 'Lựa chọn mới' }); this.updateGroups(ng); },
		removeOption(optionIndex) {
			console.log('optionIndex', optionIndex)
			const ng = JSON.parse(JSON.stringify(this.groups));
			ng[this.item.groupIndex].questions[this.item.qIndex].config.options.splice(optionIndex, 1);
			this.updateGroups(ng);
		},
		updatePart(partIndex, key, value) { const ng = JSON.parse(JSON.stringify(this.groups)); ng[this.item.groupIndex].questions[this.item.qIndex].config.parts[partIndex][key] = value; this.updateGroups(ng); },
		addPart(type) { const ng = JSON.parse(JSON.stringify(this.groups)); const parts = ng[this.item.groupIndex].questions[this.item.qIndex].config.parts; if (type === 'text') { parts.push({ type: 'text', value: ' ' }); } else { parts.push({ type: 'blank', id: `blank_${Date.now()}`, acceptedAnswers: [] }); } this.updateGroups(ng); },
		removePart(partIndex) { const ng = JSON.parse(JSON.stringify(this.groups)); ng[this.item.groupIndex].questions[this.item.qIndex].config.parts.splice(partIndex, 1); this.updateGroups(ng); },
		addPair() {
			const newIndex = Date.now();
			const aId = `a${newIndex}`; const bId = `b${newIndex}`;
			const newA = [...this.selectedQuestionData.config.columnA, { id: aId, text: '' }];
			const newB = [...this.selectedQuestionData.config.columnB, { id: bId, text: '' }];
			const newPairs = [...this.selectedQuestionData.config.correctPairs, { from: aId, to: bId }];
			this.selectedQuestionData.config = { ...this.selectedQuestionData.config, columnA: newA, columnB: newB, correctPairs: newPairs };
		},
		removePair(index) {
			if (this.selectedQuestionData.config.columnA.length > 1) {
				const newA = [...this.selectedQuestionData.config.columnA]; newA.splice(index, 1);
				const newB = [...this.selectedQuestionData.config.columnB]; newB.splice(index, 1);
				const newPairs = [...this.selectedQuestionData.config.correctPairs]; newPairs.splice(index, 1);
				this.selectedQuestionData.config = { ...this.selectedQuestionData.config, columnA: newA, columnB: newB, correctPairs: newPairs };
			}
		},
		updateShuffleQuestions(id, val) {
			this.groups[this.item.groupIndex].advancedFeatures.isShuffleQuestions = val
			this.$emit('update:groups', this.groups);
		},
		updateShuffleAnswers(id, val) {
			this.groups[this.item.groupIndex].advancedFeatures.isShuffleAnswers = val
			this.$emit('update:groups', this.groups);
		},
		onOpenModalImportFromHocLieu() {
			this.isShowModalImportFromHocLieu = true
		},
		bindingImport(val) {
			this.groups[this.item.groupIndex].questions = [...this.groups[this.item.groupIndex].questions, val]
		},
		onOpenModalKiNang() {
			this.isShowModalSkill = true
		},
		handleSubmitSkill(val) {
			let SkillsNotDuplicate = val.filter(i => !this.selectedQuestionData.skills.map(e => e.KyNang_MonHoc_ChiTietID).includes(i.KyNang_MonHoc_ChiTietID))
			this.selectedQuestionData.skills = [...this.selectedQuestionData.skills, ...SkillsNotDuplicate]
			val.forEach(i => {
				this.skills.set(i.KyNang_MonHoc_ChiTietID, i.TenKyNang)
			})
		},
		removeChip(index) {
			this.groups[this.item.groupIndex]?.questions[this.item.qIndex].skills.splice(index, 1)
			this.$emit('update:groups', this.groups);
		},
		getSkillLabel(skill) {
			return this.skills.get(skill.KyNang_MonHoc_ChiTietID) || skill.TenKyNang;
		}
	}
}
</script>