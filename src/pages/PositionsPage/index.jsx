import React, { useState, useEffect } from 'react'
import { Lock, CheckCircle, Play } from 'lucide-react'

import styles from './PositionsPage.module.scss'
import { useNavigate } from 'react-router-dom'
import Loader from '../../components/Loader'

const PositionsPage = () => {
	const [levels, setLevels] = useState([])
	const [userProfile, setUserProfile] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	const navigate = useNavigate()

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Получаем токен из localStorage
				const token = localStorage.getItem('token')
				if (!token) {
					setError('Авторизация требуется')
					setLoading(false)
					return
				}

				// Получаем список уровней
				const levelsResponse = await fetch('https://kiymeshek.uz/testa2/levels')
				const levelsData = await levelsResponse.json()

				// Получаем профиль пользователя
				const profileResponse = await fetch('https://kiymeshek.uz/testa2/profile', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
				const profileData = await profileResponse.json()

				if (levelsResponse.ok && profileResponse.ok) {
					setLevels(levelsData.levels)
					setUserProfile(profileData.user)
					localStorage.setItem('levels', JSON.stringify(levelsData.levels))
				} else {
					setError("Ma'lumotlarni yuklashda xatolik")
				}
			} catch (err) {
				setError("Server bilan bog'lanishda xatolik")
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [])

	// Функция для определения статуса уровня
	const getLevelStatus = (level, index) => {
		if (!userProfile || !userProfile.testProgress) {
			return 'locked'
		}

		const { currentLevel, completedTests, canTakeTest } = userProfile.testProgress
		const currentLevelIndex = levels.indexOf(currentLevel)

		// Если это текущий уровень пользователя - он должен быть доступен для прохождения
		if (level === currentLevel) {
			return canTakeTest ? 'current' : 'waiting'
		}

		// Если уровень был пройден (находится в completedTests)
		if (completedTests.some(test => test.level === level)) {
			return 'completed'
		}

		// Если это уровень ниже текущего - он должен быть пройден
		if (index < currentLevelIndex) {
			return 'completed'
		}

		// Все уровни выше текущего заблокированы
		if (index > currentLevelIndex) {
			return 'locked'
		}

		// Все остальные случаи - заблокированы
		return 'locked'
	}

	// Получение описания для уровня
	const getLevelDescription = (level, status) => {
		const descriptions = {
			current: "Bu darajani o'tish kerak",
			completed: "O'tilgan daraja",
			waiting: 'Kutish vaqti tugamagan',
			locked: "Oldingi darajalarni o'ting",
		}
		return descriptions[status] || "Daraja haqida ma'lumot"
	}

	const handleClick = (level, status) => {
		if (status === 'current') {
			// Сохраняем выбранный уровень и переходим к тесту
			localStorage.setItem('selectedLevel', level)
			navigate('/quiz')
		}
		// Для completed уровней можно добавить повторное прохождение при необходимости
		else if (status === 'completed') {
			// Можно добавить подтверждение для повторного прохождения
			if (window.confirm('Вы хотите пройти этот тест повторно?')) {
				localStorage.setItem('selectedLevel', level)
				navigate('/quiz')
			}
		}
	}

	const renderLevelIcon = status => {
		switch (status) {
			case 'completed':
				return <CheckCircle className={styles.completedIcon} size={24} />
			case 'current':
			case 'available':
				return <Play className={styles.playIcon} size={20} />
			case 'waiting':
				return <Lock className={styles.waitingIcon} size={20} />
			case 'locked':
			default:
				return <Lock className={styles.lockIcon} size={20} />
		}
	}

	const renderActionButton = (level, status) => {
		switch (status) {
			case 'current':
				return (
					<button
						onClick={() => handleClick(level, status)}
						className={`${styles.actionButton} ${styles.currentButton}`}
					>
						Test topshirish
					</button>
				)
			case 'completed':
				return (
					<button
						onClick={() => handleClick(level, status)}
						className={`${styles.actionButton} ${styles.retakeButton}`}
					>
						Qayta topshirish
					</button>
				)
			case 'waiting':
				return <span className={styles.waitingText}>Kutish vaqti</span>
			case 'locked':
			default:
				return renderLevelIcon(status)
		}
	}

	if (loading) {
		return <Loader />
	}

	if (error) {
		return (
			<div className={`${styles.positionsContainer} middle`}>
				<div className={`${styles.content} container`}>
					<div className={styles.errorMessage}>
						<p>Xatolik: {error}</p>
						<button onClick={() => window.location.reload()} className={styles.retryButton}>
							Qayta urinish
						</button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className={`${styles.positionsContainer} middle`}>
			<div className={`${styles.content} container`}>
				{levels.map((level, index) => {
					const status = getLevelStatus(level, index)
					return (
						<div key={level} className={`${styles.positionCard} ${styles[status]}`}>
							<div className={styles.cardContent}>
								<div className={styles.levelHeader}>
									<h3>{level}</h3>
									{status === 'completed' && renderLevelIcon(status)}
								</div>
								<p>{getLevelDescription(level, status)}</p>
							</div>

							<div className={styles.cardAction}>{renderActionButton(level, status)}</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default PositionsPage
