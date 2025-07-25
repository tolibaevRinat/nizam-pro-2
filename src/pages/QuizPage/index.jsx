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
	const [debugMode, setDebugMode] = useState(false)

	// Тестовые данные для отладки
	const mockTestData = {
		message: 'Test daraja uchun sinov',
		level: 'Test daraja',
		questions: [
			{
				title: 'React dasturlash tilida state nima?',
				variants: [
					"Komponentning o'zgaruvchan ma'lumotlari",
					"Komponentning doimiy ma'lumotlari",
					"Komponentning stil ma'lumotlari",
					"Komponentning import ma'lumotlari",
				],
				id: 0,
			},
			{
				title: 'useState hook nima uchun ishlatiladi?',
				variants: [
					"Ma'lumotlarni saqlash uchun",
					'Komponentning holatini boshqarish uchun',
					"API ga so'rov yuborish uchun",
					"Stillarni o'zgartirish uchun",
				],
				id: 1,
			},
		],
		totalQuestions: 2,
		passingScore: 1,
	}

	// Функция для загрузки тестовых данных
	const loadMockData = () => {
		setQuizData(mockTestData)
		setQuestions(mockTestData.questions)
		setLoading(false)
		setError(null)
		setDebugMode(true)
	}

	// Получение токена из localStorage (адаптируй под свою систему авторизации)
	const getToken = () => {
		// Проверяем разные возможные места хранения токена
		const token =
			localStorage.getItem('authToken') ||
			localStorage.getItem('token') ||
			localStorage.getItem('accessToken') ||
			sessionStorage.getItem('authToken')

		return token
	}

	// Загрузка текущего теста
	useEffect(() => {
		fetchCurrentTest()
	}, [])

	const fetchCurrentTest = async () => {
		try {
			setLoading(true)
			setError(null)

			const token = getToken()

			if (!token) {
				setError('Tizimga kirishingiz kerak. Avtorizatsiya tokeni topilmadi.')
				setLoading(false)
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
				let errorMessage = `Ошибка сервера: ${response.status}`

				try {
					const errorData = await response.json()
					errorMessage = errorData.message || errorMessage
				} catch (e) {}

				throw new Error(errorMessage)
			}

			const data = await response.json()

			if (!data.questions || !Array.isArray(data.questions)) {
				throw new Error('Получены некорректные данные теста')
			}

			if (data.questions.length === 0) {
				setError('Нет доступных вопросов для теста')
				setLoading(false)
				return
			}

			setQuizData(data)
			setQuestions(data.questions)
			setLoading(false)
		} catch (err) {
			console.error('💥 Ошибка при загрузке теста:', err)
			setError(`Ошибка загрузки: ${err.message}`)
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
		// Перенаправляем на страницу /positions
		window.location.href = '/positions'
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
					<p>Загрузка теста...</p>
				</div>
			</div>
		)
	}

	// Тестовая функция для проверки API без токена
	const testApiConnection = async () => {
		try {
			const response = await fetch('https://kiymeshek.uz/testa2/levels')

			if (response.ok) {
				const data = await response.json()
				alert('API доступен! Проблема скорее всего в токене авторизации.')
			} else {
				alert('API недоступен. Проверьте подключение к интернету.')
			}
		} catch (error) {
			console.error('💥 Ошибка подключения к API:', error)
			alert(`Ошибка подключения: ${error.message}`)
		}
	}

	if (error) {
		return (
			<div className={`${styles.container} middle`}>
				<div className={styles.errorContainer}>
					<h3>Xatolik yuz berdi</h3>
					<p>{error}</p>
					<div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
						<button onClick={fetchCurrentTest} className={styles.retryButton}>
							Qayta urinish
						</button>
						<button onClick={loadMockData} className={styles.retryButton}>
							Test rejimi
						</button>
					</div>
				</div>
			</div>
		)
	}

	if (!questions.length) {
		return (
			<div className={`${styles.container} middle`}>
				<div className={styles.noTestContainer}>
					<h3>Test mavjud emas</h3>
					<p>Hozirda mavjud testlar yo'q yoki siz eng yuqori darajaga erishdingiz</p>
					<button onClick={fetchCurrentTest} className={styles.retryButton}>
						Qayta yuklash
					</button>
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
						<h2>
							{quizData?.level || 'Test'}
							{debugMode && (
								<span style={{ color: '#ff6b6b', fontSize: '14px' }}> (Test rejimi)</span>
							)}
						</h2>
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
								{submitting ? 'Yuborish...' : isLastQuestion ? 'Sinovni yakunlang' : 'Davom etish'}
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
							<h2>{testResults.passed ? '🎉 Tabriklaymiz!' : '😔 Sinov muvaffaqiyatsiz tugadi'}</h2>
						</div>

						<div className={modalStyles.resultsContainer}>
							<div className={modalStyles.scoreSection}>
								<div className={modalStyles.scoreItem}>
									<span className={modalStyles.label}>To'g'ri javoblar:</span>
									<span className={modalStyles.value}>
										{testResults.score} из {testResults.totalQuestions}
									</span>
								</div>

								<div className={modalStyles.scoreItem}>
									<span className={modalStyles.label}>Olingan ballar:</span>
									<span className={modalStyles.value}>
										{testResults.score * 100} из {testResults.totalQuestions * 100}
									</span>
								</div>

								<div className={modalStyles.scoreItem}>
									<span className={modalStyles.label}>Foiz:</span>
									<span className={modalStyles.value}>
										{Math.round((testResults.score / testResults.totalQuestions) * 100)}%
									</span>
								</div>
							</div>

							{testResults.passed && testResults.newLevel && (
								<div className={modalStyles.levelUpSection}>
									<h3>🚀 Yangi lavozim ochildi!</h3>
									<p className={modalStyles.newLevel}>{testResults.newLevel}</p>
								</div>
							)}

							<div className={modalStyles.nextTestSection}>
								<p>
									{testResults.canTakeNextTest
										? '✅ Siz keyingi testni topshirishingiz mumkin!'
										: '⏳ Keyingi test keyinroq taqdim etiladi.'}
								</p>
							</div>

							{/* Детальные результаты по вопросам */}
							<div className={modalStyles.detailsSection}>
								<h4>Batafsil natijalar:</h4>
								<div className={modalStyles.questionResults}>
									{testResults.results?.map((result, index) => (
										<div
											key={index}
											className={`${modalStyles.questionResult} ${
												result.correct ? modalStyles.correct : modalStyles.incorrect
											}`}
										>
											<span>Savol {index + 1}</span>
											<span>{result.correct ? '✅' : '❌'}</span>
										</div>
									))}
								</div>
							</div>
						</div>

						<div className={modalStyles.modalActions}>
							<button className={modalStyles.primaryButton} onClick={closeModal}>
								{testResults.canTakeNextTest ? 'Keyingi test' : 'Yopish'}
							</button>

							{!testResults.passed && (
								<button className={modalStyles.secondaryButton} onClick={retryTest}>
									Yana urinib korish
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
