import React from 'react'
import { Lock } from 'lucide-react'
import { Link } from 'react-router-dom'

import styles from './HomePage.module.scss'

const HomePage = () => {
	// Данные для уровнейx
	const levels = [
		{
			id: 1,
			title: 'Tuman daraja',
			subtitle: "Boshlang'ich daraja testlari",
			totalLevels: 15,
			totalPoints: 1500,
			completedLevels: 8,
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
										<span className={styles.statLabel}>Jami balllar:</span>
										<span className={styles.statValue}>{level.totalPoints}</span>
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
