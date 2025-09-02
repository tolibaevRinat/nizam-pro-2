import React, { useState, useEffect, useRef } from 'react'
import { Lock, CheckCircle, Play } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import styles from './PositionsPage.module.scss'
import Loader from '../../components/Loader'

const PositionsPage = ({ url }) => {
	const [levels, setLevels] = useState([]) // Теперь это будет динамически устанавливаемый массив
	const [userProfile, setUserProfile] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	// Эти массивы будут хранить данные, полученные с сервера
	const [allHududiyLevels, setAllHududiyLevels] = useState([])
	const [allRespublikaLevels, setAllRespublikaLevels] = useState([])
	const [allTumanLevels, setAllTumanLevels] = useState([])

	const navigate = useNavigate()

	const [searchParams] = useSearchParams()
	const levelRoute = searchParams.get('route')

	const currentLevelRef = useRef(null)
	const hasScrolled = useRef(false)

	useEffect(() => {
		const fetchData = async () => {
			try {
				const token = localStorage.getItem('token')
				if (!token) {
					setError('Avtorizatsiya talab qilinadi')
					setLoading(false)
					return
				}

				const levelsResponse = await fetch(`${url}testa2/levels`)
				const levelsData = await levelsResponse.json()

				const profileResponse = await fetch(`${url}testa2/profile`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
				const profileData = await profileResponse.json()

				if (levelsResponse.ok && profileResponse.ok) {
					// Сохраняем все полученные уровни в отдельные состояния
					setAllTumanLevels(levelsData.tumanLevels)
					setAllHududiyLevels(levelsData.hududiyLevels)
					setAllRespublikaLevels(levelsData.respublikaLevels)
					setUserProfile(profileData.user)
				} else {
					setError("Ma'lumotlarni yuklashda xatolik")
				}
			} catch (err) {
				setError("Server bilan bog'lanishda xatolik")
				console.error(err) // Для отладки
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [url]) // Зависимость от 'url' если она может меняться

	// Новый useEffect для установки `levels` в зависимости от `levelRoute`
	useEffect(() => {
		if (!loading) {
			// Убедимся, что данные уже загружены
			switch (levelRoute) {
				case 'tumanLevels':
					setLevels(allTumanLevels)
					break
				case 'hududiyLevels':
					setLevels(allHududiyLevels)
					break
				case 'respublikaLevels':
					setLevels(allRespublikaLevels)
					break
				default:
					setLevels([]) // Если levelRoute не найден или пуст, устанавливаем пустой массив
					console.warn('Неизвестный levelRoute:', levelRoute) // Для отладки
					break
			}
		}
	}, [levelRoute, loading, allTumanLevels, allHududiyLevels, allRespublikaLevels]) // Добавил all-массивы в зависимости

	useEffect(() => {
		hasScrolled.current = false
	}, [levelRoute])

	// Этот useEffect выполняет сам скролл, когда данные готовы.
	useEffect(() => {
		// Выполняем скролл только если:
		// 1. Загрузка завершена.
		// 2. Ссылка на текущий уровень установлена.
		// 3. Мы еще не скроллили на этой странице.
		if (!loading && currentLevelRef.current && !hasScrolled.current) {
			// Даем небольшую задержку, чтобы DOM точно обновился
			setTimeout(() => {
				currentLevelRef.current.scrollIntoView({
					behavior: 'smooth', // Плавный скролл
					block: 'center', // Выровнять элемент по центру экрана
				})
				hasScrolled.current = true // Помечаем, что скролл выполнен
			}, 100) // 100 миллисекунд
		}
	}, [loading, levels, userProfile])

	// Daraja holatini aniqlash funksiyasi (обновленная логика)
	const getLevelStatus = (level, index) => {
		if (!userProfile || !userProfile.testProgress) {
			return index === 0 ? 'current' : 'locked'
		}

		// completedTests - это массив СТРОК, например: ['Mutaxassis']
		const { completedTests } = userProfile.testProgress

		// 1. Проверяем, есть ли текущий уровень (строка) в массиве пройденных.
		// БЫЛО: completedTests.some(test => test.level === level)
		// СТАЛО:
		if (completedTests.includes(level)) {
			return 'completed'
		}

		// 2. Находим индекс первого уровня, которого НЕТ в массиве пройденных.
		// БЫЛО: levels.findIndex(lvl => !completedTests.some(test => test.level === lvl))
		// СТАЛО:
		const firstUncompletedIndex = levels.findIndex(lvl => !completedTests.includes(lvl))

		// Если ни один не пройден, firstUncompletedIndex будет 0.
		// Если пройден первый, он будет 1, и так далее.
		// Если все пройдены, будет -1.
		if (firstUncompletedIndex === -1) {
			// Все уровни в этой категории пройдены, но `isCompleted` выше не сработал.
			// Этот случай маловероятен, но для надежности можно вернуть 'locked'.
			return 'locked'
		}

		if (index === firstUncompletedIndex) {
			return 'current'
		}

		return 'locked'
	}

	useEffect(() => {
		if (userProfile && levels.length > 0) {
			console.log('Current levels array:', levelRoute, levels)
			console.log('Completed tests:', userProfile.testProgress.completedTests)
			console.log(
				'Level statuses:',
				levels.map((level, index) => ({
					level,
					status: getLevelStatus(level, index),
				}))
			)
		}
	}, [levels, userProfile, levelRoute])

	// Daraja uchun tavsif olish
	const getLevelDescription = (level, status) => {
		const descriptions = {
			current: "Hozir shu darajani o'tish kerak",
			available: 'Keyingi daraja - topshirish mumkin',
			completed: "O'tilgan daraja",
			locked: "Oldingi darajalarni tugatib, bu darajaga o'ting",
		}
		return descriptions[status] || "Daraja haqida ma'lumot"
	}

	const handleClick = (level, status) => {
		if (status === 'current' || status === 'available' || status === 'completed') {
			localStorage.setItem('levels', level)
			navigate(`/quiz?route=${levelRoute}`)
		}
	}

	const renderLevelIcon = status => {
		switch (status) {
			case 'completed':
				return <CheckCircle className={styles.completedIcon} size={24} />
			case 'current':
			case 'available':
				return <Play className={styles.playIcon} size={20} />
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
			case 'available':
				return (
					<button
						onClick={() => handleClick(level, status)}
						className={`${styles.actionButton} ${styles.availableButton}`}
					>
						Boshlash
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
				{/* Здесь мы просто отображаем levels, и если он пуст, ничего не отображается,
				    пока loading = true, отображается Loader */}
				{levels.map((level, index) => {
					const status = getLevelStatus(level, index)
					return (
						<div
							ref={status === 'current' ? currentLevelRef : null}
							key={level}
							className={`${styles.positionCard} ${styles[status]}`}
						>
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
