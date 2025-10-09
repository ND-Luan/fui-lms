<template>
	<v-expansion-panels>
		<v-expansion-panel>
			<v-expansion-panel-title class="pa-2 font-weight-medium">Media</v-expansion-panel-title>
			<v-expansion-panel-text>
				<v-btn-toggle v-model="selectedData.media.type" divided mandatory style="overflow: auto">
					<v-btn value='YOUTUBE'>
						<v-badge dot inline color="success" v-if="selectedData.media.sourceYT.source?.length > 0">
							VIDEO
						</v-badge>
						<span v-else>VIDEO</span>
					</v-btn>
					<v-btn value='RECORD_AUDIO' text="AUDIO">
						<v-badge dot inline color="success" v-if="selectedData.media.sourceRecord.source?.length > 0">
							AUDIO
						</v-badge>
						<span v-else>AUDIO</span>
					</v-btn>
					<!-- <v-btn value='IMAGE' text="IMAGE" /> -->
					<!-- <v-btn value='FILE' text="FILE" /> -->
					<v-btn value='FILE' text="FILE">
						<v-badge dot inline color="success"
							v-if="selectedData.media.sourceFiles.file?.length > 0 || selectedData.media.sourceFiles.image?.length > 0">
							FILE
						</v-badge>
						<span v-else>FILE</span>
					</v-btn>
				</v-btn-toggle>
				<!-- MEDIA YOUTUBE -->
				<div v-if="selectedData.media.type === 'YOUTUBE'">
					<div class="d-flex ga-2 pb-2">
						<v-text-field v-model="selectedData.media.sourceYT.source" placeholder="Dán link video..."
							hint="*Dán đường link youtube hoặc video khác" persistent-hint :clearable="false" />
						<v-btn @click="$refs.fileInput.click()" color="primary" variant="tonal" text='Tải video' />

						<input ref="fileInput" type="file" accept="video/*"
							@change="e => handleFileChange(e, selectedData.media.type)" style="display: none" />
					</div>
					<p v-if="selectedData.media.sourceYT.id?.length === 0" class="text-caption">
						*Lưu ý: Tải Video phải dưới 15p và tên file không được vượt quá 100 kí tự
					</p>
					<iframe v-if="selectedData.media.sourceYT.source?.length > 0" width="100%" height="400"
						:src="renderUrlYoutube(selectedData.media.sourceYT.source)" title="YouTube video player"
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowfullscreen></iframe>
				</div>
				<!-- MEDIA RECORD_AUDIO -->
				<div v-else-if="selectedData.media.type === 'RECORD_AUDIO'">
					<div class="d-flex ga-2 mb-2">
						<v-text-field v-model="selectedData.media.sourceRecord.source" placeholder="Dán link record..."
							:clearable="false" />
						<v-btn text="Tải audio" @click="$refs.inputUploadRecordAudio.click()" variant="tonal"
							color="primary" />
						<input ref="inputUploadRecordAudio" type="file" accept="audio/*"
							@change="(e) => handleFileChange(e, 'UPLOAD_RECORD_AUDIO')" style="display:none" />
					</div>
					<uc-audio-record v-model:file="fileRecordAudio" v-model:src="selectedData.media.sourceRecord.source"
						v-model:isSaveFile="isSaveFile"
						@handleSave="handleFileChange(fileRecordAudio, selectedData.media.type)" />
				</div>
				<!-- MEDIA FILE -->
				<div v-else-if="selectedData.media.type === 'FILE'">
					<v-btn @click="$refs.inputFile.click()" color="primary" variant="elevated">Tải file</v-btn>
					<input ref="inputFile" type="file" accept=".pdf, .doc, .docx, .ppt, .pptx, image/*"
						@change="e => handleFileChange(e, selectedData.media.type)" style="display:none" />
					<p class="text-subtitle-2 mt-2">Hình ảnh</p>
					<v-row dense v-if="selectedData.media.sourceFiles.image?.length > 0">
						<v-col cols="4" v-for="(file, index) in selectedData.media.sourceFiles.image">
							<v-img
								:src="'https://drive.google.com/thumbnail?id=' + getDriveFileId(file.source) + '&sz=w1000'"
								:lazy-src="'https://drive.google.com/thumbnail?id=' + getDriveFileId(file.source) + '&sz=w1000'"
								class="position-relative" contain style="max-height: 200px">
								<template v-slot:placeholder>
									<div class="d-flex align-center justify-center fill-height">
										<v-progress-circular color="grey-lighten-4" indeterminate />
									</div>
								</template>
								<v-btn class="position-absolute" style="right: 4px; top: 4px;" icon="mdi-close"
									size="x-small" color="red" variant="tonal"
									@click="selectedData.media.sourceFiles.image.splice(index, 1)" />
							</v-img>
						</v-col>
					</v-row>
					<uc-empty class="w-100" v-else />
					<p class="text-subtitle-2 mt-2">File</p>
					<div class="d-flex flex-wrap ga-2">
						<v-chip @click="window.open(file.source)"
							v-for="(file, index) in selectedData.media.sourceFiles.file">
							{{ file.name }}
							<v-icon color='red' @click="selectedData.media.sourceFiles.file?.splice(index, 1)">mdi-close
							</v-icon>
						</v-chip>
						<uc-empty class="w-100" v-if="selectedData.media.sourceFiles.file?.length === 0" />
					</div>
				</div>
			</v-expansion-panel-text>
		</v-expansion-panel>
	</v-expansion-panels>
