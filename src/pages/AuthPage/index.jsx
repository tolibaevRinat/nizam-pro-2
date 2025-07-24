import React from 'react'

import {
	User,
	Mail,
	Lock,
	Eye,
	EyeOff,
	LogIn,
	UserPlus,
	Sparkles,
	Shield,
	CheckCircle,
	AlertCircle,
	UserCircle,
	KeyRound,
	ArrowRight,
	Loader2,
	UserCheck,
	AtSign,
	ShieldCheck,
} from 'lucide-react'

import styles from './AuthPage.module.scss'

const AuthPage = ({
	activeTab,
	setActiveTab,
	showPassword,
	setShowPassword,
	loading,
	error,
	success,
	fieldErrors,
	setFieldErrors,
	loginData,
	setLoginData,
	registerData,
	setRegisterData,
	isVisible,
	handleLogin,
	handleRegister,
	validateEmail,
}) => {
	return (
		<div className={styles.container}>
			<div className={styles.backgroundAnimation}>
				<div className={styles.circle1}></div>
				<div className={styles.circle2}></div>
				<div className={styles.circle3}></div>
			</div>

			<div className={`${styles.authCard} ${isVisible ? styles.visible : ''}`}>
				<div className={styles.card}>
					{/* Logo va sarlavha */}
					<div className={styles.header}>
						<div className={styles.logoWrapper}>
							<Shield className={styles.logo} />
							<Sparkles className={styles.sparkle1} />
							<Sparkles className={styles.sparkle2} />
						</div>
						<h1 className={styles.title}>Kiymeshek</h1>
						<p className={styles.subtitle}>Xush kelibsiz!</p>
					</div>

					{/* Tablar */}
					<div className={styles.tabs}>
						<button
							onClick={() => setActiveTab('login')}
							className={`${styles.tab} ${activeTab === 'login' ? styles.activeTab : ''}`}
						>
							<LogIn className={styles.tabIcon} />
							<span>Kirish</span>
							{activeTab === 'login' && <div className={styles.tabIndicator}></div>}
						</button>
						<button
							onClick={() => setActiveTab('register')}
							className={`${styles.tab} ${activeTab === 'register' ? styles.activeTab : ''}`}
						>
							<UserPlus className={styles.tabIcon} />
							<span>Ro'yxatdan o'tish</span>
							{activeTab === 'register' && <div className={styles.tabIndicator}></div>}
						</button>
					</div>

					<div className={styles.content}>
						{/* Xabarlar */}
						{error && (
							<div className={`${styles.message} ${styles.errorMessage}`}>
								<AlertCircle className={styles.messageIcon} />
								<span>{error}</span>
							</div>
						)}
						{success && (
							<div className={`${styles.message} ${styles.successMessage}`}>
								<CheckCircle className={styles.messageIcon} />
								<span>{success}</span>
							</div>
						)}

						{/* Kirish formasi */}
						{activeTab === 'login' && (
							<form onSubmit={handleLogin} className={styles.form}>
								<div className={styles.formGroup}>
									<label className={styles.label}>
										<AtSign className={styles.labelIcon} />
										Elektron pochta
									</label>
									<div
										className={`${styles.inputWrapper} ${fieldErrors.email ? styles.hasError : ''}`}
									>
										<Mail className={styles.inputIcon} />
										<input
											type='email'
											required
											value={loginData.email}
											onChange={e => {
												setLoginData({ ...loginData, email: e.target.value })
												setFieldErrors({ ...fieldErrors, email: '' })
											}}
											className={styles.input}
											placeholder='email@example.com'
										/>
										{loginData.email && validateEmail(loginData.email) && (
											<CheckCircle className={styles.validIcon} />
										)}
									</div>
									{fieldErrors.email && (
										<span className={styles.fieldError}>{fieldErrors.email}</span>
									)}
								</div>

								<div className={styles.formGroup}>
									<label className={styles.label}>
										<KeyRound className={styles.labelIcon} />
										Parol
									</label>
									<div className={styles.inputWrapper}>
										<Lock className={styles.inputIcon} />
										<input
											type={showPassword ? 'text' : 'password'}
											required
											value={loginData.password}
											onChange={e => setLoginData({ ...loginData, password: e.target.value })}
											className={styles.input}
											placeholder='Parolni kiriting'
										/>
										<button
											type='button'
											onClick={() => setShowPassword(!showPassword)}
											className={styles.passwordToggle}
										>
											{showPassword ? (
												<EyeOff className={styles.icon} />
											) : (
												<Eye className={styles.icon} />
											)}
										</button>
									</div>
								</div>

								<button type='submit' disabled={loading} className={styles.submitButton}>
									{loading ? (
										<>
											<Loader2 className={styles.loadingIcon} />
											<span>Kirish...</span>
										</>
									) : (
										<>
											<span>Kirish</span>
											<ArrowRight className={styles.arrowIcon} />
										</>
									)}
								</button>
							</form>
						)}

						{/* Ro'yxatdan o'tish formasi */}
						{activeTab === 'register' && (
							<form onSubmit={handleRegister} className={styles.form}>
								<div className={styles.formRow}>
									<div className={styles.formGroup}>
										<label className={styles.label}>
											<UserCircle className={styles.labelIcon} />
											Ism
										</label>
										<div
											className={`${styles.inputWrapper} ${
												fieldErrors.firstName ? styles.hasError : ''
											}`}
										>
											<User className={styles.inputIcon} />
											<input
												type='text'
												required
												value={registerData.firstName}
												onChange={e => {
													setRegisterData({ ...registerData, firstName: e.target.value })
													setFieldErrors({ ...fieldErrors, firstName: '' })
												}}
												className={styles.input}
												placeholder='Ismingiz'
											/>
										</div>
										{fieldErrors.firstName && (
											<span className={styles.fieldError}>{fieldErrors.firstName}</span>
										)}
									</div>

									<div className={styles.formGroup}>
										<label className={styles.label}>
											<UserCheck className={styles.labelIcon} />
											Familiya
										</label>
										<div
											className={`${styles.inputWrapper} ${
												fieldErrors.lastName ? styles.hasError : ''
											}`}
										>
											<User className={styles.inputIcon} />
											<input
												type='text'
												required
												value={registerData.lastName}
												onChange={e => {
													setRegisterData({ ...registerData, lastName: e.target.value })
													setFieldErrors({ ...fieldErrors, lastName: '' })
												}}
												className={styles.input}
												placeholder='Familiyangiz'
											/>
										</div>
										{fieldErrors.lastName && (
											<span className={styles.fieldError}>{fieldErrors.lastName}</span>
										)}
									</div>
								</div>

								<div className={styles.formGroup}>
									<label className={styles.label}>
										<ShieldCheck className={styles.labelIcon} />
										Foydalanuvchi nomi
									</label>
									<div className={styles.inputWrapper}>
										<User className={styles.inputIcon} />
										<input
											type='text'
											required
											value={registerData.username}
											onChange={e => setRegisterData({ ...registerData, username: e.target.value })}
											className={styles.input}
											placeholder='Username'
										/>
									</div>
								</div>

								<div className={styles.formGroup}>
									<label className={styles.label}>
										<AtSign className={styles.labelIcon} />
										Elektron pochta
									</label>
									<div
										className={`${styles.inputWrapper} ${fieldErrors.email ? styles.hasError : ''}`}
									>
										<Mail className={styles.inputIcon} />
										<input
											type='email'
											required
											value={registerData.email}
											onChange={e => {
												setRegisterData({ ...registerData, email: e.target.value })
												setFieldErrors({ ...fieldErrors, email: '' })
											}}
											className={styles.input}
											placeholder='email@example.com'
										/>
										{registerData.email && validateEmail(registerData.email) && (
											<CheckCircle className={styles.validIcon} />
										)}
									</div>
									{fieldErrors.email && (
										<span className={styles.fieldError}>{fieldErrors.email}</span>
									)}
								</div>

								<div className={styles.formGroup}>
									<label className={styles.label}>
										<KeyRound className={styles.labelIcon} />
										Parol
									</label>
									<div
										className={`${styles.inputWrapper} ${
											fieldErrors.password ? styles.hasError : ''
										}`}
									>
										<Lock className={styles.inputIcon} />
										<input
											type={showPassword ? 'text' : 'password'}
											required
											value={registerData.password}
											onChange={e => {
												setRegisterData({ ...registerData, password: e.target.value })
												setFieldErrors({ ...fieldErrors, password: '' })
											}}
											className={styles.input}
											placeholder='Parol yarating'
										/>
										<button
											type='button'
											onClick={() => setShowPassword(!showPassword)}
											className={styles.passwordToggle}
										>
											{showPassword ? (
												<EyeOff className={styles.icon} />
											) : (
												<Eye className={styles.icon} />
											)}
										</button>
									</div>
									{fieldErrors.password && (
										<span className={styles.fieldError}>{fieldErrors.password}</span>
									)}
								</div>

								<button type='submit' disabled={loading} className={styles.submitButton}>
									{loading ? (
										<>
											<Loader2 className={styles.loadingIcon} />
											<span>Ro'yxatdan o'tish...</span>
										</>
									) : (
										<>
											<span>Ro'yxatdan o'tish</span>
											<ArrowRight className={styles.arrowIcon} />
										</>
									)}
								</button>
							</form>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default AuthPage
