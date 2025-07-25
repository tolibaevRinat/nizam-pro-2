import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import styles from './IntroPages.module.scss'

const IntroPages = ({ onComplete }) => {
	const [currentPage, setCurrentPage] = useState(1)
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		setIsVisible(true)
	}, [])

	const handleNext = () => {
		setIsVisible(false)
		setTimeout(() => {
			setCurrentPage(2)
			setIsVisible(true)
		}, 500)
	}

	const handleComplete = () => {
		setIsVisible(false)
		setTimeout(() => {
			onComplete()
		}, 500)
	}

	if (currentPage === 1) {
		return <WelcomePage isVisible={isVisible} onNext={handleNext} />
	}

	return <DetailPage isVisible={isVisible} onComplete={handleComplete} />
}

const WelcomePage = ({ isVisible, onNext }) => {
	const [textVisible, setTextVisible] = useState({})

	useEffect(() => {
		if (isVisible) {
			const delays = [0, 800, 1600, 2400, 3200]
			delays.forEach((delay, index) => {
				setTimeout(() => {
					setTextVisible(prev => ({ ...prev, [index]: true }))
				}, delay)
			})
		}
	}, [isVisible])

	return (
		<div className={`${styles.welcomePage} ${isVisible ? styles.visible : ''}`}>
			{/* Floating Background Elements */}
			<div className={styles.backgroundElements}>
				<div className={styles.el1}></div>
				<div className={styles.el2}></div>
				<div className={styles.el3}></div>
				<div className={styles.el4}></div>
			</div>

			<div className={styles.contentWrapper}>
				{/* Logo/Icon */}
				<div className={`${styles.logoContainer} ${textVisible[0] ? styles.visible : ''}`}>
					<div className={styles.logo}>
						<svg className={styles.icon} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
							/>
						</svg>
					</div>
				</div>

				{/* Title */}
				<div className={`${styles.title} ${textVisible[1] ? styles.visible : ''}`}>
					<h1>KARERA MODULI</h1>
					<div className={styles.divider}></div>
				</div>

				{/* Description */}
				<div className={`${styles.description} ${textVisible[2] ? styles.visible : ''}`}>
					<p>Karyerangizni yangi bosqichga olib chiqish uchun maxsus ishlab chiqilgan platforma</p>
				</div>

				{/* Features */}
				<div className={`${styles.features} ${textVisible[3] ? styles.visible : ''}`}>
					<div className={styles.featureItem}>
						<div className={`${styles.dot} ${styles.blue}`}></div>
						<span>Professional rivojlanish</span>
					</div>
					<div className={styles.featureItem}>
						<div className={`${styles.dot} ${styles.indigo}`}></div>
						<span>Interaktiv testlar</span>
					</div>
					<div className={styles.featureItem}>
						<div className={`${styles.dot} ${styles.purple}`}></div>
						<span>Karyera reja</span>
					</div>
				</div>

				{/* Button */}
				<div className={`${styles.buttonContainer} ${textVisible[4] ? styles.visible : ''}`}>
					<button onClick={onNext} className={styles.welcomeButton}>
						<span className={styles.content}>Boshlash</span>
						<div className={styles.hoverEffect}></div>
						<div className={styles.arrow}>
							<svg className={styles.icon} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M13 7l5 5m0 0l-5 5m5-5H6'
								/>
							</svg>
						</div>
					</button>
				</div>
			</div>
		</div>
	)
}

