import React, { useState, useEffect } from 'react'
import {
	User,
	Search,
	FileCheck,
	Building,
	Briefcase,
	Wallet,
	Car,
	Landmark,
	Home,
	ShoppingCart,
	X,
	Check,
	Coins,
	Sparkles,
	Star,
} from 'lucide-react'
import styles from './StorePage.module.scss'

const StorePage = () => {
	const [userPoints, setUserPoints] = useState(() => {
		return parseInt(localStorage.getItem('userTotalPoints')) || 0
	})

	const [purchasedItems, setPurchasedItems] = useState(() => {
		const saved = localStorage.getItem('purchasedItems')
		return saved ? JSON.parse(saved) : []
	})

	const [showModal, setShowModal] = useState(false)
	const [selectedItem, setSelectedItem] = useState(null)
	const [searchQuery, setSearchQuery] = useState('')

	const storeItems = [
		{
			id: 1,
			name: "50% to'g'ri javoblar uchun mukofot",
			description: 'Test natijasi 50% va undan yuqori – bonus ball',
			price: 0,
			icon: FileCheck,
			category: 'bonus',
		},
		{
			id: 2,
			name: "Sanatoriyaga yo'llanma",
			description: "Sog'liqni tiklash uchun",
			price: 10000,
			icon: Building,
			category: 'health',
		},
		{
			id: 3,
			name: "Ijtimoly sug'urta paketi",
			description: "6 oylik sug'urta",
			price: 6500,
			icon: Briefcase,
			category: 'insurance',
		},
		{
			id: 4,
			name: 'Ballarni elektron pulga aylantirish',
			description: "1.000 ball = 10.000 so'm",
			price: 1000,
			icon: Wallet,
			category: 'money',
			conversion: "1.000 ball = 10.000 so'm",
		},
		{
			id: 5,
			name: 'Avtomobil xaridi',
			description: 'Chevrolet Spark',
			price: 1500000,
			icon: Car,
			category: 'vehicle',
		},
		{
			id: 6,
			name: "Bank jamg'armasi hisobini ochish",
			description: "Jamg'arma uchun bonusli foiz",
			price: 7000,
			icon: Landmark,
			category: 'banking',
		},
		{
			id: 7,
			name: 'Shaxsiy uy xaridi',
			description: '2 xonali uy',
			price: 2000000,
			icon: Home,
			category: 'property',
		},
	]

	// Сохранение в localStorage при изменении
	useEffect(() => {
		// Раскомментируйте для работы с localStorage:
		localStorage.setItem('userTotalPoints', userPoints.toString())
	}, [userPoints])

	useEffect(() => {
		// Раскомментируйте для работы с localStorage:
		localStorage.setItem('purchasedItems', JSON.stringify(purchasedItems))
	}, [purchasedItems])

	const canAfford = price => userPoints >= price

	const handlePurchase = item => {
		setSelectedItem(item)
		setShowModal(true)
	}

	const confirmPurchase = () => {
		if (selectedItem && canAfford(selectedItem.price)) {
			setUserPoints(prev => prev - selectedItem.price)
			setPurchasedItems(prev => {
				const existingItemIndex = prev.findIndex(item => item.id === selectedItem.id)

				if (existingItemIndex !== -1) {
					// Товар уже есть, увеличиваем counter
					const updatedItems = [...prev]
					updatedItems[existingItemIndex] = {
						...updatedItems[existingItemIndex],
						counter: updatedItems[existingItemIndex].counter + 1,
					}
					return updatedItems
				} else {
					// Новый товар, добавляем с counter = 1
					return [
						...prev,
						{
							...selectedItem,
							counter: 1,
							purchaseDate: new Date().toISOString(),
							purchaseId: Date.now(),
						},
					]
				}
			})
			setShowModal(false)
			setSelectedItem(null)
		}
	}

	const cancelPurchase = () => {
		setShowModal(false)
		setSelectedItem(null)
	}

	const filteredItems = storeItems.filter(
		item =>
			item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.description.toLowerCase().includes(searchQuery.toLowerCase())
	)

	const formatNumber = num => {
		return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
	}

	return (
		<div className={`${styles.container} middle`}>
			<div className={styles.wrapper}>
				{/* Header */}
				<div className={styles.header}>
					<div className={styles.headerTop}>
						<div className={styles.headerTitle}>
							<div className={styles.logoIcon}>
								<Coins />
							</div>
							<h1 className={styles.title}>BALL MARKET</h1>
						</div>
					</div>

					<div className={styles.pointsDisplay}>
						<Sparkles className={styles.sparkleIcon} />
						<span className={styles.pointsText}>
							Sizda: <span className={styles.formatNumber}>{formatNumber(userPoints)}</span> ball
						</span>
						<Star className={styles.starIcon} />
					</div>
				</div>

				{/* Store Items */}
				<div className={styles.content}>
					<h2 className={styles.sectionTitle}>Ballar evaziga tanlang:</h2>

					<div className={styles.itemsList}>
						{filteredItems.map(item => {
							const affordable = canAfford(item.price)
							const IconComponent = item.icon

							return (
								<div
									key={item.id}
									className={`${styles.storeItem} ${
										affordable ? styles.affordable : styles.unaffordable
									}`}
								>
									<div className={styles.itemContent}>
										<div
											className={`${styles.itemIcon} ${
												affordable ? styles.affordableIcon : styles.unaffordableIcon
											}`}
										>
											<IconComponent />
										</div>

										<div className={styles.itemDetails}>
											<h3 className={styles.itemName}>{item.name}</h3>
											<p className={styles.itemDescription}>{item.description}</p>
											{item.conversion && (
												<p className={styles.itemConversion}>{item.conversion}</p>
											)}

											<div className={styles.itemFooter}>
												<span
													className={`${styles.itemPrice} ${
														item.price === 0 ? styles.freePrice : styles.regularPrice
													}`}
												>
													{item.price === 0 ? 'Bepul' : `${formatNumber(item.price)} ball`}
												</span>

												<button
													onClick={() => handlePurchase(item)}
													disabled={!affordable && item.price > 0}
													className={`${styles.purchaseButton} ${
														affordable && item.price > 0
															? styles.affordableButton
															: item.price === 0
															? styles.freeButton
															: styles.disabledButton
													}`}
												>
													<ShoppingCart />
													<span>{item.price === 0 ? 'Olish' : 'Sotib olish'}</span>
												</button>
											</div>
										</div>
									</div>
								</div>
							)
						})}
					</div>
				</div>

				{/* Purchase Confirmation Modal */}
				{showModal && selectedItem && (
					<div className={styles.modalOverlay}>
						<div className={styles.modal}>
							<div className={styles.modalContent}>
								<div className={styles.modalIcon}>
									<selectedItem.icon />
								</div>

								<h3 className={styles.modalTitle}>Xaridni tasdiqlash</h3>

								<p className={styles.modalDescription}>
									"{selectedItem.name}" ni sotib olmoqchimisiz?
								</p>

								<div className={styles.modalSummary}>
									<div className={styles.modalSummaryRow}>
										<span className={styles.modalSummaryLabel}>Narxi:</span>
										<span className={styles.modalSummaryPrice}>
											-{formatNumber(selectedItem.price)} ball
										</span>
									</div>
									<div className={styles.modalSummaryRow}>
										<span className={styles.modalSummaryLabel}>Qoladi:</span>
										<span className={styles.modalSummaryRemaining}>
											{formatNumber(userPoints - selectedItem.price)} ball
										</span>
									</div>
								</div>

								<div className={styles.modalButtons}>
									<button
										onClick={cancelPurchase}
										className={`${styles.modalButton} ${styles.cancelButton}`}
									>
										<X />
										<span>Bekor qilish</span>
									</button>

									<button
										onClick={confirmPurchase}
										className={`${styles.modalButton} ${styles.confirmButton}`}
									>
										<Check />
										<span>Sotib olish</span>
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default StorePage
