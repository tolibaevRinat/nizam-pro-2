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
				// localStorage dan tokenni olish
				const token = localStorage.getItem('token')
				if (!token) {
					setError('Avtorizatsiya talab qilinadi')
					setLoading(false)
					return
				}

				// Darajalar ro'yxatini olish
				const levelsResponse = await fetch('https://kiymeshek.uz/testa2/levels')
				const levelsData = await levelsResponse.json()

				// Foydalanuvchi profilini olish
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

	// Daraja holatini aniqlash funksiyasi (kutishsiz)
	const getLevelStatus = (level, index) => {
		if (!userProfile || !userProfile.testProgress) {
			return 'locked'
		}

		const { currentLevel, completedTests } = userProfile.testProgress
		const currentLevelIndex = levels.findIndex(l => l === currentLevel)

		// Agar bu joriy daraja bo'lsa - uni topshirish mumkin
		if (level === currentLevel) {
			return 'current'
		}

		// Agar daraja o'tilgan bo'lsa (completedTests da bor)
		if (completedTests && completedTests.some(test => test.level === level)) {
			return 'completed'
		}

		// Agar bu joriy darajadan past bo'lsa - u o'tilgan bo'lishi kerak
		if (index < currentLevelIndex) {
			return 'completed'
		}

		// Agar bu keyingi daraja bo'lsa (joriy darajadan bir daraja yuqori)
		if (index === currentLevelIndex + 1) {
			return 'available'
		}

		// Qolgan barcha darajalar bloklangan
		return 'locked'
	}

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
		if (status === 'current' || status === 'available') {
			// Tanlangan darajani saqlash va testga o'tish
			localStorage.setItem('selectedLevel', level)
			navigate('/quiz')
		}
		// O'tilgan darajalarni qayta topshirish imkoniyati
		else if (status === 'completed') {
			localStorage.setItem('selectedLevel', level)
			navigate('/quiz')
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
