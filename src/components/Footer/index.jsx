import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, User, Store } from 'lucide-react'

import styles from './Footer.module.scss'

const Footer = () => {
	const [isActive, setIsActive] = useState(0)
	const location = useLocation()

	return (
		<footer className={styles.bottomNav}>
			<div className={`${styles.container} container`}>
				<Link
					to='/'
					onClick={() => setIsActive(0)}
					className={`${styles.navItem} ${
						isActive === 0 && location.pathname === '/' ? styles.active : ''
					}`}
				>
					<Home size={24} />
					<span>Bosh sahifa</span>
				</Link>
				<Link
					onClick={() => setIsActive(1)}
					to='/profile'
					className={`${styles.navItem} ${
						isActive === 1 && location.pathname === '/profile' ? styles.active : ''
					}`}
				>
					<User size={24} />
					<span>Profil</span>
				</Link>
				<Link
					onClick={() => setIsActive(2)}
					to='/store'
					className={`${styles.navItem} ${
						isActive === 2 && location.pathname === '/store' ? styles.active : ''
					}`}
				>
					<Store size={24} />
					<span>Dukon</span>
				</Link>
			</div>
		</footer>
	)
}

export default Footer
