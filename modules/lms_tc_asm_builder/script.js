function isCheckAllGroupFullQuiz(groups) {
    let isNotFullQuiz = false
    if (!groups) return isNotFullQuiz
    for (var group of groups) {
        for (var question of group.questions) {
            let isCheck = question.type.includes('QUIZ') ? true : false
            if (!isCheck) {
                return true
            }
        }
    }
    return isNotFullQuiz
}
function isCheckGroupHasAnswerQuestionNotChoose(groups) {
    const obj = {
        isNotChoose: false,
        questionNotChooses: [],
        message: null
    }
    if (!groups) return obj
    for (var group of groups) {
        for (var question of group.questions) {
            let isCheck = isCheckAnswerQuestionNotChoose(question)
            if (isCheck) {
                obj.isNotChoose = true
                obj.questionNotChooses.push(question)
            }
        }
    }
    const numberQuestions = obj.questionNotChooses.map(x => 'Câu ' + x.ordinalNumber)
    obj.message = numberQuestions.join(', ') ?? ''
    return obj
}
function isCheckAnswerQuestionNotChoose(question) {
    let flag = false
    const config = question.config
    if (!config) return flag
    if (question.type === "QUIZ_SINGLE_CHOICE")
        if (!config.correctAnswer) flag = true
    if (question.type === "QUIZ_MULTIPLE_CHOICE")
        if (config.correctAnswers.length === 0) flag = true
    if (question.type === "QUIZ_TRUE_FALSE")
        if (config.correctAnswer === null) flag = true
    if (question.type === "QUIZ_MULTIPLE_TRUE_FALSE") {
        for (var option of config.options) {
            if (!option?.correctAnswer && !option?.inCorrectAnswer) {
                flag = true
                break;
            }
        }
    }
    if (question.type === "QUIZ_FILL_IN_BLANK") {
        if (config.parts.length === 0) {
            flag = true
        }
        if (!config.parts.find(x => x.type === 'blank')) flag = true
        for (var part of config.parts) {
            if (part.type === "blank" && (part.acceptedAnswers?.length === 0 || part.acceptedAnswers[0]?.length === 0)) {
                flag = true
            }
        }
    }
    if (question.type === "QUIZ_MATCHING") {
        if (config.correctPairs.length === 0) {
            flag = true
        }
    }
    return flag
}
vueData.isCheckAllGroupFullQuiz = isCheckAllGroupFullQuiz
vueData.isCheckGroupHasAnswerQuestionNotChoose = isCheckGroupHasAnswerQuestionNotChoose
vueData.isCheckAnswerQuestionNotChoose = isCheckAnswerQuestionNotChoose

function normalizeNumberInput(value) {
    if (value === null || value === undefined) return 0
    const normalized = String(value).replace(',', '.')
    const num = parseFloat(normalized)
    return isNaN(num) ? 0 : num
}
vueData.normalizeNumberInput = normalizeNumberInput

function isAutoGradable(type) {
    return type.startsWith('QUIZ_')
}
vueData.isAutoGradable = isAutoGradable

const _defaultMedia = () => ({
    type: 'YOUTUBE',
    sourceYT: { id: '', name: '', source: '' },
    sourceRecord: { id: '', name: '', source: '' },
    sourceFiles: { file: [], image: [] }
})

function buildNewQuestion(componentInfo, ordinalNumber) {
    const q = {
        id: `q_${Date.now()}`,
        type: componentInfo.type,
        label: componentInfo.label,
        skills: [],
        ordinalNumber,
        points: 1.0,
        gradingType: 'auto',
        config: {
            media: _defaultMedia(),
            isAdvanced: false,
            questionText: ''
        }
    }
    switch (componentInfo.type) {
        case 'QUIZ_SINGLE_CHOICE':
            q.config.options = [
                { id: 'opt_1', text: '' }, { id: 'opt_2', text: '' },
                { id: 'opt_3', text: '' }, { id: 'opt_4', text: '' }
            ]
            q.config.correctAnswer = null
            break
        case 'QUIZ_MULTIPLE_CHOICE':
            q.config.options = [
                { id: 'opt_1', text: '' }, { id: 'opt_2', text: '' },
                { id: 'opt_3', text: '' }, { id: 'opt_4', text: '' }
            ]
            q.config.correctAnswers = []
            break
        case 'QUIZ_TRUE_FALSE':
            q.config.statement = 'Mệnh đề cần xác định đúng/sai.'
            q.config.correctAnswer = true
            break
        case 'QUIZ_MULTIPLE_TRUE_FALSE':
            q.config.options = [{ id: 'a', text: '', correctAnswer: null, inCorrectAnswer: null }]
            break
        case 'QUIZ_FILL_IN_BLANK':
            q.config.parts = [
                { type: 'text', value: 'Điền vào ' },
                { type: 'blank', id: 'blank_1', acceptedAnswers: ['chỗ trống'] },
                { type: 'text', value: ' này.' }
            ]
            break
        case 'QUIZ_MATCHING':
            q.config.columnA = []
            q.config.columnB = []
            q.config.correctPairs = []
            break
        case 'ESSAY':
        case 'SHORT_ANSWER':
        case 'FILE_UPLOAD':
        case 'AUDIO_RESPONSE':
            q.gradingType = 'manual'
            break
    }
    return q
}
vueData.buildNewQuestion = buildNewQuestion