const DetailPage = ({ isVisible, onComplete }) => {
	const [textVisible, setTextVisible] = useState({})

	useEffect(() => {
		if (isVisible) {
			const delays = [0, 600, 1200, 1800, 2400, 3000, 3600, 4200]
			delays.forEach((delay, index) => {
				setTimeout(() => {
					setTextVisible(prev => ({ ...prev, [index]: true }))
				}, delay)
			})
		}
	}, [isVisible])

	// Helper function to create class names for cards
	const getCardClassName = (base, isVisible, modifier) => {
		const classList = [styles[base], styles[modifier]]
		if (isVisible) {
			classList.push(styles.visible)
		}
		return classList.join(' ')
	}

	return (
		<div className={`${styles.detailPage} ${isVisible ? styles.visible : ''}`}>
			{/* Animated Background */}
			<div className={styles.backgroundElements}>
				<div className={styles.el1}></div>
				<div className={styles.el2}></div>
				<div className={styles.el3}></div>
			</div>

			<div className={styles.contentWrapper}>
				{/* Header */}
				<div className={`${styles.header} ${textVisible[0] ? styles.visible : ''}`}>
					<h1>Karera Moduli</h1>
					<h2>Qoidalar</h2>
				</div>

				{/* Content Sections */}
				<div className={styles.rulesContainer}>
					{/* Maqsad */}
					<div className={getCardClassName('ruleCard', textVisible[1], 'maqsad')}>
						<h3>
							<span className={styles.dot}></span>
							Maqsad:
						</h3>
						<p>
							Ishtirokchi o'z faoliyatini eng quyi lavozimdan boshalab, bosqichma-bosqich yuqoriga —
							vazir darajasiga ko'tariladi. Har bir bosqichda bilim va malaka testi o'tadi.
						</p>
					</div>

					{/* O'yinning Shartlari */}
					<div className={getCardClassName('ruleCard', textVisible[2], 'shartlar')}>
						<h3>
							<span className={styles.dot}></span>
							O'yinning Shartlari:
						</h3>
						<p>Boshlash: O'yin "Mutaxassis" lavozimidan boshlanadi.</p>
					</div>

					{/* Test sinovi */}
					<div className={getCardClassName('ruleCard', textVisible[3], 'test')}>
						<h3>
							<span className={styles.dot}></span>
							Test sinovi:
						</h3>
						<p>Har bir lavozim uchun 5 ta test savoli topshiriladi.</p>
					</div>

					{/* O'tish sharti */}
					<div className={getCardClassName('ruleCard', textVisible[4], 'otish')}>
						<h3>
							<span className={styles.dot}></span>
							O'tish sharti:
						</h3>
						<p>
							Agar ishtirokchi 60% yoki undan yuqori natija ko'rsatsa (ya'ni kamida 3 ta savolga
							to'g'ri javob bersa), u keyingi lavozimga ko'tariladi.
						</p>
					</div>

					{/* Yulduzchalar */}
					<div className={getCardClassName('ruleCard', textVisible[5], 'yulduzlar')}>
						<h3>
							<span className={styles.dot}></span>
							Yulduzchalar:
						</h3>
						<p>
							Har bir to'g'ri javob uchun 1 ta yulduzcha beriladi. Shunday qilib, bitta lavozimda
							maksimal 5 yulduzcha olish mumkin.
						</p>
					</div>

					{/* Yulduzcha ishlatiishi */}
					<div className={getCardClassName('ruleCard', textVisible[6], 'ishlatish')}>
						<h3>
							<span className={styles.dot}></span>
							Yulduzcha ishlatish:
						</h3>
						<p>
							To'plangan yulduzchalarni bonuslar, maslahatlar, yordamlar yoki boshqa virtual
							sovrinlarga almashtirish mumkin.
						</p>
					</div>
				</div>

				{/* Button */}
				<div className={`${styles.buttonContainer} ${textVisible[7] ? styles.visible : ''}`}>
					<button onClick={onComplete} className={styles.detailButton}>
						<span className={styles.content}>DAVOM ETISH</span>
						<div className={styles.hoverEffect}></div>
						<div className={styles.arrow}>
							<svg className={styles.icon} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M13 7l5 5m0 0l-5 5m5-5H6'
								/>
							</svg>
						</div>
					</button>
				</div>
			</div>
		</div>
	)
}

export default IntroPages
