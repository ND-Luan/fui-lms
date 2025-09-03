<template>
	<v-card sticky top="80px">
		<v-card-title class="text-subtitle-1">Thuộc tính
			<v-chip class="ml-2" label color="primary" v-if="globalQuestionNumber!==0">
				Câu {{ globalQuestionNumber }}
			</v-chip>
		</v-card-title>
		<v-divider />

		<div v-if="!item" class="text-center pa-10 text-grey">
			<v-icon size="48" class="mb-2">mdi-cursor-default-click-outline</v-icon>
			<div>Chọn một phần hoặc câu hỏi để chỉnh sửa.</div>
		</div>

		<div v-else>
			<div v-if="item.type === 'group'">
				<v-text-field :model-value="selectedGroupData.title" @update:model-value="updateItem('title', $event)"
					label="Tên Phần/Nhóm" variant="outlined" density="compact" />
				<v-textarea :model-value="selectedGroupData.description"
					@update:model-value="updateItem('description', $event)" label="Mô tả/Hướng dẫn cho Phần này"
					variant="outlined" density="compact" rows="3" class="mt-4" />
			</div>

			<div v-if="item.type === 'question' && selectedQuestionData">
				<v-row>
					<v-col cols="6">
						<v-text-field :model-value="selectedQuestionData.points"
							@update:model-value="updateQuestion('points', parseFloat($event) || 0)" label="Điểm"
							type="number" min="0" step="0.25" variant="outlined" density="compact" />
					</v-col>
					<v-col cols="6">
						<v-select :model-value="selectedQuestionData.gradingType || 'auto'"
							@update:model-value="updateQuestion('gradingType', $event)" label="Cách chấm"
							:items="[{value: 'auto', title: 'Tự động'}, {value: 'manual', title: 'Chấm tay'}]"
							variant="outlined" density="compact"
							:disabled="!isAutoGradable(selectedQuestionData.type)" />
					</v-col>
				</v-row>

				<v-divider class="my-4" />
				<p class="mt-4 mb-2 font-weight-medium">Media:</p>
				<!-- Thêm các YT, IMG, RECOURD_AUDIO source -->
				<v-btn-toggle v-model="selectedQuestionData.config.media.type" class="mb-2" divided block mandatory
					style="overflow: auto">
					<v-btn value='YOUTUBE' text="YOUTUBE" />
					<v-btn value='RECORD_AUDIO' text="RECORD_AUDIO" />
					<v-btn value='IMAGE' text="IMAGE" />
					<v-btn value='FILE' text="FILE" />
				</v-btn-toggle>
				<!-- MEDIA YOUTUBE -->
				<div v-if="selectedQuestionData.config.media.type === 'YOUTUBE'">
					<div class="d-flex ga-2 pb-2">
						<v-text-field v-model="selectedQuestionData.config.media.sourceYT.source"
							@change="e => console.log(e)" placeholder="Dán link video..." />
						<v-btn @click="$refs.fileInput.click()" color="primary" variant="tonal" text='Tải video' />

						<input ref="fileInput" type="file" accept="video/*"
							@change="e => handleFileChange(e,selectedQuestionData.config.media.type)"
							style="display: none" />
					</div>
					<p v-if="selectedQuestionData.config.media.sourceYT.id.length === 0" class="text-caption">
						*Lưu ý: Tải Video phải dưới 15p và tên file không được vượt quá 100 kí tự
					</p>
					<iframe v-if="selectedQuestionData.config.media.sourceYT.source?.length > 0" width="560"
						height="315" :src="renderUrlYoutube(selectedQuestionData.config.media.sourceYT.source)"
						title="YouTube video player" frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowfullscreen></iframe>
				</div>
				<!-- MEDIA IMAGE -->
				<div v-else-if="selectedQuestionData.config.media.type === 'IMAGE'">
					<v-btn @click="$refs.inputImage.click()">Tải ảnh</v-btn>
					<input ref="inputImage" type="file" accept=".jpg, .jpeg, .png, .gif, .bmp, .webp, .svg"
						@change="e => handleFileChange(e, selectedQuestionData.config.media.type)"
						style="display:none" />
					<div class="d-flex flex-wrap">
						<v-img v-for="(file,index) in selectedQuestionData.config.media.sourceIMGs"
							:src="'https://drive.google.com/thumbnail?id='+ getDriveFileId(file.source) + '&sz=w1000'"
							class="position-relative" style="height: 200px">
							<v-btn class="position-absolute" style="right: 4px; top: 4px;" icon="mdi-close" size="small"
								color="red" variant="tonal"
								@click="selectedQuestionData.config.media.sourceIMGs.splice(index,1)" />
						</v-img>
					</div>
				</div>
				<!-- MEDIA RECORD_AUDIO -->
				<div v-else-if="selectedQuestionData.config.media.type === 'RECORD_AUDIO'">
					<uc-audio-record v-model:file="fileRecordAudio"
						v-model:src="selectedQuestionData.config.media.sourceRecord.source"
						v-model:isSaveFile="isSaveFile"
						@handleSave="handleFileChange(fileRecordAudio, selectedQuestionData.config.media.type)" />
				</div>
				<!-- MEDIA FILE -->
				<div v-else-if="selectedQuestionData.config.media.type === 'FILE'">
					<v-btn @click="$refs.inputFile.click()">Tải file</v-btn>
					<input ref="inputFile" type="file" accept=".pdf, .doc, .docx"
						@change="e => handleFileChange(e,selectedQuestionData.config.media.type)"
						style="display:none" />
					<div class="d-flex flex-wrap ga-2">
						<v-chip @click="window.open(file.source)"
							v-for="(file,index) in selectedQuestionData.config.media.sourceFiles">
							{{file.name}}
							<v-icon color='red'
								@click="selectedQuestionData.config.media.sourceFiles.splice(index, 1)">mdi-close
							</v-icon>
						</v-chip>
					</div>
				</div>
				<v-divider class="my-4" />
				<p class="mt-4 mb-2 font-weight-medium">Nội dung câu hỏi:</p>
				<f-editor :model-value="selectedQuestionData.config.questionText" placeholder="Nhập câu hỏi..."
					@update:model-value="updateQuestionConfig('questionText', $event)" />
				<v-divider class="my-4" />
				<!-- END -->
				<div class="d-flex justify-space-between align-center"
					v-if="!['QUIZ_TRUE_FALSE', 'ESSAY', 'AUDIO_RESPONSE', 'FILE_UPLOAD', 'SHORT_ANSWER'].includes(selectedQuestionData.type)">
					<p class="mb-2 font-weight-medium">Cấu hình đáp án:</p>
					<v-checkbox v-model="selectedQuestionData.config.isAdvanced" label="Thiếp lập đáp án nâng cao" />
				</div>
				<!-- QUIZ_SINGLE_CHOICE -->
				<div v-if="selectedQuestionData.type === 'QUIZ_SINGLE_CHOICE'">
					<div v-for="(option, index) in selectedQuestionData.config.options" :key="option.id"
						class="d-flex align-center mb-2">
						<v-radio-group :model-value="selectedQuestionData.config.correctAnswer"
							@update:model-value="updateQuestionConfig('correctAnswer', $event)" class="flex-shrink-0">
							<v-radio :value="option.id" hide-details />
						</v-radio-group>
						<v-text-field v-if="!selectedQuestionData.config.isAdvanced" :model-value="option.text"
							@update:model-value="updateOptionText(index, $event)" dense variant="outlined"
							hide-details />
						<uc-latex-edit v-else v-model:content="option.text" />
						<v-btn size="small" @click="removeOption(index)" class="ml-1" icon="mdi-close" />
					</div>
					<v-btn block small @click="addOption" variant="tonal" class="mt-2">
						<v-icon start>mdi-plus</v-icon>Thêm lựa chọn
					</v-btn>
				</div>
				<!-- QUIZ_MULTIPLE_CHOICE -->
				<div v-else-if="selectedQuestionData.type === 'QUIZ_MULTIPLE_CHOICE'">
					<div v-for="(option, index) in selectedQuestionData.config.options" :key="option.id"
						class="d-flex align-center mb-2">
						<v-checkbox :model-value="selectedQuestionData.config.correctAnswers" :value="option.id"
							@update:model-value="updateQuestionConfig('correctAnswers', $event)" hide-details
							class="flex-shrink-0">
						</v-checkbox>
						<v-text-field v-if="!selectedQuestionData.config.isAdvanced" :model-value="option.text"
							@update:model-value="updateOptionText(index, $event)" dense variant="outlined"
							hide-details />
						<uc-latex-edit v-else v-model:content="option.text" />
						<v-btn icon size="small" @click="removeOption(index)" class="ml-1">
							<v-icon>mdi-close</v-icon>
						</v-btn>
					</div>
					<v-btn small @click="addOption" variant="tonal" class="mt-2">
						<v-icon left>mdi-plus</v-icon>Thêm lựa chọn
					</v-btn>
				</div>
				<!-- QUIZ_TRUE_FALSE -->
				<div v-else-if="selectedQuestionData.type === 'QUIZ_TRUE_FALSE'">
					<v-radio-group :model-value="selectedQuestionData.config.correctAnswer"
						@update:model-value="updateQuestionConfig('correctAnswer', $event)">
						<v-radio :value="true" label="Đúng" />
						<v-radio :value="false" label="Sai" />
					</v-radio-group>
				</div>
				<!-- QUIZ_MULTIPLE_TRUE_FALSE -->
				<div v-else-if="selectedQuestionData.type === 'QUIZ_MULTIPLE_TRUE_FALSE'">
					<v-row v-for="(option, index) in selectedQuestionData.config.options" :key="index">
						<v-col class="d-flex ga-2" cols="4">
							<v-checkbox v-model="option.correctAnswer" color="primary" label="Đúng"
								@update:modelValue="(val) => {if(val) option.inCorrectAnswer = false}" />
							<v-checkbox v-model="option.inCorrectAnswer" color="red" label="Sai"
								@update:modelValue="(val) => {if(val) option.correctAnswer = false}" />
						</v-col>
						<v-col>
							<v-text-field v-if="!selectedQuestionData.config.isAdvanced" v-model="option.text"
								density="compact" variant="outlined" hide-details :clearable="false"
								style="max-width: 200px" />
							<uc-latex-edit v-else v-model:content="option.text" :isEditable="true" />
						</v-col>
						<v-col cols="2">
							<v-btn v-if="selectedQuestionData.config.options.length > 2" icon="mdi-delete-outline"
								variant="text" size="small" color="red" @click="removeOption('options', index)" />
						</v-col>
					</v-row>
					<v-btn prepend-icon="mdi-plus" variant="text" color="primary" @click="addOption('options')"
						text='Thêm lựa chọn' />
				</div>

				<!-- QUIZ_FILL_IN_BLANK -->
				<div v-else-if="selectedQuestionData.type === 'QUIZ_FILL_IN_BLANK'">
					<p class="text-caption">Cấu trúc: [Văn bản] [Ô trống 1] [Văn bản]...</p>
					<div v-for="(part, index) in selectedQuestionData.config.parts" :key="index"
						class="d-flex flex-wrap align-center mb-2">
						<v-text-field v-if="part.type === 'text'" :model-value="part.value"
							@update:model-value="updatePart(index, 'value', $event)" label="Nội dung văn bản"
							variant="outlined" density="compact" hide-details />

						<v-text-field v-if="part.type === 'blank'" :model-value="part.acceptedAnswers[0]"
							@update:model-value="updatePart(index, 'acceptedAnswers', [$event])" label="Đáp án đúng"
							variant="outlined" density="compact" hide-details class="ml-2" />
						<v-btn icon size="small" @click="removePart(index)" class="ml-1">
							<v-icon>mdi-close</v-icon>
						</v-btn>
					</div>
					<v-btn small @click="addPart('text')" variant="tonal" class="mr-2 mt-2">Thêm Văn bản</v-btn>
					<v-btn small @click="addPart('blank')" variant="tonal" class="mt-2">Thêm Ô trống</v-btn>
				</div>
				<!-- QUIZ_MATCHING -->
				<div v-else-if="selectedQuestionData.type === 'QUIZ_MATCHING'">
					<v-row>
						<v-col><label class="form-label">Cột A</label></v-col>
						<v-col><label class="form-label">Cột B (tương ứng)</label></v-col>
					</v-row>
					<v-row v-for="(pair, index) in selectedQuestionData.config.columnA" :key="index" class="mb-n5">
						<v-col cols="5">
							<v-text-field v-if="!selectedQuestionData.config.isAdvanced" v-model="pair.text"
								density="compact" variant="outlined" hide-details />
							<uc-latex-edit v-else v-model:content="pair.text" style="width: 50%" />
						</v-col>
						<v-col cols="5" class="d-flex align-center">
							<v-text-field v-if="!selectedQuestionData.config.isAdvanced"
								v-model="selectedQuestionData.config.columnB[index].text" density="compact"
								variant="outlined" hide-details style="width: 40%" />
							<uc-latex-edit v-else v-model:content="selectedQuestionData.config.columnB[index].text" />

						</v-col>
						<v-col cols="2">
							<v-btn icon="mdi-delete-outline" variant="text" size="small" color="red"
								@click="removePair(index)" />
						</v-col>
					</v-row>
					<v-btn prepend-icon="mdi-plus" variant="tonal" color="primary" @click="addPair" class="mt-4 mb-4">
						Thêm cặp
					</v-btn>
				</div>
				<!-- FILE_UPLOAD -->
				<div v-else-if="selectedQuestionData.type === 'FILE_UPLOAD'">
					<div v-if="selectedQuestionData.config.media.type === 'VIDEO'">
						<video :src="selectedQuestionData.config.media.source" controls />
					</div>
				</div>

				<div v-else-if="['SHORT_ANSWER', 'AUDIO_RESPONSE', 'ESSAY'].includes(selectedQuestionData.type)">
					<p class="text-caption text-grey">
						Loại câu hỏi này không có cấu hình đáp án. Điểm sẽ được chấm thủ công.
					</p>
				</div>
			</div>
		</div>
	</v-card>

	<uc-loading-page v-model="loadingPage.isLoading" v-model:text="loadingPage.text" />
