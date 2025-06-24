<template>
	<div class="chat-container">
		<!-- Header -->
		<div class="chat-header">
			<img src="/logo.png" alt="Logo" class="logo" />
			<h1>Mi Mi</h1>
			<p class="subtitle">Trợ lý ảo Mi Mi</p>
		</div>
		<!-- Chat Messages -->
		<div class="chat-messages">
			<div v-for="(msg, index) in messages" :key="index"
				:class="['chat-bubble', msg.sender === 'user' ? 'user' : 'bot']">
				{{ msg.text }}
			</div>
		</div>

		<!-- Chat Input -->
		<div class="chat-input">
			<div class="input-box">
				<!-- Left icons -->
				<div class="icon-group">
					<button class="icon-button">
						<i class="mdi mdi-paperclip"></i>
					</button>
					<button class="icon-button">
						<i class="mdi mdi-image-outline"></i>
					</button>
					<button class="logic-button">✨ Suy luận</button>
				</div>

				<!-- Text input -->
				<input v-model="message" type="text" class="text-input" placeholder="Gửi tin nhắn đến Mi Mi" />

				<!-- Send icon -->
				<button class="send-button" @click="onChat">
					<i class="mdi mdi-arrow-up-circle-outline"></i>
				</button>
			</div>
		</div>
	</div>
</template>



<script>
	export default {
		props: [],
		data() {
			return {
				message: '',
				messages: [] // <-- Quan trọng!
			};
		}
		,
		mounted() { },
		computed: {},
		watch: {},
		methods: {
			onChat() {
				const content = this.message.trim();
				if (!content) return;
	
				const vm = this;
				vm.messages.push({ sender: 'user', text: content });
	
				ajaxCALL('lms/AI_Help_Menu', { ChucNangCanTim: content }, function (res) {
					try {
						console.log('Phản hồi từ API:', res);
	
						// Bước 1: lấy chuỗi JSON từ Column1
						const rawJsonString = res.data?.[0]?.Column1;
						if (!rawJsonString) throw new Error('Không tìm thấy dữ liệu trong Column1');
	
						// Bước 2: parse chuỗi JSON
						const parsedInner = JSON.parse(rawJsonString);
	
						// Bước 3: lấy nội dung phản hồi
						const reply = parsedInner.data?.[0]?.Response || 'Không có nội dung phản hồi từ AI.';
	
						// Thêm tin nhắn vào giao diện
						vm.messages.push({ sender: 'bot', text: reply });
					} catch (e) {
						console.error('Lỗi xử lý dữ liệu phản hồi:', e);
						vm.messages.push({ sender: 'bot', text: 'Đã xảy ra lỗi khi xử lý phản hồi từ AI.' });
					}
				});
	
				vm.message = '';
			}
	
		},
	}
</script>