import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

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
	const [totalPoints, setTotalPoints] = useState(0)

	// Новые состояния для таймера
	const [showTimer, setShowTimer] = useState(false)
	const [timeLeft, setTimeLeft] = useState(90) // 1 мин 30 сек = 90 секунд
	const timerRef = useRef(null)

	const navigate = useNavigate()

	// Константа для очков за правильный ответ
	const POINTS_PER_CORRECT_ANSWER = 50

	// Функции для работы с очками в localStorage
	const getTotalPointsFromStorage = () => {
		try {
			const points = localStorage.getItem('userTotalPoints')
			return points ? parseInt(points, 10) : 0
		} catch (error) {
			console.error('Ошибка при получении очков из localStorage:', error)
			return 0
		}
	}

	const saveTotalPointsToStorage = points => {
		try {
			localStorage.setItem('userTotalPoints', points.toString())
		} catch (error) {
			console.error('Ошибка при сохранении очков в localStorage:', error)
		}
	}

	const addPointsToTotal = newPoints => {
		const currentTotal = getTotalPointsFromStorage()
		const updatedTotal = currentTotal + newPoints
		saveTotalPointsToStorage(updatedTotal)
		setTotalPoints(updatedTotal)
		return updatedTotal
	}

	// Функции для работы с таймером
	const startTimer = () => {
		setTimeLeft(90) // Сбрасываем на 1 мин 30 сек
		setShowTimer(true)
		setError(null) // Скрываем ошибку
		setLoading(false) // Останавливаем загрузку

		timerRef.current = setInterval(() => {
			setTimeLeft(prevTime => {
				if (prevTime <= 1) {
					// Таймер закончился
					clearInterval(timerRef.current)
					setShowTimer(false)
					// Автоматически пытаемся загрузить тест
					fetchCurrentTest()
					return 0
				}
				return prevTime - 1
			})
		}, 1000)
	}

	const stopTimer = () => {
		if (timerRef.current) {
			clearInterval(timerRef.current)
			timerRef.current = null
		}
		setShowTimer(false)
	}

	// Форматирование времени для отображения
	const formatTime = seconds => {
		const minutes = Math.floor(seconds / 60)
		const remainingSeconds = seconds % 60
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
	}

	// Загрузка очков при инициализации компонента
	useEffect(() => {
		const points = getTotalPointsFromStorage()
		setTotalPoints(points)
	}, [])

	// Очистка таймера при размонтировании компонента
	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current)
			}
		}
	}, [])

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
			stopTimer() // Останавливаем таймер если он работает

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
				// Проверяем, если это ошибка 400 - запускаем таймер
				if (response.status === 400) {
					console.log('🕐 Получена ошибка 400, пользователь должен подождать')
					setError(
						"Siz oldingi testni yaqinda topshirgansiz. 1 daqiqa 30 soniya kutib, qaytadan urinib ko'ring."
					)
					setLoading(false)
					return
				}
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

			// Подсчитываем и добавляем очки за правильные ответы
			const correctAnswers = results.score || 0
			const earnedPoints = correctAnswers * POINTS_PER_CORRECT_ANSWER
			const newTotalPoints = addPointsToTotal(earnedPoints)

			// Добавляем информацию об очках к результатам
			const enhancedResults = {
				...results,
				earnedPoints,
				newTotalPoints,
				pointsPerAnswer: POINTS_PER_CORRECT_ANSWER,
			}

			setTestResults(enhancedResults)
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
		navigate('/positions')
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

	// Функция для принудительного закрытия таймера (если нужно)
	const closeTimer = () => {
		stopTimer()
		setError('Keyingi testni olish uchun kutish vaqti tugashini kuting')
		setLoading(false)
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
				{/* Отображение общего количества очков */}
				<div
					className={styles.pointsDisplay}
					style={{
						textAlign: 'center',
						marginBottom: '20px',
						padding: '10px',
						backgroundColor: '#f8f9fa',
						borderRadius: '8px',
						border: '2px solid #e9ecef',
					}}
				>
					<h3 style={{ margin: '0', color: '#495057' }}>
						💰 Jami ochkolar:{' '}
						<span style={{ color: '#28a745', fontWeight: 'bold' }}>{totalPoints}</span>
					</h3>
				</div>

				<div className={styles.progressBar}>
					<div
						className={styles.progressFill}
						style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
					></div>
				</div>

				<div className={styles.quizCard}>
					<div className={styles.cardHeader}>
						<h2>{quizData?.level || 'Test'}</h2>
						<span className={styles.subtitle}>{quizData?.message}</span>
					</div>

					<div className={styles.questionSection}>
						<h3 className={styles.questionTitle}>
							Savol {currentQuestionIndex + 1}/{questions.length}
						</h3>
						<p className={styles.questionText}>{currentQuestion.title}</p>
						<p
							style={{
								fontSize: '14px',
								color: '#6c757d',
								marginTop: '10px',
								fontStyle: 'italic',
							}}
						>
							💎 Har bir to'g'ri javob uchun {POINTS_PER_CORRECT_ANSWER} ochko olasiz
						</p>
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

			{/* Модальное окно с таймером */}
			{showTimer && (
				<div className={modalStyles.modalOverlay}>
					<div className={`${modalStyles.modalContent} ${modalStyles.timerModal}`}>
						<div className={modalStyles.modalHeader}>
							<h2>⏰ Keyingi test uchun kutish</h2>
						</div>

						<div className={modalStyles.timerContainer}>
							<div className={modalStyles.timerCircle}>
								<div className={modalStyles.timerDisplay}>
									<span className={modalStyles.timerTime}>{formatTime(timeLeft)}</span>
									<span className={modalStyles.timerLabel}>qoldi</span>
								</div>
								<svg className={modalStyles.timerRing} width='200' height='200'>
									<circle className={modalStyles.timerBackground} cx='100' cy='100' r='90' />
									<circle
										className={modalStyles.timerProgress}
										cx='100'
										cy='100'
										r='90'
										style={{
											strokeDashoffset: `${565.5 * (1 - (90 - timeLeft) / 90)}`,
										}}
									/>
								</svg>
							</div>

							<div className={modalStyles.timerMessage}>
								<p>
									Siz oldingi testni yaqinda topshirgansiz. Keyingi testni olish uchun
									<strong> 1 daqiqa 30 soniya</strong> kutishingiz kerak.
								</p>
								<p className={modalStyles.timerSubtext}>
									Kutish vaqti tugagach, yangi test avtomatik yuklanadi.
								</p>
							</div>
						</div>

						<div className={modalStyles.modalActions}>
							<button
								className={modalStyles.secondaryButton}
								onClick={closeTimer}
								style={{ opacity: 0.7, cursor: 'not-allowed' }}
								disabled
							>
								Yopish
							</button>
						</div>
					</div>
				</div>
			)}

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
										{testResults.totalQuestions} {' dan'} {testResults.score}
									</span>
								</div>

								<div className={modalStyles.scoreItem}>
									<span className={modalStyles.label}>Olingan ballar:</span>
									<span className={modalStyles.value}>
										{testResults.totalQuestions * POINTS_PER_CORRECT_ANSWER} dan{' '}
										{testResults.score * POINTS_PER_CORRECT_ANSWER}
									</span>
								</div>

								<div className={modalStyles.scoreItem}>
									<span className={modalStyles.label}>Foiz:</span>
									<span className={modalStyles.value}>
										{Math.round((testResults.score / testResults.totalQuestions) * 100)}%
									</span>
								</div>

								{/* Новая секция с информацией об очках */}
								<div
									className={modalStyles.scoreItem}
									style={{
										backgroundColor: '#d4edda',
										padding: '15px',
										borderRadius: '8px',
										marginTop: '15px',
									}}
								>
									<span className={modalStyles.label}>💰 Olingan ochkolar:</span>
									<span
										className={`${modalStyles.value}`}
										style={{ color: '#155724', fontWeight: 'bold' }}
									>
										💎 +{testResults.earnedPoints}
									</span>
								</div>

								<div
									className={modalStyles.scoreItem}
									style={{
										backgroundColor: '#cce7ff',
										padding: '15px',
										borderRadius: '8px',
										marginTop: '10px',
									}}
								>
									<span className={modalStyles.label}>🏆 Jami ochkolar:</span>
									<span
										className={modalStyles.value}
										style={{ color: '#004085', fontWeight: 'bold' }}
									>
										{testResults.newTotalPoints}
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
											{result.correct && (
												<span style={{ fontSize: '12px', color: '#28a745' }}>
													+{POINTS_PER_CORRECT_ANSWER}
												</span>
											)}
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
