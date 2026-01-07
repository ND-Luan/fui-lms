<template>
	<div class="properties-panel">
		<v-tabs v-model="tab" bg-color="white" color="primary" grow sticky>
			<v-tab value="header">{{ $t('message.GeneralInfo') }}</v-tab>
			<v-tab value="element" :disabled="!element">{{ $t('message.Content') }}</v-tab>
		</v-tabs>
		<v-window v-model="tab" class="pa-4 properties-content">
			<v-window-item value="header" eager>
				<v-text-field :label="$t('message.LessonTitle')" :model-value="lessonHeader.Title"
					@update:modelValue="$emit('update:lessonHeader', { ...lessonHeader, Title: $event })"
					variant="outlined" density="compact" />
				<v-textarea :label="$t('message.DescriptionGuide')" :model-value="lessonHeader.Description"
					@update:modelValue="$emit('update:lessonHeader', { ...lessonHeader, Description: $event })"
					variant="outlined" density="compact" rows="3" />
				<v-text-field :label="$t('message.Week')" :model-value="lessonHeader.Tuan"
					@update:modelValue="$emit('update:lessonHeader', { ...lessonHeader, Tuan: $event })"
					variant="outlined" density="compact" :placeholder="$t('message.WeekExample')" />
				<v-text-field :label="$t('message.ChapterTopic')" :model-value="lessonHeader.Chuong"
					@update:modelValue="$emit('update:lessonHeader', { ...lessonHeader, Chuong: $event })"
					variant="outlined" density="compact" :placeholder="$t('message.ChapterExample')" />
			</v-window-item>

			<v-window-item value="element" eager>
				<div v-if="!element" class="text-center pa-10 text-grey">
					<v-icon size="48" class="mb-2">mdi-cursor-default-click-outline</v-icon>
					<div>{{ $t('message.SelectComponentToEdit') }}</div>
				</div>
				<div v-else>
					<v-text-field :label="$t('message.BlockTitleOptional')" :model-value="element.ElementData.title"
						@update:modelValue="updateElementData({ title: $event })" variant="outlined" density="compact"
						clearable />
					<v-divider class="my-4"></v-divider>
					<div v-if="element.ElementType === 'TEXT'">
						<label class="text-subtitle-2 mb-2 d-block">{{ $t('message.EditText') }}</label>
						<uc-latex-edit :content="element.ElementData.content"
							@update:content="updateElementData({ content: $event })"
							:style="{ 'word-break': 'auto-phrase' }" />
					</div>
					<div v-else-if="element.ElementType === 'IMAGE'">
						<v-btn @click="$refs.inputImage.click()" :text="$t('message.UploadImage')" color="primary"
							variant="elevated" />
						<input ref="inputImage" type="file" @change="(e) => handleChangeFile(e, element.ElementType)"
							style="display: none" />
						<div class="d-flex ga-2">
							<div v-for="(file, index) in element.ElementData.sources" class="position-relative"
								style="width:200px">
								<v-btn class="position-absolute" @click="element.ElementData.sources.splice(index, 1)"
									size="small" icon="mdi-close" color="red" variant="tonal"
									style="right: 4px; top: 4px; z-index: 1" />
								<v-img
									:src="'https://drive.google.com/thumbnail?id=' + getDriveFileId(file.source) + '&sz=w1000'"
									:lazy-src="'https://drive.google.com/thumbnail?id=' + getDriveFileId(file.source) + '&sz=w1000'">
									<template v-slot:placeholder>
										<div class="d-flex align-center justify-center fill-height">
											<v-progress-circular color="grey-lighten-4"
												indeterminate></v-progress-circular>
										</div>
									</template>
								</v-img>
								<v-text-field class="mt-2" :label="$t('message.Caption')" v-model="file.caption"
									variant="outlined" density="compact" />
							</div>
						</div>
					</div>
					<div v-else-if="element.ElementType === 'YOUTUBE'">
						<div class="d-flex ga-2">
							<v-text-field v-model="element.ElementData.source"
								:placeholder="$t('message.PasteVideoLink')" />
							<v-btn @click="$refs.inputYoutube.click()" :text="$t('message.UploadVideo')" color="primary"
								variant="elevated" />
						</div>
						<p class="text-caption">
							{{ $t('message.VideoNote') }}
						</p>
						<input ref="inputYoutube" type="file" @change="(e) => handleChangeFile(e, element.ElementType)"
							style="display: none" />
						<iframe width="560" height="315" :src="renderUrlYoutube(element.ElementData.source)"
							title="YouTube video player" frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							allowfullscreen></iframe>
					</div>
					<div v-else-if="element.ElementType === 'FILE'">
						<v-btn @click="$refs.inputFile.click()" :text="$t('message.UploadFile')" color="primary"
							variant="elevated" />
						<input ref="inputFile" type="file" @change="(e) => handleChangeFile(e, element.ElementType)"
							style="display: none" />
						<div class="d-flex ga-2">
							<v-chip v-for="(file, index) in element.ElementData.sources">
								{{ file.name }}
								<v-icon @click="element.ElementData.sources.splice(index, 1)">mdi-close</v-icon>
							</v-chip>
						</div>
					</div>
					<div v-else-if="element.ElementType === 'AUDIO'">
						<label class="text-subtitle-2 mb-2 d-block">{{ $t('message.RecordOrUploadAudio') }}</label>
						<uc-audio-record v-model:file="fileRecordAudio" v-model:src="element.ElementData.source"
							@handleSave="handleChangeFile(fileRecordAudio, element.ElementType)" />
					</div>
					<div v-else-if="element.ElementType === 'HTML'" class="d-flex flex-column ga-2">
						<div class="d-flex">
							<v-spacer></v-spacer>
							<v-btn variant="tonal" color="primary" @click="onOpenModalImportFromHocLieu()">
								{{ $t('message.ImportFromLibrary') }}
							</v-btn>
						</div>
						<v-checkbox v-model="element.ElementData.IsHTML" label="HTML" />
						<v-textarea v-model="element.ElementData.source" :placeholder="$t('message.PasteHTML')" />
						<!-- <f-editor v-model="element.ElementData.source" /> -->
					</div>
					<!-- QUIZ -->
					<div v-else-if="element.ElementType.includes('QUIZ')">
						<div class="d-flex justify-space-between align-center">
							<p class="mb-2 font-weight-medium">{{ $t('message.AnswerConfig') }}</p>
							<v-checkbox v-model="element.ElementData.config.isAdvanced"
								:label="$t('message.AdvancedAnswerSettings')" />
						</div>
						<div class="mb-2">
							<p class="mt-4 mb-2 font-weight-medium">{{ $t('message.QuestionContentLabel') }}</p>
							<f-editor :model-value="element.ElementData.config.questionText"
								@update:model-value="updateQuestionConfig('questionText', $event)" />
						</div>

						<div v-if="element.ElementType === 'QUIZ_SINGLE_CHOICE'">
							<div v-for="(option, index) in element.ElementData.config.options" :key="option.id"
								class="d-flex align-center mb-2">
								<v-radio-group :model-value="element.ElementData.config.correctAnswer"
									@update:model-value="updateQuestionConfig('correctAnswer', $event)"
									class="flex-shrink-0">
									<v-radio :value="option.id" hide-details />
								</v-radio-group>
								<v-text-field v-if="!element.ElementData.config.isAdvanced" :model-value="option.text"
									@update:model-value="updateOptionText(index, $event)" dense variant="outlined"
									hide-details />
								<uc-latex-edit v-else v-model:content="option.text" />
								<v-btn size="small" @click="removeOption(index)" class="ml-1" icon="mdi-close" />
							</div>
							<v-btn block small @click="addOption" variant="tonal" class="mt-2">
								<v-icon start>mdi-plus</v-icon>{{ $t('message.AddOption') }}
							</v-btn>
						</div>

						<div v-else-if="element.ElementType === 'QUIZ_MULTIPLE_CHOICE'">
							<div v-for="(option, index) in element.ElementData.config.options" :key="option.id"
								class="d-flex align-center mb-2">
								<v-checkbox :model-value="element.ElementData.config.correctAnswers" :value="option.id"
									@update:model-value="updateQuestionConfig('correctAnswers', $event)" hide-details
									class="flex-shrink-0">
								</v-checkbox>
								<v-text-field v-if="!element.ElementData.config.isAdvanced" :model-value="option.text"
									@update:model-value="updateOptionText(index, $event)" dense variant="outlined"
									hide-details />
								<uc-latex-edit v-else v-model:content="option.text" />
								<v-btn icon size="small" @click="removeOption(index)" class="ml-1">
									<v-icon>mdi-close</v-icon>
								</v-btn>
							</div>
							<v-btn small @click="addOption" variant="tonal" class="mt-2">
								<v-icon left>mdi-plus</v-icon>{{ $t('message.AddOption') }}
							</v-btn>
						</div>

						<div v-else-if="element.ElementType === 'QUIZ_TRUE_FALSE'">
							<v-radio-group :model-value="element.ElementData.config.correctAnswer"
								@update:model-value="updateQuestionConfig('correctAnswer', $event)">
								<v-radio :value="true" :label="$t('message.Correct')" />
								<v-radio :value="false" :label="$t('message.Incorrect')" />
							</v-radio-group>
						</div>

						<div v-else-if="element.ElementType === 'QUIZ_FILL_IN_BLANK'">
							<p class="text-caption">{{ $t('message.Structure') }}</p>
							<div v-for="(part, index) in element.ElementData.config.parts" :key="index"
								class="d-flex flex-wrap align-center mb-2">
								<v-text-field v-if="part.type === 'text'" :model-value="part.value"
									@update:model-value="updatePart(index, 'value', $event)"
									:label="$t('message.TextContent')" variant="outlined" density="compact"
									hide-details />

								<v-text-field v-if="part.type === 'blank'" :model-value="part.acceptedAnswers[0]"
									@update:model-value="updatePart(index, 'acceptedAnswers', [$event])"
									:label="$t('message.CorrectAnswer')" variant="outlined" density="compact"
									hide-details class="ml-2" />
								<v-btn icon size="small" @click="removePart(index)" class="ml-1">
									<v-icon>mdi-close</v-icon>
								</v-btn>
							</div>
							<v-btn small @click="addPart('text')" variant="tonal" class="mr-2 mt-2">{{
								$t('message.AddText') }}</v-btn>
							<v-btn small @click="addPart('blank')" variant="tonal" class="mt-2">{{
								$t('message.AddBlank') }}</v-btn>
						</div>

						<div v-else-if="element.ElementType === 'QUIZ_MATCHING'">
							<v-row>
								<v-col><label class="form-label">{{ $t('message.ColumnA') }}</label></v-col>
								<v-col><label class="form-label">{{ $t('message.ColumnB') }}</label></v-col>
							</v-row>
							<v-row v-for="(pair, index) in element.ElementData.config.columnA" :key="index"
								class="mb-n5">
								<v-col cols="5">
									<v-text-field v-if="!element.ElementData.config.isAdvanced" v-model="pair.text"
										density="compact" variant="outlined" hide-details />
									<uc-latex-edit v-else v-model:content="pair.text" style="width: 50%" />
								</v-col>
								<v-col cols="5" class="d-flex align-center">
									<v-text-field v-if="!element.ElementData.config.isAdvanced"
										v-model="element.ElementData.config.columnB[index].text" density="compact"
										variant="outlined" hide-details style="width: 40%" />
									<uc-latex-edit v-else
										v-model:content="element.ElementData.config.columnB[index].text" />
								</v-col>
								<v-col cols="2">
									<v-btn icon="mdi-delete-outline" variant="text" size="small" color="red"
										@click="removePair(index)" />
								</v-col>
							</v-row>
							<v-btn prepend-icon="mdi-plus" variant="tonal" color="primary" @click="addPair"
								class="mt-4 mb-4">
								{{ $t('message.AddPair') }}
							</v-btn>
						</div>
					</div>
				</div>
			</v-window-item>
		</v-window>
		<uc-loading-page v-model="loadingPage.isLoading" v-model:text="loadingPage.text" />
		<uc-lesson-from-hoc-lieu v-if="isShowModalImportFromHocLieu" v-model:isOpen="isShowModalImportFromHocLieu"
			:lessonDetail="lessonHeader" @importJson="bindingImport" />
	</div>
