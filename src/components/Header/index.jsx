import React from 'react'

import styles from './Header.module.scss'

function capitalizeFirstLetter(str, swap) {
	if (typeof str !== 'string' || str.length === 0) {
		return swap
	}
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

const Header = () => {
	const { firstName, lastName } = JSON.parse(localStorage.getItem('tempUser'))
	const totalPoints = localStorage.getItem('userTotalPoints')

	const name = capitalizeFirstLetter(firstName, 'Ism')
	const secondName = capitalizeFirstLetter(lastName, 'Familiya')
	const userData = JSON.parse(localStorage.getItem('user'))
	const userLevel = capitalizeFirstLetter(userData.level, 'Aniq emas')

	return (
		<div className={styles.header}>
			<div className={`${styles.container} container`}>
				<div className={styles.userInfo}>
					<div className={styles.avatar}>
						{name.charAt(0).toUpperCase()}
						{secondName.charAt(0).toUpperCase()}
					</div>
					<div className={styles.userDetails}>
						<div className={styles.name}>
							{name} {secondName}
						</div>
						<div className={styles.status}>{userLevel}</div>
					</div>
				</div>
				<div className={`${styles.points}`}>
					<img className={`${styles.jitterGlowStar}`} src='/star.svg' alt=' ' />
					{totalPoints}
				</div>
			</div>
		</div>
	)
}

export default Header
