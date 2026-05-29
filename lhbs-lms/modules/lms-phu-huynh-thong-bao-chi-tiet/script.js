
async function API_Service(url, params, type = 'CDT') {
    if (type == 'CDT') {
        let res = await new Promise((resolve, reject) => {
            ajaxCALL('lms/' + url, params, (response) => {
                resolve(true)
            }, (err) => {
                resolve(false)
            })
        })
        return res
    } else {
        let res = await new Promise((resolve, reject) => {
            ajaxCALL('lms/' + url, params, (response) => {
                resolve(response.data)
            }, (err) => {
                resolve(false)
            })
        })
        return res
    }
}
function handleMapingAnswer_For_Graded(asmConfig, asmConfigNoAnswer) {
    const groups_asmConfig = asmConfig.groups;
    const flatGroups_asmConfig = groups_asmConfig.map(g => g.questions).flat();
    // ✅ clone sâu toàn bộ groups để không làm thay đổi bản gốc
    const groups_asmConfigNoAnswer = _.cloneDeep(asmConfigNoAnswer.groups);
    const flatGroups_asmConfigNoAnswer = groups_asmConfigNoAnswer.map(g => g.questions).flat();
    const AnsweredQuestions = [];
    flatGroups_asmConfig.forEach(questionWithAnswer => {
        const questionNoAnswer = flatGroups_asmConfigNoAnswer.find(q => q.id === questionWithAnswer.id);
        if (!questionNoAnswer) return;
        switch (questionWithAnswer.type) {
            case 'QUIZ_SINGLE_CHOICE':
                questionNoAnswer.config.correctAnswer = _.cloneDeep(questionWithAnswer.config.correctAnswer);
                break;
            case 'QUIZ_MULTIPLE_CHOICE':
                questionNoAnswer.config.correctAnswers = _.cloneDeep(questionWithAnswer.config.correctAnswers);
                break;
            case 'QUIZ_TRUE_FALSE':
                questionNoAnswer.config.correctAnswer = _.cloneDeep(questionWithAnswer.config.correctAnswer);
                break;
            case 'QUIZ_MULTIPLE_TRUE_FALSE':
                questionNoAnswer.config.options = _.cloneDeep(questionWithAnswer.config.options);
                break;
            case 'QUIZ_FILL_IN_BLANK':
                questionNoAnswer.config.parts = _.cloneDeep(questionWithAnswer.config.parts);
                break;
            case 'QUIZ_MATCHING':
                questionNoAnswer.config.columnA = _.cloneDeep(questionWithAnswer.config.columnA);
                questionNoAnswer.config.columnB = _.cloneDeep(questionWithAnswer.config.columnB);
                questionNoAnswer.config.correctPairs = _.cloneDeep(questionWithAnswer.config.correctPairs);
                break;
        }
        AnsweredQuestions.push(questionNoAnswer);
    });
    // ✅ đảm bảo giữ nguyên question chưa có đáp án
    groups_asmConfigNoAnswer.forEach(group => {
        group.questions = group.questions.map(question => {
            const answered = AnsweredQuestions.find(q => q && q.id === question.id);
            return answered ? answered : question;
        });
    });
    console.log('groups_asmConfig', groups_asmConfig);
    console.log('groups_asmConfigNoAnswer_After', groups_asmConfigNoAnswer);
    return groups_asmConfigNoAnswer
}
function fn_ChamBaiStudent(hocSinh, AsmConfig) {
    if (!hocSinh.SubmissionContent) return { SubmissionContent: null, Score: null }
    const SubmissionContent = JSON.parse(hocSinh.SubmissionContent)
    let answers = SubmissionContent?.answers ?? {}
    let Score = 0
    for (var group of AsmConfig.groups) {
        for (var question of group.questions) {
            let manualScore = 0
            const answerData = answers[question.id]?.answerData
            //Nếu học sinh k trả lời bài thì return => ko cần tính cộng điểm
            if (!answerData) continue
            if (question.type === "QUIZ_SINGLE_CHOICE") {
                if (question.config.correctAnswer == answerData) {
                    Score += question.points
                    manualScore = question.points
                }
            }
            else if (question.type === "QUIZ_MULTIPLE_CHOICE") {
                const arr1 = question.config.correctAnswers
                const arr2 = answerData
                const isSame = arr1.length === arr2.length && arr1.every(item => arr2.includes(item));
                if (isSame) {
                    Score += question.points
                    manualScore = question.points
                }
            }
            else if (question.type === "QUIZ_TRUE_FALSE") {
                if (question.config.correctAnswer == answerData) {
                    Score += question.points
                    manualScore = question.points
                }
            }
            else if (question.type === "QUIZ_MULTIPLE_TRUE_FALSE") {
                let flag = false
                for (var option of question.config.options) {
                    if (option.correctAnswer === answerData[option.id]) {
                    }
                }
                if (flag) {
                    Score += question.points
                    manualScore = question.points
                }
            }
            else if (question.type === "QUIZ_MATCHING") {
                let numberOfCorrect = 0
                const correctPairs = question.config.correctPairs
                correctPairs.forEach(q => {
                    let findAnswer = answerData.find(a => a.from == q.from)
                    if (findAnswer) {
                        if (findAnswer.to == q.to) {
                            numberOfCorrect += 1
                        }
                    }
                })
                const pts = Number(question?.points ?? 0)
                manualScore = (numberOfCorrect / correctPairs.length) * pts
                Score += manualScore
            }
            else if (question.type === "QUIZ_FILL_IN_BLANK") {
                const parts = question.config.parts || []
                const blanks = parts.filter(p => p.type === 'blank')
                if (blanks.length === 0) {
                    manualScore = question.points
                } else {
                    let correctsAnswer = 0
                    blanks.forEach(x => {
                        const answerToLowerCase = answerData[x.id].toLowerCase().replace(/\s+/g, '').trim() ?? ''
                        if (x.acceptedAnswers.map(item => item.toLowerCase().replace(/\s+/g, '').trim()).includes(answerToLowerCase)) {
                            correctsAnswer += 1
                        }
                    })
                    const pts = Number(question?.points ?? 0)
                    manualScore = (correctsAnswer / blanks.length) * pts
                    Score += manualScore
                }
            }
            answers = {
                ...answers,
                [question.id]: {
                    ...answers[question.id],
                    grading: {
                        ...answers[question.id].grading,
                        manualScore: manualScore
                    }
                }
            }
        }
    }
    let dataSubmissionContentReturn = {
        answers: answers,
    }
    return {
        SubmissionContent: JSON.stringify(dataSubmissionContentReturn),
        Score
    }
}