</template>

<script>
	export default {
		props: {
			selectedData: Object,
			item: Object,
			loadingPage: Object,
		},
		data() {
			return {
				isSaveFile: false,
				fileRecordAudio: null,
				window
			}
		},
		methods: {
			async handleFileChange(e, typeMedia) {
				let file = null
				if (typeMedia === 'RECORD_AUDIO') file = e
				else file = e.target.files[0]
				if (!file) return;
				if (typeMedia === 'YOUTUBE') {
					const fileYoutube = await this.uploadFileYoutube(file)
					this.selectedData.media.sourceYT = fileYoutube
					this.$emit('update:selectedData', this.selectedData)
				}
				else if (typeMedia === 'FILE') {
					const type = file.type
					if (type.startsWith('image/')) {
						const fileDrive = await this.uploadToGoogleDrive(file)
	
						this.selectedData.media.sourceFiles.image.push(fileDrive)
						// this.selectedData.media.sourceFiles.image = arr
						this.$emit('update:selectedData', this.selectedData)
					} else if (
						type === 'application/pdf' ||
						type === 'application/msword' || // .doc
						type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // .docx
						type === 'application/vnd.ms-powerpoint' || // .ppt
						type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
					) {
						const fileDrive = await this.uploadToGoogleDrive(file)
						this.selectedData.media.sourceFiles.file.push(fileDrive)
						this.$emit('update:selectedData', this.selectedData)
						// this.selectedData.media.sourceFiles.file = arr
					}
				}
				else if (typeMedia === 'RECORD_AUDIO' || typeMedia === 'UPLOAD_RECORD_AUDIO') {
					const fileDrive = await this.uploadToGoogleDrive(file)
					this.selectedData.media.sourceRecord = fileDrive
					this.$emit('update:selectedData', this.selectedData)
					// this.$emit('update:selectedGroupData', this.selectedData)
					this.isSaveFile = true
				}
			},
	
			async uploadFileYoutube(file) {
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
	
				const url = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status,contentDetails';
	
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
	
					const _file = {
						id: videoResult.id,
						name: file.name,
						source: youtubeUrl
					}
					return _file
				}
			},
			async waitUntilVideoReady(videoId, accessToken, maxWaitMs = 300000) {
				const start = Date.now();
				const checkInterval = 5000; // mỗi 5 giây check 1 lần
	
				while (Date.now() - start < maxWaitMs) {
					const res = await fetch(
						`https://www.googleapis.com/youtube/v3/videos?part=processingDetails&id=${videoId}`, {
						headers: {
							Authorization: `Bearer ${accessToken}`
						}
					});
					if (!res.ok) throw new Error('Lỗi khi kiểm tra trạng thái xử lý video');
					const data = await res.json();
					const status = data.items?.[0]?.processingDetails?.processingStatus; // 👉 Nếu không có status
					if (!status) {
						Vue.$toast.error('⚠️ Video có thể quá dài (chỉ upload < 15 phút)', { position: 'top' })
						throw new Error('⚠️ Video có thể quá dài (chỉ upload < 15 phút)');
						return true // thoát khỏi vòng lặp 
					}
					if (status === 'succeeded') return true;
					if (status === 'failed' || status === 'rejected') throw new Error(`❌ Video xử lý thất bại: ${status}`);
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
				const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`,
					{
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
				const pathPrefix = `LMS/${vueData.assignment.MonHocName} 																																${vueData.assignment.KhoiID}/${vueData.assignment.Title}/${vueData.user.UserID}`
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
		},
	}
</script>