import React from 'react'

import styles from './Loader.module.scss'

const Loader = ({ size = 'medium', text = '' }) => {
	return (
		<div className={styles.loaderContainer}>
			<div className={`${styles.loader} ${styles[size]}`}>
				<div className={styles.spinner}>
					<div className={styles.dot}></div>
					<div className={styles.dot}></div>
					<div className={styles.dot}></div>
				</div>
			</div>
			{text && <p className={styles.loaderText}>{text}</p>}
		</div>
	)
}

export default Loader
