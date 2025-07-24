import React, { useState, useEffect } from 'react'
import styles from './QuizPage.module.scss'
import modalStyles from './QuizModal.module.scss'

const QuizPage = () => {
	const [selectedAnswer, setSelectedAnswer] = useState(null)
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
	const [questions, setQuestions] = useState([])
	const [answers, setAnswers] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [quizData, setQuizData] = useState(null)
	const [showResults, setShowResults] = useState(false)
	const [testResults, setTestResults] = useState(null)
	const [submitting, setSubmitting] = useState(false)

	// Получение токена из localStorage (или где у тебя хранится)
	const getToken = () => {
		return localStorage.getItem('authToken') // Адаптируй под свою систему авторизации
	}

	// Загрузка текущего теста
	useEffect(() => {
		fetchCurrentTest()
	}, [])

	const fetchCurrentTest = async () => {
		try {
			setLoading(true)
			const token = getToken()

			if (!token) {
				setError('Необходимо войти в систему')
				return
			}

			const response = await fetch('https://kiymeshek.uz/testa2/tests/current', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.message || 'Ошибка загрузки теста')
			}

			const data = await response.json()
			console.log(data)

			setQuizData(data)
			setQuestions(data.questions)
			setLoading(false)
		} catch (err) {
			setError(err.message)
			setLoading(false)
		}
	}

	const handleAnswerSelect = index => {
		setSelectedAnswer(index)
	}

	const handleNextQuestion = () => {
		if (selectedAnswer === null) return

		// Сохраняем ответ
		const newAnswer = {
			questionId: questions[currentQuestionIndex].id,
			answer: selectedAnswer,
		}

		const updatedAnswers = [...answers, newAnswer]
		setAnswers(updatedAnswers)

		// Переход к следующему вопросу или завершение теста
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1)
			setSelectedAnswer(null)
		} else {
			// Отправка результатов
			submitTest(updatedAnswers)
		}
	}

	const submitTest = async finalAnswers => {
		try {
			setSubmitting(true)
			const token = getToken()

			const response = await fetch('https://kiymeshek.uz/testa2/tests/submit', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					answers: finalAnswers,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.message || 'Ошибка отправки теста')
			}

			const results = await response.json()
			setTestResults(results)
			setShowResults(true)
			setSubmitting(false)
		} catch (err) {
			setError(err.message)
			setSubmitting(false)
		}
	}

	const closeModal = () => {
		setShowResults(false)
		// Можно добавить редирект или сброс состояния
		window.location.reload() // Или используй роутер для перехода
	}

	const retryTest = () => {
		// Сброс состояния для повторного прохождения
		setCurrentQuestionIndex(0)
		setSelectedAnswer(null)
		setAnswers([])
		setShowResults(false)
		setTestResults(null)
		fetchCurrentTest()
	}

	if (loading) {
		return (
			<div className={`${styles.container} middle`}>
				<div className={styles.loadingContainer}>
					<div className={styles.spinner}></div>
					<p>Testlar yuklanmoqta</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className={`${styles.container} middle`}>
				<div className={styles.errorContainer}>
					<h3>Ошибка</h3>
					<p>{error}</p>
					<button onClick={fetchCurrentTest} className={styles.retryButton}>
						Попробовать снова
					</button>
				</div>
			</div>
		)
	}

	if (!questions.length) {
		return (
			<div className={`${styles.container} middle`}>
				<div className={styles.noTestContainer}>
					<h3>Тест недоступен</h3>
					<p>В данный момент нет доступных тестов</p>
				</div>
			</div>
		)
	}

	const currentQuestion = questions[currentQuestionIndex]
	const isLastQuestion = currentQuestionIndex === questions.length - 1

	return (
		<div className={`${styles.container} middle`}>
			<div className={styles.quizContent}>
				<div className={styles.progressBar}>
					<div
						className={styles.progressFill}
						style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
					></div>
				</div>

				<div className={styles.quizCard}>
					<div className={styles.cardHeader}>
						<h2>{quizData?.level || 'Тест'}</h2>
						<span className={styles.subtitle}>{quizData?.message}</span>
					</div>

					<div className={styles.questionSection}>
						<h3 className={styles.questionTitle}>
							Savol {currentQuestionIndex + 1}/{questions.length}
						</h3>
						<p className={styles.questionText}>{currentQuestion.title}</p>
					</div>

					<div className={styles.optionsContainer}>
						{currentQuestion.variants?.map((option, index) => (
							<button
								key={index}
								className={`${styles.optionButton} ${
									selectedAnswer === index ? styles.selected : ''
								}`}
								onClick={() => handleAnswerSelect(index)}
							>
								<span className={styles.optionLetter}>{String.fromCharCode(65 + index)}</span>
								<span className={styles.optionText}>{option}</span>
							</button>
						))}
					</div>

					{selectedAnswer !== null && (
						<div className={styles.continueSection}>
							<button
								className={styles.continueButton}
								onClick={handleNextQuestion}
								disabled={submitting}
							>
								{submitting ? 'Отправка...' : isLastQuestion ? 'Завершить тест' : 'Davom etish'}
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Модальное окно с результатами */}
			{showResults && testResults && (
				<div className={modalStyles.modalOverlay}>
					<div className={modalStyles.modalContent}>
						<div className={modalStyles.modalHeader}>
							<h2>{testResults.passed ? '🎉 Поздравляем!' : '😔 Тест не пройден'}</h2>
						</div>

						<div className={modalStyles.resultsContainer}>
							<div className={modalStyles.scoreSection}>
								<div className={modalStyles.scoreItem}>
									<span className={modalStyles.label}>Правильных ответов:</span>
									<span className={modalStyles.value}>
										{testResults.score} из {testResults.totalQuestions}
									</span>
								</div>

								<div className={modalStyles.scoreItem}>
									<span className={modalStyles.label}>Набранные баллы:</span>
									<span className={modalStyles.value}>
										{testResults.score * 100} из {testResults.totalQuestions * 100}
									</span>
								</div>

								<div className={modalStyles.scoreItem}>
									<span className={modalStyles.label}>Процент:</span>
									<span className={modalStyles.value}>
										{Math.round((testResults.score / testResults.totalQuestions) * 100)}%
									</span>
								</div>
							</div>

							{testResults.passed && testResults.newLevel && (
								<div className={modalStyles.levelUpSection}>
									<h3>🚀 Новый уровень достигнут!</h3>
									<p className={modalStyles.newLevel}>{testResults.newLevel}</p>
								</div>
							)}

							<div className={modalStyles.nextTestSection}>
								<p>
									{testResults.canTakeNextTest
										? '✅ Вы можете пройти следующий тест!'
										: '⏳ Следующий тест будет доступен позже'}
								</p>
							</div>

							{/* Детальные результаты по вопросам */}
							<div className={modalStyles.detailsSection}>
								<h4>Детальные результаты:</h4>
								<div className={modalStyles.questionResults}>
									{testResults.results?.map((result, index) => (
										<div
											key={index}
											className={`${modalStyles.questionResult} ${
												result.correct ? modalStyles.correct : modalStyles.incorrect
											}`}
										>
											<span>Вопрос {index + 1}</span>
											<span>{result.correct ? '✅' : '❌'}</span>
										</div>
									))}
								</div>
							</div>
						</div>

						<div className={modalStyles.modalActions}>
							<button className={modalStyles.primaryButton} onClick={closeModal}>
								{testResults.canTakeNextTest ? 'К следующему тесту' : 'Закрыть'}
							</button>

							{!testResults.passed && (
								<button className={modalStyles.secondaryButton} onClick={retryTest}>
									Попробовать снова
								</button>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default QuizPage
