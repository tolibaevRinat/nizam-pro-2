import {
	User,
	Mail,
	Calendar,
	Award,
	TrendingUp,
	Check,
	Clock,
	Star,
	Trophy,
	Shield,
} from 'lucide-react'

import styles from './ProfilePage.module.scss'

const ProfilePage = ({ handleLogout }) => {
	// Получаем данные пользователя из localStorage
	const userData = JSON.parse(localStorage?.getItem?.('user') || '{}')
	const { firstName, lastName } = JSON.parse(localStorage?.getItem?.('tempUser') || '{}')

	// Функция для форматирования даты
	const formatDate = dateString => {
		if (!dateString) return "Noma'lum"
		const date = new Date(dateString)
		return date.toLocaleDateString('uz-UZ', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		})
	}

	// Получаем иконку для уровня
	const getLevelIcon = level => {
		switch (level) {
			case "Moshlang'ich":
				return <Shield className={styles.levelIcon} />
			case 'Mutaxassis':
				return <Star className={styles.levelIcon} />
			case 'Yetakchi mutaxassis':
				return <Award className={styles.levelIcon} />
			case 'Bosh mutaxassis':
				return <Trophy className={styles.levelIcon} />
			case "Bo'lim boshlig'i o'rinbosari":
				return <TrendingUp className={styles.levelIcon} />
			case "Bo'lim boshlig'i":
				return <Trophy className={styles.levelIcon} />
			default:
				return <User className={styles.levelIcon} />
		}
	}

	// Получаем цвет для уровня
	const getLevelColor = level => {
		switch (level) {
			case "Moshlang'ich":
				return '#10B981' // green
			case 'Mutaxassis':
				return '#3B82F6' // blue
			case 'Yetakchi mutaxassis':
				return '#8B5CF6' // purple
			case 'Bosh mutaxassis':
				return '#F59E0B' // amber
			case "Bo'lim boshlig'i o'rinbosari":
				return '#EF4444' // red
			case "Bo'lim boshlig'i":
				return '#DC2626' // dark red
			default:
				return '#6B7280' // gray
		}
	}

	return (
		<div className={`${styles.container} middle`}>
			<div className={styles.profileCard}>
				{/* Header секция */}
				<div className={styles.header}>
					<div className={styles.avatarContainer}>
						<div className={styles.avatar}>
							<User className={styles.avatarIcon} />
						</div>
						<div className={styles.onlineIndicator}></div>
					</div>
					<div className={styles.userInfo}>
						<h1 className={styles.fullName}>
							{firstName && lastName
								? `${firstName} ${lastName}`
								: userData.username || 'Foydalanuvchi'}
						</h1>
						<p className={styles.username}>@{userData.username}</p>
						<div
							className={styles.levelBadge}
							style={{ backgroundColor: getLevelColor(userData.level) }}
						>
							{getLevelIcon(userData.level)}
							<span>{userData.level || "Daraja noma'lum"}</span>
						</div>
					</div>
				</div>

				{/* Main Info секция */}
				<div className={styles.infoGrid}>
					<div className={styles.infoCard}>
						<div className={styles.infoIcon}>
							<Mail className={styles.icon} />
						</div>
						<div className={styles.infoContent}>
							<h3>Email</h3>
							<p>{userData.email || "Noma'lum"}</p>
						</div>
					</div>

					<div className={styles.infoCard}>
						<div className={styles.infoIcon}>
							<Calendar className={styles.icon} />
						</div>
						<div className={styles.infoContent}>
							<h3>Ro'yxatdan o'tgan sana</h3>
							<p>{formatDate(userData.createdAt)}</p>
						</div>
					</div>

					<div className={styles.infoCard}>
						<div className={styles.infoIcon}>
							<Award className={styles.icon} />
						</div>
						<div className={styles.infoContent}>
							<h3>Joriy daraja</h3>
							<p>{userData.testProgress?.currentLevel || userData.level}</p>
						</div>
					</div>

					<div className={styles.infoCard}>
						<div className={styles.infoIcon}>
							{userData.testProgress?.canTakeTest ? (
								<Clock className={styles.icon} />
							) : (
								<Check className={styles.icon} />
							)}
						</div>
						<div className={styles.infoContent}>
							<h3>Test holati</h3>
							<p>
								{userData.testProgress?.canTakeTest
									? 'Test topshirishga tayyor'
									: 'Test kutilmoqda'}
							</p>
						</div>
					</div>
				</div>

				{/* Test Progress секция */}
				<div className={styles.progressSection}>
					<h2 className={styles.sectionTitle}>Test Progressi</h2>

					<div className={styles.progressCard}>
						<div className={styles.progressHeader}>
							<h3>O'tilgan testlar</h3>
							<span className={styles.progressCount}>
								{userData.testProgress?.completedTests?.length || 0}
							</span>
						</div>

						{userData.testProgress?.completedTests?.length > 0 ? (
							<div className={styles.completedTests}>
								{userData.testProgress.completedTests.map((test, index) => (
									<div key={index} className={styles.testBadge}>
										<Check className={styles.testIcon} />
										<span>{test}</span>
									</div>
								))}
							</div>
						) : (
							<p className={styles.noTests}>Hali test topshirilmagan</p>
						)}
					</div>

					<div className={styles.progressCard}>
						<div className={styles.progressHeader}>
							<h3>Keyingi test</h3>
							<div className={styles.testStatus}>
								{userData.testProgress?.canTakeTest ? (
									<span className={styles.canTake}>Mavjud</span>
								) : (
									<span className={styles.cannotTake}>Kutilmoqda</span>
								)}
							</div>
						</div>
						<p className={styles.nextTestInfo}>
							{userData.testProgress?.canTakeTest
								? 'Siz keyingi daraja uchun test topshirishingiz mumkin'
								: 'Hozircha yangi test mavjud emas'}
						</p>
					</div>
				</div>

				{/* Stats секция */}
				<div className={styles.statsSection}>
					<h2 className={styles.sectionTitle}>Statistika</h2>
					<div className={styles.statsGrid}>
						<div className={styles.statCard}>
							<div className={styles.statIcon}>
								<Trophy className={styles.icon} />
							</div>
							<div className={styles.statInfo}>
								<h4>Joriy daraja</h4>
								<p>{userData.level}</p>
							</div>
						</div>

						<div className={styles.statCard}>
							<div className={styles.statIcon}>
								<Award className={styles.icon} />
							</div>
							<div className={styles.statInfo}>
								<h4>O'tilgan testlar</h4>
								<p>{userData.testProgress?.completedTests?.length || 0}</p>
							</div>
						</div>
					</div>
				</div>
				<button className={`${styles.logout}`} onClick={handleLogout}>
					Chiqish
				</button>
			</div>
		</div>
	)
}

export default ProfilePage
