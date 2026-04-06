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