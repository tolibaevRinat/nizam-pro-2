import React, { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'

import Loader from '../../components/Loader'
import styles from './HomePage.module.scss'

const HomePage = ({ url }) => {
	const [hududiyLevels, setHududiyLevels] = useState([])
	const [respublikaLevels, setRespublikaLevels] = useState([])
	const [tumanLevels, setTumanLevels] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	// ВАЖНО: Получаем данные пользователя из localStorage. Убедитесь, что они свежие!
	// Мы решим это в QuizPage.
	const userInfo = JSON.parse(localStorage.getItem('user'))
	// Если userInfo или testProgress отсутствуют, используем пустой массив, чтобы избежать ошибок
	const userCompleteTests = userInfo?.testProgress?.completedTests || []

	useEffect(() => {
		const fetchPositions = async () => {
			try {
				const response = await axios.get(`${url}testa2/levels`)
				setHududiyLevels(response.data.hududiyLevels)
				setRespublikaLevels(response.data.respublikaLevels)
				setTumanLevels(response.data.tumanLevels)
			} catch (err) {
				setError('Ma’lumotlarni yuklashda xatolik yuz berdi.')
				console.error(err)
			} finally {
				setLoading(false)
			}
		}
		fetchPositions()
	}, [url]) // url добавлен в зависимости

	if (loading) {
		return <Loader />
	}

	if (error) {
		return <Loader text={error} />
	}

	// --- НОВАЯ ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ---
	// Считает, сколько уровней из категории (categoryLevels) пройдено пользователем (completedTests)
	const countCompletedInCategory = (categoryLevels, completedTests) => {
		// Фильтруем уровни категории, оставляя только те, что есть в массиве пройденных.
		// Это найдет пересечение двух массивов строк.
		// БЫЛО: completedTests.filter(test => categoryLevels.includes(test.level)).length
		// СТАЛО:
		return categoryLevels.filter(levelName => completedTests.includes(levelName)).length
	}

	// --- ПОЛНОСТЬЮ ПЕРЕРАБОТАННАЯ ЛОГИКА ДАННЫХ ---
	const tumanCompletedCount = countCompletedInCategory(tumanLevels, userCompleteTests)
	const hududiyCompletedCount = countCompletedInCategory(hududiyLevels, userCompleteTests)
	const respublikaCompletedCount = countCompletedInCategory(respublikaLevels, userCompleteTests)

	const levels = [
		{
			id: 1,
			title: 'Tuman daraja',
			subtitle: "Boshlang'ich daraja testlari",
			totalLevels: tumanLevels.length,
			completedLevels: tumanCompletedCount,
			// Всегда активен, так как это первый уровень
			isActive: true,
			isCompleted: tumanCompletedCount === tumanLevels.length,
			route: 'tumanLevels',
		},
		{
			id: 2,
			title: 'Xududiy daraja',
			subtitle: "O'rta daraja testlari",
			totalLevels: hududiyLevels.length,
			completedLevels: hududiyCompletedCount,
			// Активен, если предыдущий уровень (Tuman) полностью пройден
			isActive: tumanCompletedCount === tumanLevels.length,
			isCompleted: hududiyCompletedCount === hududiyLevels.length,
			route: 'hududiyLevels',
		},
		{
			id: 3,
			title: 'Respublika daraja',
			subtitle: 'Yuqori daraja testlari',
			totalLevels: respublikaLevels.length,
			completedLevels: respublikaCompletedCount,
			// Активен, если оба предыдущих уровня (Tuman и Xududiy) пройдены
			isActive:
				tumanCompletedCount === tumanLevels.length &&
				hududiyCompletedCount === hududiyLevels.length,
			isCompleted: respublikaCompletedCount === respublikaLevels.length,
			route: 'respublikaLevels',
		},
	]

	const calculateProgress = (completed, total) => {
		if (total === 0) return 0 // Избегаем деления на ноль
		return (completed / total) * 100
	}

	const getRemainingLevels = (completed, total) => {
		return total - completed
	}

	return (
		<section className={`${styles.homepage} middle`}>
			<div className={styles.container}>
				{levels.map(level => (
					<div
						key={level.id}
						className={`${styles.levelCard} ${level.isActive ? styles.active : styles.locked}`}
					>
						<div className={styles.cardHeader}>
							<div className={styles.titleSection}>
								<h3 className={styles.title}>{level.title}</h3>
								{level.isActive && <p className={styles.subtitle}>{level.subtitle}</p>}
							</div>

							{level.isActive ? (
								<Link to={`/positions?route=${level.route}`} className={styles.startButton}>
									Boshlash
								</Link>
							) : (
								<div className={styles.lockIcon}>
									<Lock size={20} />
								</div>
							)}
						</div>

						{level.isActive && (
							<div className={styles.cardContent}>
								<div className={styles.statsRow}>
									<div className={styles.stat}>
										<span className={styles.statLabel}>Jami darajalar:</span>
										<span className={styles.statValue}>{level.totalLevels}</span>
									</div>
								</div>

								<div className={styles.progressSection}>
									<div className={styles.progressInfo}>
										<span className={styles.progressText}>
											Bajarilgan: {level.completedLevels}/{level.totalLevels}
										</span>
										<span className={styles.remainingText}>
											Qolgan: {getRemainingLevels(level.completedLevels, level.totalLevels)}
										</span>
									</div>

									<div className={styles.progressBar}>
										<div
											className={styles.progressFill}
											style={{
												width: `${calculateProgress(level.completedLevels, level.totalLevels)}%`,
											}}
										></div>
									</div>

									<div className={styles.progressPercent}>
										{Math.round(calculateProgress(level.completedLevels, level.totalLevels))}%
									</div>
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		</section>
	)
}

export default HomePage
