import React, { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'

import Loader from '../../components/Loader'
import styles from './HomePage.module.scss'

const HomePage = () => {
	const [positions, setPositions] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	const userInfo = JSON.parse(localStorage.getItem('user'))
	const totalPoints = localStorage.getItem('userTotalPoints') && 0

	useEffect(() => {
		const fetchPositions = async () => {
			try {
				const response = await axios.get('https://kiymeshek.uz/testa2/levels')

				setPositions(response.data.levels)
			} catch (err) {
				setError('Ma’lumotlarni yuklashda xatolik yuz berdi.')
				console.error(err) // Xatolikni konsolga chiqarish
			} finally {
				setLoading(false)
			}
		}

		fetchPositions()
	}, [])

	if (loading) {
		return <Loader />
	}

	if (error) {
		return <Loader text={error} />
	}

	// Данные для уровнейx
	const levels = [
		{
			id: 1,
			title: 'Tuman daraja',
			subtitle: "Boshlang'ich daraja testlari",
			totalLevels: positions.length,
			totalPoints: 500 * positions.length,
			completedLevels: userInfo.testProgress.completedTests.length,
			isActive: true,
			isCompleted: false,
		},
		{
			id: 2,
			title: 'Xududiy daraja',
			subtitle: "Boshlang'ich daraja testlari",
			totalLevels: 20,
			totalPoints: 2500,
			completedLevels: 0,
			isActive: false,
			isCompleted: false,
		},
		{
			id: 3,
			title: 'Respublika daraja',
			subtitle: "Boshlang'ich daraja kjkjk",
			totalLevels: 25,
			totalPoints: 3500,
			completedLevels: 0,
			isActive: false,
			isCompleted: false,
		},
	]
	const calculateProgress = (completed, total) => {
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
								<Link to='/positions' className={styles.startButton}>
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

									<div className={styles.stat}>
										<span className={styles.statLabel}>Yig'ilgan ballar:</span>
										<span className={styles.statValue}>{totalPoints}</span>
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
