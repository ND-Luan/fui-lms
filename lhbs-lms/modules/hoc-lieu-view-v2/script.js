
function fn_renderDataPage() {
    // console.log('HocLieuID:', vueData.HocLieuID, 'NoiDungID:', vueData.NoiDungID);
    vueData.IsLoading = true;
    // --- Bước 1: Xây dựng một cây hoàn chỉnh và một map để tra cứu nhanh ---
    const flatList = vueData.DetailNoiDung
    if (!flatList || flatList.length === 0) {
        vueData.IsLoading = false;
        return;
    }
    const nodeMap = new Map();
    const roots = [];
    flatList.forEach(item => {
        nodeMap.set(item.NoiDungID, { ...item, children: [] });
    });
    nodeMap.forEach(node => {
        if (node.ParentID && nodeMap.has(node.ParentID)) {
            nodeMap.get(node.ParentID).children.push(node);
        } else {
            roots.push(node);
        }
    });
    // --- Bước 2: Tìm chính xác object của hoạt động hiện tại từ map ---
    const objCurrentBaiGiang = nodeMap.get(vueData.NoiDungID);
    if (!objCurrentBaiGiang) {
        console.error("Không tìm thấy nội dung với ID:", vueData.NoiDungID);
        vueData.IsLoading = false;
        return;
    }
    // console.log('objCurrentBaiGiang:', objCurrentBaiGiang);
    // --- Bước 3: Tìm ngược lên để xác định cha và ông (nếu có) ---
    let currentNhomKyNang = null;
    let currentBai = null;
    const parentNode = nodeMap.get(objCurrentBaiGiang.ParentID);
    // console.log('parentNode', parentNode)
    if (parentNode) {
        // if (parentNode.LoaiNoiDung === 'CHUONG') {
        //     currentNhomKyNang = parentNode;
        //     // Tìm cha của Nhóm Kỹ Năng, đó sẽ là Bài
        //     currentBai = nodeMap.get(parentNode.ParentID);
        // }
        // Giả định cấp cha đầu tiên là Nhóm Kỹ Năng hoặc Bài
        // if (parentNode.LoaiNoiDung === 'NHOM_KY_NANG') {
        //     currentNhomKyNang = parentNode;
        //     // Tìm cha của Nhóm Kỹ Năng, đó sẽ là Bài
        //     currentBai = nodeMap.get(parentNode.ParentID);
        // } else
            if (parentNode.LoaiNoiDung === 'BAI' || parentNode.LoaiNoiDung === 'NHOM_KY_NANG') {
            // Trường hợp hoạt động nằm trực tiếp dưới Bài
            currentBai = parentNode;
            currentNhomKyNang = null; // Không có nhóm kỹ năng trung gian
        }
    }
    // console.log('currentBai:', currentBai);
    // console.log('currentNhomKyNang:', currentNhomKyNang);
    // --- Bước 4: Gán dữ liệu ---
    vueData.currentBaiGiang = {
        ...objCurrentBaiGiang,
        currentNhomKyNang: currentNhomKyNang,
        currentBai: currentBai
    };
    // console.log('flatList', flatList)
    // Logic tìm index để điều hướng
    const allActivities = flatList.filter(x => {
        const isCheck = x.DataJson !== null && x.ParentID !== null
        if (isCheck) {
            // console.log('x.DataJson', x.DataJson)
            if (isHTML(x.DataJson)) return x
            else {
                const dataJson = x.DataJson ? JSON.parse(x.DataJson) : x.DataJson
                let isLengthJsonKey = false
                if (typeof dataJson === 'object') {
                    isLengthJsonKey = Object.keys(dataJson).length > 0
                }
                if (isLengthJsonKey) return x
            }
        }
    });
    // console.log('allActivities', allActivities)
    const currentIndex = allActivities.findIndex(x => x.NoiDungID === vueData.NoiDungID);
    vueData.lenCurrentNoiDung = currentIndex;
    vueData.lenDetailNoiDung = allActivities.length;
    vueData.IsLoading = false;
}
function pushState(key, value) {
    let currentUrl = window.location.href; // Get the current page's URL
    let url = new URL(currentUrl);
    let params = url.searchParams;
    params.set(key, value);
    window.history.pushState({}, '', url.href); // Changes the URL in the browser without a full page reload
}
function increasePage() {
    const DetailNoiDung = vueData.DetailNoiDung.filter(x => {
        const isCheck = x.DataJson !== null && x.ParentID !== null
        if (isCheck) {
            // console.log('x.DataJson', x.DataJson)
            if (isHTML(x.DataJson)) return x
            else {
                const dataJson = x.DataJson ? JSON.parse(x.DataJson) : x.DataJson
                let isLengthJsonKey = false
                if (typeof dataJson === 'object') {
                    isLengthJsonKey = Object.keys(dataJson).length > 0
                }
                if (isLengthJsonKey) return x
            }
        }
    })
    // console.log('increased', DetailNoiDung)
    const objCurrent = DetailNoiDung[vueData.lenCurrentNoiDung + 1]
    vueData.NoiDungID = objCurrent.NoiDungID
    // pushState('noidungid', objCurrent.NoiDungID)
    initPage()
    fn_renderDataPage()
}
function decreasePage() {
    const DetailNoiDung = vueData.DetailNoiDung.filter(x => {
        const isCheck = x.DataJson !== null && x.ParentID !== null
        if (isCheck) {
            console.log('x.DataJson', x.DataJson)
            if (isHTML(x.DataJson)) return x
            else {
                const dataJson = x.DataJson ? JSON.parse(x.DataJson) : x.DataJson
                let isLengthJsonKey = false
                if (typeof dataJson === 'object') {
                    isLengthJsonKey = Object.keys(dataJson).length > 0
                }
                if (isLengthJsonKey) return x
            }
        }
    })
    const objCurrent = DetailNoiDung[vueData.lenCurrentNoiDung - 1]
    vueData.NoiDungID = objCurrent.NoiDungID
    // pushState('noidungid', objCurrent.NoiDungID)
    initPage()
    fn_renderDataPage()
}
function initPage() {
    // console.log('init');
    vueData.isLoading = true;
    vueData.lessonId = new URLSearchParams(window.location.search).get('noidungid');
    if (vueData.lessonId) {
        CALL('getLessonDetail');
    } else {
        vueData.isLoading = false;
        vueData.lessonTitle = "Không tìm thấy ID bài giảng.";
    }
}
function handleApiResponse(res) {
    vueData.isLoading = false;
    if (res && Array.isArray(res) && res[0]) {
        const lessonData = res[0];
        vueData.lessonTitle = lessonData.TenNoiDung;
        let slide = {
            id: lessonData.NoiDungID,
            type: lessonData.LoaiNoiDung, // Luôn lấy LoaiNoiDung làm type gốc
            content: null // Khởi tạo content là null
        };
        // console.log('x', lessonData.DataJson && lessonData.DataJson.trim() !== '')
        function isPureHTMLString(str) {
            try {
                // Nếu parse thành JSON được → rõ ràng không phải HTML "thuần"
                JSON.parse(str);
                return false;
            } catch {
                // Nếu không phải JSON → có thể là HTML → kiểm tra kỹ hơn
                const el = document.createElement('div');
                el.innerHTML = str.trim();
                return el.childNodes.length > 0 && [...el.childNodes].some(n => n.nodeType === 1);
            }
        }
        try {
            // Chỉ parse nếu DataJson có nội dung
            if (lessonData.DataJson && lessonData.DataJson.trim() !== '') {
                if (isPureHTMLString(lessonData.DataJson)) {
                    slide.content = {}; // đảm bảo không còn là null nữa
                    slide.content.htmlContent = lessonData.DataJson
                } else {
                    const jsonParse = JSON.parse(lessonData.DataJson)
                    slide.content = jsonParse;
                }
            } else {
                // Nếu không có DataJson, có thể là một bài placeholder
                slide.content = { title: "Nội dung đang được cập nhật." };
            }
        }
        catch (e) {
            console.warn('error', e)
            // Nếu parse lỗi, coi DataJson là HTML thô và đổi type
            slide.type = 'RawHTML';
            slide.content = lessonData.DataJson;
        }
        // console.log('slidse', slide)
        // Gán vào một mảng chứa một slide duy nhất
        vueData.slides = [slide];
        vueData.currentSlideIndex = 1; // Tạm thời đặt là 1 để kích hoạt watch
        vueData.currentSlideIndex = 0; // Đặt lại là 0 để Vue chắc chắn thấy thay đổi
    } else {
        vueData.lessonTitle = "Lỗi tải dữ liệu bài giảng.";
        vueData.slides = [];
        vueData.currentSlideIndex = -1;
    }
}
function goToNextSlide() {
    if (vueData.currentSlideIndex < vueData.slides.length - 1) {
        vueData.currentSlideIndex++;
    }
}
function goToPrevSlide() {
    if (vueData.currentSlideIndex > 0) {
        vueData.currentSlideIndex--;
    }
}
function goBack() {
    window.location.replace(`chi-tiet-hoc-lieu?id=${vueData.HocLieuID}`);
}
/**
 * 🚀 PREMIUM SCRIPT ENHANCEMENTS
 * Thêm các tính năng xịn sò cho LMS Lạc Hồng
 */