</template>

<script>
	export default {
		name: 'uc-assignment-properties',
		props: { groups: { type: Array, default: () => [] }, item: Object, },
		emits: ['update:groups'],
		data() {
			return {
				vueData,
				window,
				fileRecordAudio: null,
				loadingPage: {
					isLoading: false,
					text: "Đang tải dữ liệu..."
				},
				filterImage: {
					max_file_size: '30mb',
					mime_types: [{ title: "All file images", extensions: "jpg,jpeg,png,gif,bmp,tiff,webp" }]
				},
				isSaveFile: false
			}
		},
		watch: {},
		computed: {
			selectedGroupData() { if (!this.item || this.item.type !== 'group') return null; return this.groups[this.item.groupIndex]; },
			selectedQuestionData() { if (!this.item || this.item.type !== 'question') return null; return this.groups[this.item.groupIndex]?.questions?.[this.item.qIndex]; },
			globalQuestionNumber() { if (!this.item || this.item.type !== 'question') return 0; let n = 1; for (let i = 0; i < this.item.groupIndex; i++) { n += this.groups[i].questions.length; } return n + this.item.qIndex; }
		},
		methods: {
			isAutoGradable(type) { return type.startsWith('QUIZ_'); },
			updateGroups(newGroups) { this.$emit('update:groups', newGroups); },
			updateItem(key, value) { const ng = JSON.parse(JSON.stringify(this.groups)); if (this.item.type === 'group') { ng[this.item.groupIndex][key] = value; } this.updateGroups(ng); },
			updateQuestion(key, value) { const ng = JSON.parse(JSON.stringify(this.groups)); ng[this.item.groupIndex].questions[this.item.qIndex][key] = value; this.updateGroups(ng); },
			updateQuestionConfig(key, value) { const ng = JSON.parse(JSON.stringify(this.groups)); ng[this.item.groupIndex].questions[this.item.qIndex].config[key] = value; this.updateGroups(ng); },
			updateOptionText(optionIndex, text) { const ng = JSON.parse(JSON.stringify(this.groups)); ng[this.item.groupIndex].questions[this.item.qIndex].config.options[optionIndex].text = text; this.updateGroups(ng); },
			addOption() { const ng = JSON.parse(JSON.stringify(this.groups)); const opts = ng[this.item.groupIndex].questions[this.item.qIndex].config.options; opts.push({ id: `opt_${Date.now()}`, text: 'Lựa chọn mới' }); this.updateGroups(ng); },
			removeOption(optionIndex) { const ng = JSON.parse(JSON.stringify(this.groups)); ng[this.item.groupIndex].questions[this.item.qIndex].config.options.splice(optionIndex, 1); this.updateGroups(ng); },
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
			async handleFileChange(e, typeMedia) {
				let file = null
				if (typeMedia === 'RECORD_AUDIO') {
					file = e
				} else {
					file = e.target.files[0]
				}
				// console.log(e, typeMedia, this.item, this.groups)
				if (!file) return;
				if (typeMedia === 'YOUTUBE') {
					this.loadingPage.isLoading = true
					this.loadingPage.text = "Đang tải dữ liệu..."
	
					const { access_token } = await this.ajaxCALLPromise('lms/FP_Youtube_Token_Get')
					const playLists = await this.ajaxCALLPromise('lms/FP_Youtube_PlayList_Get', { Access_Token: access_token })
	
					const namePrefix_Playlist = 'LMS_' + vueData.assignment.MonHocName + ' ' + vueData.assignment.KhoiID
	
					const namePlaylist = namePrefix_Playlist + '-' + vueData.assignment.Title
					console.log('namePlaylist', namePlaylist)
					let playListCurrent = playLists?.find(x => x.Title === namePlaylist)
					if (!playListCurrent) {
						const response = await this.ajaxCALLPromise('lms/FP_Youtube_PlayList_Ins', {
							TenPlayList: namePlaylist, Access_Token: access_token
						})
						playListCurrent = response[0] //khi insert xong API trả về ID mới
					}
	
					const url =
						'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status,contentDetails';
	
					function getCleanTitle(filename) {
						if (typeof filename !== 'string') return '';
						// Danh sách phần mở rộng cần loại bỏ
						const extensions = ['mp4', 'mov', 'avi', 'mkv'];
						// Biểu thức regex để tìm và loại bỏ đuôi file nếu nó ở cuối chuỗi
						const regex = new RegExp(`\\.(${extensions.join('|')})$`, 'i');
						// Bỏ phần mở rộng nếu có
						const nameWithoutExtension = filename.replace(regex, '');
						// Cắt khoảng trắng đầu/cuối
						const cleanTitle = nameWithoutExtension.trim();
						// Giới hạn 100 ký tự theo quy định của YouTube
						return cleanTitle.length > 100 ? cleanTitle.slice(0, 100) : cleanTitle;
					}
					const accessToken = access_token;
					const xUploadContentLength = file.size; // ví dụ 3MB
					const xUploadContentType = file.type; // hoặc 'video/mp4'
					const body = {
						snippet: {
							title: getCleanTitle(file.name),
							description: '',
							tags: [],
							categoryId: '27'
						},
						status: {
							privacyStatus: 'unlisted',
							selfDeclaredMadeForKids: true
						}
					};
					this.loadingPage.text = 'Đang tiếp tục tải lên...'
					//Tạo Resumable
					const response_Resumable = await fetch(url, {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${accessToken}`,
							'Content-Type': 'application/json; charset=UTF-8',
							'X-Upload-Content-Length': xUploadContentLength.toString(),
							'X-Upload-Content-Type': xUploadContentType
						},
						body: JSON.stringify(body)
					})
					console.log('response_Resumable', response_Resumable)
					if (!response_Resumable.ok) throw new Error('Upload session initiation failed');
					const uploadUrl = response_Resumable.headers.get('Location'); // URL để upload phần video
	
					this.loadingPage.text = 'Đang upload...'
					//Upload Video
					const response_file = await fetch(uploadUrl, {
						method: "PUT",
						headers: {
							'Authorization': `Bearer ${accessToken}`,
							'Content-Length': xUploadContentLength,
							'Content-Type': xUploadContentType
						},
						body: file
					})
	
					if (!response_file.ok) throw new Error(`Lỗi khi upload video: ${response_file.statusText}`);
	
					const videoResult = await response_file.json();
					const youtubeUrl = `https://www.youtube.com/watch?v=${videoResult.id}`;
					console.log('🎉 Upload thành công:', youtubeUrl);
	
					this.loadingPage.text = 'Đang cập nhật video vào danh sách phát....'
					//Cập nhật lại PlayList vào video
					const response_playList = await fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${access_token}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							snippet: {
								playlistId: playListCurrent?.PlaylistID,
								resourceId: {
									kind: 'youtube#video',
									videoId: videoResult.id
								}
							}
						})
					})
					this.loadingPage.text = 'Đang chờ youtube xử lý (có thể mất 2 - 5p)...'
					//Sau khi xử lý xong video thì kiểm tra video đã được upload completed lên chưa
					const isCompleted = await this.waitUntilVideoReady(videoResult.id, access_token)
					if (isCompleted) {
						//Xử lý tiếp theo
						this.loadingPage.isLoading = false
						this.selectedQuestionData.config.media.sourceYT = {
							id: videoResult.id,
							name: file.name,
							source: youtubeUrl
						}
					}
				}
				else if (typeMedia === 'FILE') {
					const fileDrive = await this.uploadToGoogleDrive(file)
					const arr = this.selectedQuestionData.config.media.sourceFiles
					arr.push(file)
					this.selectedQuestionData.config.media = {
						...this.selectedQuestionData.config.media,
						sourceFiles: fileDrivefileDrive
					}
				}
				else if (typeMedia === 'RECORD_AUDIO') {
					const fileDrive = await this.uploadToGoogleDrive(file)
					this.isSaveFile = true
					this.selectedQuestionData.config.media = {
						...this.selectedQuestionData.config.media,
						sourceRecord: fileDrive,
					}
				}
				else if (typeMedia === "IMAGE") {
					const fileDrive = await this.uploadToGoogleDrive(file)
					const arr = this.selectedQuestionData.config.media.sourceIMGs
					arr.push(fileDrive)
					this.selectedQuestionData.config.media = {
						...this.selectedQuestionData.config.media,
						sourceIMGs: arr
					}
				}
			},
			async waitUntilVideoReady(videoId, accessToken, maxWaitMs = 300000) {
				const start = Date.now();
				const checkInterval = 5000; // mỗi 5 giây check 1 lần
	
				while (Date.now() - start < maxWaitMs) {
					const res = await fetch(
						`https://www.googleapis.com/youtube/v3/videos?part=processingDetails&id=${videoId}`,
						{ headers: { Authorization: `Bearer ${accessToken}` } }
					);
	
					if (!res.ok) throw new Error('Lỗi khi kiểm tra trạng thái xử lý video');
					const data = await res.json();
					const status = data.items?.[0]?.processingDetails?.processingStatus;
	
					// 👉 Nếu không có status
					if (!status) {
						Vue.$toast.error('⚠️ Video có thể quá dài (chỉ upload < 15 phút)', { position: 'top' })
						throw new Error('⚠️ Video có thể quá dài (chỉ upload < 15 phút)');
						return true // thoát khỏi vòng lặp
					}
	
					if (status === 'succeeded') return true;
					if (status === 'failed' || status === 'rejected')
						throw new Error(`❌ Video xử lý thất bại: ${status}`);
	
					await new Promise(resolve => setTimeout(resolve, checkInterval));
				}
	
				throw new Error('⏳ Quá thời gian chờ xử lý video');
			},
			async ensureFolderPathExists(path, access_token) {
				const parts = path.split('/');
				let parentId = 'root';
	
				for (const part of parts) {
					parentId = await this.getOrCreateFolderId(part, parentId, access_token);
				}
	
				return parentId; // Trả về folder cuối cùng
			},
			async getOrCreateFolderId(folderName, parentId = 'root', access_token) {
				const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`;
	
				const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`, {
					headers: {
						Authorization: `Bearer ${access_token}`,
					},
				});
	
				const data = await res.json();
				if (data.files.length > 0) return data.files[0].id;
	
				// ⛏️ Nếu không có, tạo thư mục
				const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${access_token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						name: folderName,
						mimeType: 'application/vnd.google-apps.folder',
						parents: [parentId],
					}),
				});
	
				const created = await createRes.json();
				return created.id;
			},
			async uploadToGoogleDrive(file) {
				//Trường hợp vô if
				//Khi nội dung source ko có thay đổi, vẫn là file cũ thì sẽ ko có "file"
				//Nêu ghi âm thì sẽ có file mới thì sẽ bảo qua điều kiện if
				if (!file) return
	
				this.loadingPage.isLoading = true
				this.loadingPage.text = "Đang tải dữ liệu..."
	
				//Lấy Token từ câu gọi Youtube
				const { access_token } = await this.ajaxCALLPromise('lms/FP_Youtube_Token_Get')
	
				this.loadingPage.text = "Đang tìm kiếm folder..."
				const pathPrefix = `LMS/${vueData.assignment.MonHocName}
																																																																																																																																																																																																																																																			${vueData.assignment.KhoiID}/${vueData.assignment.Title}/${vueData.user.UserID}`
				const folderId = await this.ensureFolderPathExists(pathPrefix, access_token);
	
				const metadata = {
					name: file.name,
					mimeType: file.type,
					parents: [folderId],
				};
	
				const form = new FormData();
				form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
				form.append('file', file);
	
				this.loadingPage.text = "Đang upload..."
				const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
					method: 'POST',
					headers: new Headers({ Authorization: 'Bearer ' + access_token }),
					body: form,
				});
	
				const fileDrive = await res.json();
	
				this.loadingPage.text = "Đang cấp quyền file..."
				//Cấp quyền cho file được công khai
				const reponse_permision = await fetch(`https://www.googleapis.com/drive/v3/files/${fileDrive?.id}/permissions`, {
					method: 'POST',
					headers: {
						Authorization: 'Bearer ' + access_token
					},
					body: JSON.stringify({
						role: 'reader', // Quyền xem
						type: 'anyone', // Bất kỳ ai
					}),
				});
	
				//Khi cập nhật permision xong thì lưu lại vào trong json editableItem
				if (reponse_permision.ok) {
					const driveFileUrl = `https://drive.google.com/file/d/${fileDrive.id}/preview`
					this.loadingPage.isLoading = false
					return { id: fileDrive.id, name: file.name, source: driveFileUrl }
					// this.selectedItem.config.media.source = driveFileUrl
				}
			},
			getDriveFileId(url) {
				const match = url.match(/\/d\/([^/]+)\//);
				return match ? match[1] : null;
			},
			ajaxCALLPromise(url, params = null) {
				return new Promise(resolve => {
					ajaxCALL(url, params, res => {
						if (res?.data) { resolve(res.data) }
						else { resolve(res) }
					})
				})
			},
			renderUrlYoutube
		}
	}
</script>