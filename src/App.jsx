import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Routes, Route, Navigate } from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import StorePage from './pages/StorePage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
	// === Состояния ===
	const [user, setUser] = useState(null) // Главное состояние для данных пользователя
	const [loading, setLoading] = useState(true) // Состояние загрузки для проверки токена

	// Состояния для формы
	const [activeTab, setActiveTab] = useState('login')
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [fieldErrors, setFieldErrors] = useState({})
	const [isVisible, setIsVisible] = useState(false)

	const [loginData, setLoginData] = useState({ email: '', password: '' })
	const [registerData, setRegisterData] = useState({
		firstName: '',
		lastName: '',
		username: '',
		email: '',
		password: '',
	})

	// 1. === ГЛАВНОЕ ИЗМЕНЕНИЕ: Проверка аутентификации при загрузке приложения ===
	useEffect(() => {
		const checkAuth = async () => {
			const token = localStorage.getItem('token')
			if (token) {
				try {
					// Используем axios для проверки токена и получения данных пользователя
					const response = await axios.get('https://kiymeshek.uz/testa2/profile', {
						headers: {
							Authorization: `Bearer ${token}`,
						},
					})

					if (response.data && response.data.user) {
						setUser(response.data.user) // Устанавливаем пользователя, если токен валиден
					} else {
						// Если ответ пришел, но пользователя нет, чистим localStorage
						localStorage.removeItem('token')
						localStorage.removeItem('user')
					}
				} catch (err) {
					// Если запрос провалился (например, токен истек), чистим localStorage
					console.error('Token validation failed:', err)
					localStorage.removeItem('token')
					localStorage.removeItem('user')
				}
			}
			setLoading(false) // Завершаем загрузку после проверки
		}

		checkAuth()
		setIsVisible(true)
	}, []) // Пустой массив зависимостей, чтобы эффект выполнился один раз

	const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

	// 2. === Функция выхода (Logout) ===
	const handleLogout = async () => {
		try {
			const token = localStorage?.getItem?.('token')
			if (token) {
				await axios.post('https://kiymeshek.uz/testa2/logout', null, {
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				})
			}
		} catch (err) {
			console.error('Logout error:', err)
		} finally {
			// Очищаем все данные пользователя
			localStorage?.removeItem?.('token')
			localStorage?.removeItem?.('user')
			setUser(null)
			setRegisterData({ username: '', firstname: '', lastname: '', email: '', password: '' })
		}
	}

	const handleLogin = async e => {
		e.preventDefault()
		setLoading(true)
		setError('')
		setSuccess('')
		setFieldErrors({})

		if (!validateEmail(loginData.email)) {
			setFieldErrors({ email: "Email formati noto'g'ri" })
			setLoading(false)
			return
		}

		try {
			const response = await axios.post('https://kiymeshek.uz/testa2/login', loginData)

			localStorage.setItem('token', response.data.token)
			localStorage.setItem('user', JSON.stringify(response.data.user))

			setUser(response.data.user) // Устанавливаем пользователя в состояние
			setSuccess('Muvaffaqiyatli kirdingiz!') // Можно убрать, т.к. произойдет редирект

			setTimeout(() => setLoginData({ email: '', password: '' }), 1000)
		} catch (err) {
			setError(err.response?.data?.message || "Kirish xatoligi. Ma'lumotlarni tekshiring.")
		} finally {
			setLoading(false)
		}
	}

	const handleRegister = async e => {
		e.preventDefault()
		// ... (ваш код регистрации остается без изменений)
		setLoading(true)
		setError('')
		setSuccess('')
		setFieldErrors({})

		// Validatsiya
		const errors = {}
		if (registerData.firstName.length < 2) errors.firstName = 'Ism juda qisqa'
		if (registerData.lastName.length < 2) errors.lastName = 'Familiya juda qisqa'
		if (!validateEmail(registerData.email)) errors.email = "Email formati noto'g'ri"
		if (registerData.password.length < 6)
			errors.password = "Parol kamida 6 ta belgidan iborat bo'lishi kerak"

		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors)
			setLoading(false)
			return
		}

		try {
			await axios.post('https://kiymeshek.uz/testa2/register', {
				username: registerData.username,
				email: registerData.email,
				password: registerData.password,
			})

			// Сохраняем имя/фамилию для удобства, но не логиним сразу
			const tempUserData = {
				firstName: registerData.firstName,
				lastName: registerData.lastName,
			}
			localStorage.setItem('tempUser', JSON.stringify(tempUserData))

			setSuccess("Ro'yxatdan o'tdingiz! Endi kirishingiz mumkin.")
			setTimeout(() => {
				setActiveTab('login')
				setSuccess('') // Сбрасываем сообщение об успехе
			}, 2000)

			setRegisterData({ firstName: '', lastName: '', username: '', email: '', password: '' })
		} catch (err) {
			setError(err.response?.data?.message || "Ro'yxatdan o'tishda xatolik.")
		} finally {
			setLoading(false)
		}
	}

	// Пока идет проверка токена, можно показать лоадер или пустой экран
	if (loading) {
		return <div>Loading...</div>
	}

	return (
		<>
			{user && <Header handleLogout={handleLogout} />}

			<Routes>
				<Route element={<ProtectedRoute user={user} />}>
					<Route path='/' element={<HomePage handleLogout={handleLogout} />} />
					<Route
						path='/profile'
						element={<ProfilePage user={user} handleLogout={handleLogout} />}
					/>
					<Route path='/store' element={<StorePage />} />
				</Route>

				<Route
					path='/auth'
					element={
						user ? (
							<Navigate to='/' replace />
						) : (
							<AuthPage
								activeTab={activeTab}
								setActiveTab={setActiveTab}
								showPassword={showPassword}
								setShowPassword={setShowPassword}
								loading={loading}
								error={error}
								success={success}
								fieldErrors={fieldErrors}
								setFieldErrors={setFieldErrors}
								loginData={loginData}
								setLoginData={setLoginData}
								registerData={registerData}
								setRegisterData={setRegisterData}
								isVisible={isVisible}
								handleLogin={handleLogin}
								handleRegister={handleRegister}
								validateEmail={validateEmail}
							/>
						)
					}
				/>
			</Routes>

			{user && <Footer />}
		</>
	)
}

export default App