// === CELEBRATION SYSTEM ===
function showSuccessAnimation() {
    // Confetti celebration
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10B981', '#0EA5E9', '#F59E0B']
        });
    }
    // Success sound
    playPremiumSound('celebration');
    // Visual feedback
    vueData.showCelebration = true;
    setTimeout(() => {
        vueData.showCelebration = false;
    }, 3000);
}
// === ENHANCED SOUND SYSTEM ===
function playPremiumSound(type, volume = 0.3) {
    if (!vueData.soundEnabled) return;
    const sounds = {
        // Navigation sounds
        navigate: '/sounds/premium/navigate.mp3',
        page_turn: '/sounds/premium/page-turn.mp3',
        // Quiz sounds
        correct: '/sounds/premium/success-bell.mp3',
        wrong: '/sounds/premium/gentle-buzz.mp3',
        // Interactive sounds
        click: '/sounds/premium/soft-click.mp3',
        hover: '/sounds/premium/hover-tone.mp3',
        drop: '/sounds/premium/satisfying-drop.mp3',
        // Achievement sounds
        star_earned: '/sounds/premium/star-chime.mp3',
        level_up: '/sounds/premium/level-up.mp3',
        celebration: '/sounds/premium/celebration.mp3',
        // Ambient sounds
        typing: '/sounds/premium/keyboard-type.mp3',
        notification: '/sounds/premium/gentle-notify.mp3'
    };
    if (sounds[type]) {
        const audio = new Audio(sounds[type]);
        audio.volume = volume;
        audio.play().catch(() => { });
    }
}
// === ADVANCED PROGRESS TRACKING ===
function updateProgressTracking() {
    const progress = {
        currentSlide: vueData.lenCurrentNoiDung + 1,
        totalSlides: vueData.lenDetailNoiDung,
        percentage: Math.round(((vueData.lenCurrentNoiDung + 1) / vueData.lenDetailNoiDung) * 100),
        stars: Math.ceil(((vueData.lenCurrentNoiDung + 1) / vueData.lenDetailNoiDung) * 5)
    };
    // Update user progress
    vueData.userProgress = {
        ...vueData.userProgress,
        completedSlides: progress.currentSlide,
        totalSlides: progress.totalSlides,
        stars: progress.stars
    };
    // Check for achievements
    checkAchievements(progress);
    // Save progress to localStorage (if available)
    try {
        localStorage.setItem(`lhbs_progress_${vueData.HocLieuID}`, JSON.stringify(progress));
    } catch (e) {
        console.warn('Could not save progress:', e);
    }
}
// === ACHIEVEMENT SYSTEM ===
// === ACHIEVEMENT SYSTEM ===
function checkAchievements(progress) {
    const achievements = [];
    // First slide completion
    if (progress.currentSlide === 1 && !vueData.achievements?.first_slide) {
        achievements.push({
            id: 'first_slide',
            title: '🎯 Bước đầu tiên!',
            description: 'Hoàn thành slide đầu tiên',
            icon: '🎯',
            color: '#10B981'
        });
    }
    // Half completion
    if (progress.percentage >= 50 && !vueData.achievements?.half_complete) {
        achievements.push({
            id: 'half_complete',
            title: '⭐ Nửa chặng đường!',
            description: 'Hoàn thành 50% bài học',
            icon: '⭐',
            color: '#F59E0B'
        });
    }
    // Full completion
    if (progress.percentage === 100 && !vueData.achievements?.full_complete) {
        achievements.push({
            id: 'full_complete',
            title: '🏆 Xuất sắc!',
            description: 'Hoàn thành toàn bộ bài học',
            icon: '🏆',
            color: '#0EA5E9'
        });
    }
    // Perfect score (5 stars)
    if (progress.stars === 5 && !vueData.achievements?.perfect_score) {
        achievements.push({
            id: 'perfect_score',
            title: '🌟 Hoàn hảo!',
            description: 'Đạt 5 sao trong bài học',
            icon: '🌟',
            color: '#EC4899'
        });
    }
    // Show achievements
    achievements.forEach(achievement => {
        showAchievementNotification(achievement);
        // Mark as earned
        if (!vueData.achievements) vueData.achievements = {};
        vueData.achievements[achievement.id] = true;
    });
}
// === ACHIEVEMENT NOTIFICATION ===
function showAchievementNotification(achievement) {
    // Create achievement popup
    const popup = document.createElement('div');
    popup.className = 'lh-achievement-popup';
    popup.innerHTML = `
        <div class="lh-achievement-content" style="border-left-color: ${achievement.color}">
            <div class="lh-achievement-icon">${achievement.icon}</div>
            <div class="lh-achievement-text">
                <div class="lh-achievement-title">${achievement.title}</div>
                <div class="lh-achievement-desc">${achievement.description}</div>
            </div>
        </div>
    `;
    // Add to page
    document.body.appendChild(popup);
    // Animate in
    setTimeout(() => popup.classList.add('lh-achievement-show'), 100);
    // Remove after delay
    setTimeout(() => {
        popup.classList.remove('lh-achievement-show');
        setTimeout(() => popup.remove(), 300);
    }, 4000);
    // Play sound
    playPremiumSound('level_up');
}
// === ENHANCED PAGE NAVIGATION ===
function increasePage() {
    if ((vueData.lenCurrentNoiDung + 1) >= vueData.lenDetailNoiDung) return;
    // Add page turn animation
    addPageTransition('next');
    // Update progress
    const DetailNoiDung = vueData.DetailNoiDung.filter(x => {
        const isCheck = x.DataJson !== null && x.ParentID !== null
        if (isCheck) {
            console.log('x.DataJson', x.DataJson)
            if (isHTML(x.DataJson)) return x
            else {
                const dataJson = x.DataJson ? JSON.parse(x.DataJson) : x.DataJson
                let isLengthJsonKey = false
                if (typeof dataJson === 'object') {
                    isLengthJsonKey = Object.keys(dataJson).length > 0
                }
                if (isLengthJsonKey) return x
            }
        }
    })
    const objCurrent = DetailNoiDung[vueData.lenCurrentNoiDung + 1];
    vueData.NoiDungID = objCurrent.NoiDungID;
    pushState('noidungid', objCurrent.NoiDungID);
    // Enhanced navigation
    initPage();
    fn_renderDataPage();
    updateProgressTracking();
    // Play navigation sound
    playPremiumSound('page_turn');
    // Haptic feedback (if supported)
    if ('vibrate' in navigator) {
        navigator.vibrate(50);
    }
}
function decreasePage() {
    if ((vueData.lenCurrentNoiDung + 1) <= 1) return;
    // Add page turn animation
    addPageTransition('prev');
    const DetailNoiDung = vueData.DetailNoiDung.filter(x => {
        const isCheck = x.DataJson !== null && x.ParentID !== null
        if (isCheck) {
            console.log('x.DataJson', x.DataJson)
            if (isHTML(x.DataJson)) return x
            else {
                const dataJson = x.DataJson ? JSON.parse(x.DataJson) : x.DataJson
                let isLengthJsonKey = false
                if (typeof dataJson === 'object') {
                    isLengthJsonKey = Object.keys(dataJson).length > 0
                }
                if (isLengthJsonKey) return x
            }
        }
    })
    const objCurrent = DetailNoiDung[vueData.lenCurrentNoiDung - 1];
    vueData.NoiDungID = objCurrent.NoiDungID;
    pushState('noidungid', objCurrent.NoiDungID);
    initPage();
    fn_renderDataPage();
    updateProgressTracking();
    playPremiumSound('page_turn');
    if ('vibrate' in navigator) {
        navigator.vibrate(30);
    }
}
// === PAGE TRANSITION EFFECTS ===
function addPageTransition(direction) {
    const slideContainer = document.querySelector('.lh-slide-container');
    if (!slideContainer) return;
    slideContainer.classList.add(`lh-page-transition-${direction}`);
    setTimeout(() => {
        slideContainer.classList.remove(`lh-page-transition-${direction}`);
    }, 500);
}
// === ENHANCED INITIALIZATION ===
function initPage() {
    console.log('🚀 Premium init');
    // Show loading animation
    vueData.isLoading = true;
    // Get lesson ID from URL
    vueData.lessonId = new URLSearchParams(window.location.search).get('noidungid');
    if (vueData.lessonId) {
        // Add loading delay for smooth UX
        setTimeout(() => {
            CALL('getLessonDetail');
        }, 300);
    } else {
        vueData.isLoading = false;
        vueData.lessonTitle = "Không tìm thấy ID bài giảng.";
    }
    // Initialize premium features
    initPremiumFeatures();
}
// === PREMIUM FEATURES INITIALIZATION ===
function initPremiumFeatures() {
    // Keyboard shortcuts
    initKeyboardShortcuts();
    // Touch gestures
    initTouchGestures();
    // Auto-save progress
    initAutoSave();
    // Performance monitoring
    initPerformanceMonitoring();
    // Accessibility enhancements
    initAccessibilityFeatures();
}
// === KEYBOARD SHORTCUTS ===
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Only when not typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                decreasePage();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ': // Spacebar
                e.preventDefault();
                increasePage();
                break;
            case 'Home':
                e.preventDefault();
                goToFirstSlide();
                break;
            case 'End':
                e.preventDefault();
                goToLastSlide();
                break;
            case 'Escape':
                e.preventDefault();
                goBack();
                break;
        }
    });
}
// === TOUCH GESTURES ===
function initTouchGestures() {
    let startX = 0;
    let startY = 0;
    const slideContainer = document.querySelector('.lh-slide-container');
    if (!slideContainer) return;
    slideContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    slideContainer.addEventListener('touchend', (e) => {
        if (!startX || !startY) return;
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = startX - endX;
        const diffY = startY - endY;
        // Horizontal swipe is more significant
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > 50) { // Minimum swipe distance
                if (diffX > 0) {
                    // Swipe left - next page
                    increasePage();
                } else {
                    // Swipe right - previous page
                    decreasePage();
                }
            }
        }
        startX = 0;
        startY = 0;
    });
}
// === AUTO-SAVE PROGRESS ===
function initAutoSave() {
    // Save progress every 30 seconds
    setInterval(() => {
        updateProgressTracking();
    }, 30000);
    // Save on page unload
    window.addEventListener('beforeunload', () => {
        updateProgressTracking();
    });
}
// === PERFORMANCE MONITORING ===
function initPerformanceMonitoring() {
    // Monitor frame rate
    let lastTime = performance.now();
    let frames = 0;
    function measureFPS() {
        const now = performance.now();
        frames++;
        if (now - lastTime >= 1000) {
            const fps = Math.round((frames * 1000) / (now - lastTime));
            // Log poor performance
            if (fps < 30) {
                console.warn('⚠️ Low FPS detected:', fps);
            }
            frames = 0;
            lastTime = now;
        }
        requestAnimationFrame(measureFPS);
    }
    requestAnimationFrame(measureFPS);
}
// === ACCESSIBILITY FEATURES ===
function initAccessibilityFeatures() {
    // Announce page changes to screen readers
    function announcePageChange() {
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.position = 'absolute';
        announcer.style.left = '-10000px';
        announcer.textContent = `Trang ${vueData.lenCurrentNoiDung + 1} trên ${vueData.lenDetailNoiDung}. ${vueData.lessonTitle}`;
        document.body.appendChild(announcer);
        setTimeout(() => {
            announcer.remove();
        }, 1000);
    }
    // Add to page navigation functions
    const originalIncrease = increasePage;
    const originalDecrease = decreasePage;
    increasePage = function () {
        originalIncrease();
        announcePageChange();
    };
    decreasePage = function () {
        originalDecrease();
        announcePageChange();
    };
}
// === ADDITIONAL NAVIGATION FUNCTIONS ===
function goToFirstSlide() {
    const DetailNoiDung = vueData.DetailNoiDung.filter(x => x.ParentID !== null && x.DataJson !== null);
    if (DetailNoiDung.length === 0) return;
    const firstSlide = DetailNoiDung[0];
    vueData.NoiDungID = firstSlide.NoiDungID;
    pushState('noidungid', firstSlide.NoiDungID);
    initPage();
    fn_renderDataPage();
    updateProgressTracking();
    playPremiumSound('navigate');
}
function goToLastSlide() {
    const DetailNoiDung = vueData.DetailNoiDung.filter(x => x.ParentID !== null && x.DataJson !== null);
    if (DetailNoiDung.length === 0) return;
    const lastSlide = DetailNoiDung[DetailNoiDung.length - 1];
    vueData.NoiDungID = lastSlide.NoiDungID;
    pushState('noidungid', lastSlide.NoiDungID);
    initPage();
    fn_renderDataPage();
    updateProgressTracking();
    playPremiumSound('navigate');
}
// === ENHANCED BACK NAVIGATION ===
function goBack() {
    // Save progress before leaving
    updateProgressTracking();
    // Add exit animation
    const container = document.querySelector('.lh-lesson-layout');
    if (container) {
        container.classList.add('lh-exit-animation');
    }
    // Navigate back after animation
    setTimeout(() => {
        window.location.replace(`chi-tiet-hoc-lieu?id=${vueData.HocLieuID}`);
    }, 300);
    playPremiumSound('navigate');
}
// === ENHANCED API RESPONSE HANDLING ===
function handleApiResponse(res) {
    vueData.isLoading = false;
    if (res && Array.isArray(res) && res[0]) {
        const lessonData = res[0];
        vueData.lessonTitle = lessonData.TenNoiDung;
        let slide = {
            id: lessonData.NoiDungID,
            type: lessonData.LoaiNoiDung,
            content: null
        };
        // Enhanced content parsing
        try {
            if (lessonData.DataJson && lessonData.DataJson.trim() !== '') {
                if (isPureHTMLString(lessonData.DataJson)) {
                    slide.content = { htmlContent: lessonData.DataJson };
                } else {
                    slide.content = JSON.parse(lessonData.DataJson);
                }
            } else {
                slide.content = {
                    title: "Nội dung đang được cập nhật.",
                    subtitle: "Vui lòng quay lại sau."
                };
            }
        } catch (e) {
            console.warn('⚠️ Content parsing error:', e);
            slide.type = 'RawHTML';
            slide.content = lessonData.DataJson;
        }
        // Enhanced slide setup
        vueData.slides = [slide];
        vueData.currentSlideIndex = 1;
        vueData.currentSlideIndex = 0;
        // Update progress
        updateProgressTracking();
        // Preload next slide for smooth navigation
        preloadNextSlide();
    } else {
        vueData.lessonTitle = "Lỗi tải dữ liệu bài giảng.";
        vueData.slides = [];
        vueData.currentSlideIndex = -1;
    }
}
// === PRELOAD OPTIMIZATION ===
function preloadNextSlide() {
    const DetailNoiDung = vueData.DetailNoiDung.filter(x => x.ParentID !== null && x.DataJson !== null);
    const nextIndex = vueData.lenCurrentNoiDung + 1;
    if (nextIndex < DetailNoiDung.length) {
        const nextSlide = DetailNoiDung[nextIndex];
        // Preload next slide data
        fetch(`/api/lms/FP_NoiDung_GetDetail`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ NoiDungID: nextSlide.NoiDungID })
        }).catch(() => { }); // Silent preload
    }
}
// === UTILITY FUNCTIONS ===
function isPureHTMLString(str) {
    try {
        JSON.parse(str);
        return false;
    } catch {
        const el = document.createElement('div');
        el.innerHTML = str.trim();
        return el.childNodes.length > 0 && [...el.childNodes].some(n => n.nodeType === 1);
    }
}
function pushState(key, value) {
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const params = url.searchParams;
    params.set(key, value);
    window.history.pushState({}, '', url.href);
}
// === REGISTER PREMIUM FUNCTIONS ===
vueData.playPremiumSound = playPremiumSound;
vueData.showSuccessAnimation = showSuccessAnimation;
vueData.updateProgressTracking = updateProgressTracking;
vueData.goToFirstSlide = goToFirstSlide;
vueData.goToLastSlide = goToLastSlide;
// === ENHANCED RENDER DATA PAGE ===
const originalRenderDataPage = fn_renderDataPage;
fn_renderDataPage = function () {
    originalRenderDataPage();
    updateProgressTracking();
};
function isHTML(str) {
    var a = document.createElement('div');
    a.innerHTML = str;
    for (var c = a.childNodes, i = c.length; i--;) {
        if (c[i].nodeType == 1) return true;
    }
    return false;
}
console.log('🚀 Premium LMS enhancements loaded!');
vueData.fn_renderDataPage = fn_renderDataPage
vueData.increasePage = increasePage
vueData.decreasePage = decreasePage
vueData.redirect = redirect