</template>

<script>
	export default {
		name: 'uc-lesson-properties',
		props: {
			lessonHeader: { type: Object, required: true },
			element: { type: Object, default: null },
			index: { type: Number, default: null }
		},
		emits: ['update:lessonHeader', 'update:element'],
		data() {
			this.$i18n.locale = (localStorage.getItem('IsLanguage') && localStorage.getItem('IsLanguage') == 'true') ? 'en' : 'vi'
			return {
				tab: 'header',
				fileRecordAudio: null,
				loadingPage: {
					isLoading: false,
					text: this.$t('message.LoadingData')
				},
				isShowModalImportFromHocLieu: false,
				vueData,
			}
		},
		watch: {
			index(newIndex, oldIndex) {
				if (newIndex !== null && newIndex !== oldIndex) this.tab = 'element';
				else if (newIndex === null) this.tab = 'header';
			}
		},
		methods: {
			async saveElement() {
				await this.ajaxCALLPromise('lms/EL_Element_Save', {
					ElementID: this.element.ElementID,
					LessonID: this.element.LessonID,
					ElementType: this.element.ElementType,
					ElementData: this.element.ElementData,
					SortOrder: this.element.SortOrder,
				})
			},
			async handleChangeFile(e, ElementType) {
				let file = null
				if (ElementType === "AUDIO") file = e
				else file = e.target.files[0]
				console.log('file', file)
				if (!file) return
				if (ElementType === "IMAGE") {
					const { id, name, source } = await this.uploadToGoogleDrive(file)
					this.element.ElementData.sources.push({
						id,
						name,
						source,
					})
					await this.saveElement()
				}
				else if (ElementType === 'YOUTUBE') {
					const { id, name, source } = await this.uploadFileYoutube(file)
					this.element.ElementData.source = source
					await this.saveElement()
				}
				else if (ElementType === 'FILE') {
					const { id, name, source } = await this.uploadToGoogleDrive(file)
					this.element.ElementData.sources.push({
						id,
						name,
						source,
					})
					await this.saveElement()
				} else if (ElementType === 'AUDIO') {
					const { id, name, source } = await this.uploadToGoogleDrive(file)
					this.element.ElementData.source = source
					await this.saveElement()
					return // return luôn ko cần chạy tiếp tục phía dưới code
				}
				//reset lại event  
				e.target.value = ''
			},
			async uploadFileYoutube(file) {
				this.loadingPage.isLoading = true
				this.loadingPage.text = this.$t('message.LoadingData')
	
				const { access_token } = await this.ajaxCALLPromise('lms/FP_Youtube_Token_Get')
				const playLists = await this.ajaxCALLPromise('lms/FP_Youtube_PlayList_Get', { Access_Token: access_token })
	
				const namePrefix_Playlist = `LMS_Lesson_${this.element.LessonID}`
	
				const namePlaylist = namePrefix_Playlist
				console.log('namePlaylist', namePlaylist)
				let playListCurrent = playLists?.find(x => x.Title === namePlaylist)
				if (!playListCurrent) {
					const response = await this.ajaxCALLPromise('lms/FP_Youtube_PlayList_Ins', {
						TenPlayList: namePlaylist, Access_Token: access_token
					})
					playListCurrent = response[0] //khi insert xong API trả về ID mới
				}
	
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
	
				const url =
					'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status,contentDetails';
	
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
	
				this.loadingPage.text = this.$t('message.ContinuingUpload')
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
				if (!response_Resumable.ok) throw new Error('Upload session initiation failed');
				const uploadUrl = response_Resumable.headers.get('Location'); // URL để upload phần video
	
				this.loadingPage.text = this.$t('message.Uploading')
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
	
				this.loadingPage.text = this.$t('message.UpdatingVideoPlaylist')
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
				this.loadingPage.text = this.$t('message.WaitingYoutube')
				//Sau khi xử lý xong video thì kiểm tra video đã được upload completed lên chưa
				const isCompleted = await this.waitUntilVideoReady(videoResult.id, access_token)
				if (isCompleted) {
					//Xử lý tiếp theo
					this.loadingPage.isLoading = false
					return { id: videoResult.id, name: file.name, source: youtubeUrl }
				}
			},
			async waitUntilVideoReady(videoId, accessToken, maxWaitMs = 300000) {
				const start = Date.now();
				const checkInterval = 5000; // mỗi 5 giây check 1 lần
	
				while (Date.now() - start < maxWaitMs) {
					const res = await
						fetch(`https://www.googleapis.com/youtube/v3/videos?part=processingDetails&id=${videoId}`, {
							headers: {
								Authorization: `Bearer ${accessToken}`
							}
						});
					if (!res.ok) throw new Error('Lỗi khi kiểm tra trạng thái xử lý video');
					const data = await res.json();
					const status = data.items?.[0]?.processingDetails?.processingStatus;
					console.log('🔄 Trạng thái xử lý:', status);
	
					// 👉 Nếu không có status
					if (!status) {
						Vue.$toast.error(this.$t('message.VideoTooLongWarning'), { position: 'top' })
						throw new Error('⚠️ Video có thể quá dài (chỉ upload < 15 phút)');
						return true // thoát khỏi vòng lặp
					}
	
					if (status === 'succeeded') {
						return true; // Đã xử lý xong 
					} if (status === 'failed' || status === 'rejected') {
						throw new Error(`❌ Video xử lý thất bại: ${status}`);
					}
					await new Promise(resolve => setTimeout(resolve, checkInterval)); // đợi 5 giây
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
				this.loadingPage.text = this.$t('message.LoadingData')
	
				//Lấy Token từ câu gọi Youtube
				const { access_token } = await this.ajaxCALLPromise('lms/FP_Youtube_Token_Get')
	
				this.loadingPage.text = this.$t('message.SearchingFolder')
				const pathPrefix = `LMS_Lesson/Lesson_${this.element.LessonID}/${vueData.user.UserID}`
				const folderId = await this.ensureFolderPathExists(pathPrefix, access_token);
	
				const metadata = {
					name: file.name,
					mimeType: file.type,
					parents: [folderId],
				};
	
				const form = new FormData();
				form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
				form.append('file', file);
	
				this.loadingPage.text = this.$t('message.Uploading')
				const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
					method: 'POST',
					headers: new Headers({ Authorization: 'Bearer ' + access_token }),
					body: form,
				});
	
				const fileDrive = await res.json();
	
				this.loadingPage.text = this.$t('message.GrantingFilePermission')
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
			updateQuestionConfig(key, value) {
				this.element.ElementData.config[key] = value
			},
			updateOptionText(optionIndex, event) {
				this.element.ElementData.config.options[optionIndex].text = event
			},
			addOption() {
				const opts = this.element.ElementData.config.options
				opts.push({ id: `opt_${Date.now()}`, text: this.$t('message.NewOption') });
				this.element.ElementData.config.options = opts
			},
			removeOption(optionIndex) {
				this.element.ElementData.config.options.splice(optionIndex, 1);
			},
			updatePart(partIndex, key, value) {
				this.element.ElementData.config.parts[partIndex][key] = value
			},
			addPart(type) {
				const parts = this.element.ElementData.config.parts;
				if (type === 'text') parts.push({ type: 'text', value: ' ' });
				else parts.push({ type: 'blank', id: `blank_${Date.now()}`, acceptedAnswers: [] });
				this.element.ElementData.config.parts = parts
			},
			removePart(partIndex) {
				this.element.ElementData.config.parts.splice(partIndex, 1);
			},
			addPair() {
				const newIndex = Date.now();
				const aId = `a${newIndex}`;
				const bId = `b${newIndex}`;
				const newA = [...this.element.ElementData.config.columnA, { id: aId, text: '' }];
				const newB = [...this.element.ElementData.config.columnB, { id: bId, text: '' }];
				const newPairs = [...this.element.ElementData.config.correctPairs, { from: aId, to: bId }];
				this.element.ElementData.config = { ...this.element.ElementData.config, columnA: newA, columnB: newB, correctPairs: newPairs };
			},
			removePair(index) {
				if (this.element.ElementData.config.columnA.length > 1) {
					const newA = [...this.element.ElementData.config.columnA]; newA.splice(index, 1);
					const newB = [...this.element.ElementData.config.columnB]; newB.splice(index, 1);
					const newPairs = [...this.element.ElementData.config.correctPairs]; newPairs.splice(index, 1);
					this.element.ElementData.config = { ...this.element.ElementData.config, columnA: newA, columnB: newB, correctPairs: newPairs };
				}
			},
			updateElementData(newData) {
				const updatedElement = JSON.parse(JSON.stringify(this.element));
				updatedElement.ElementData = { ...updatedElement.ElementData, ...newData };
				this.$emit('update:element', { index: this.index, element: updatedElement });
			},
	
			onOpenModalImportFromHocLieu() {
				this.isShowModalImportFromHocLieu = true
				console.log('lessonHeader', this.lessonHeader)
			},
			bindingImport(val) {
				this.element.ElementData.source = val
			},
			renderUrlYoutube
		}
	}
</script>