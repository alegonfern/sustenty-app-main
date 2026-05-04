


// Archivo eliminado.
					borderBottomLeftRadius: boxRadius,
					borderBottomRightRadius: boxRadius,
					bgcolor: 'grey.100',
					background: 'repeating-dot',
				}}
			/>
			<ContainerWrapper sx={{ py: 8 }}>
				<Box ref={containerRef}>
					<Box sx={{ pb: { xs: 3, sm: 4, md: 5 } }}>
						<Stack sx={{ alignItems: 'center', gap: 1.5 }}>
							<motion.div initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: [0.6, 1.15, 0.95, 1] }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.8, ease: 'linear' }}>
								<Chip
									variant="outlined"
									label={chip?.label || 'NUEVO EN SUSTENTY'}
									sx={{ bgcolor: 'grey.100', color: '#15b19d', fontWeight: 700 }}
								/>
							</motion.div>
							<motion.div initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2, ease: 'linear' }}>
								<Typography variant="h2" align="center" sx={{ maxWidth: 800, fontWeight: 800 }}>
									  {headLine || 'IA que transforma tus procesos para hacerlos más eficientes y sostenibles'}
								</Typography>
							</motion.div>
							<motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2, ease: [0.215, 0.61, 0.355, 1] }}>
								<Box sx={{ pt: 0.5, pb: 0.75 }}>
									<Wave />
								</Box>
							</motion.div>
							<motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3, ease: [0.215, 0.61, 0.355, 1] }}>
								<Typography variant="h5" align="center" sx={{ color: 'text.secondary', maxWidth: 650 }}>
									  {captionLine || 'Automatiza, escala y lidera el cambio sostenible en tu empresa con IA.'}
								</Typography>
							</motion.div>
						</Stack>
						<Stack sx={{ alignItems: 'center', gap: 2, mt: { xs: 3, sm: 4, md: 5 } }}>
							<motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} whileHover={{ scale: 1.06 }}>
								<ButtonAnimationWrapper>
									<Button
										color="primary"
										variant="contained"
										startIcon={<SvgIcon name="tabler-sparkles" size={16} stroke={3} color="background.default" />}
										href={primaryBtn?.href || '/register'}
										className={primaryBtn?.className || 'saas-cta-btn'}
										sx={{ background: '#15b19d', color: '#fff', borderRadius: 6, fontWeight: 700, fontSize: '1.1rem', px: 4, py: 1.5 }}
									>
										{primaryBtn?.children || 'Comenzar ahora'}
									</Button>
								</ButtonAnimationWrapper>
							</motion.div>
							<Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
								{(listData && listData.length > 0) && listData.map((item, idx) => (
									<motion.div key={idx} initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: idx * 0.08, ease: 'linear' }}>
										<Chip
											label={item.title}
											variant="outlined"
											icon={<GraphicsImage image={item.image} sx={{ width: 16, height: 16 }} />}
											sx={{ height: 32, px: 1, bgcolor: 'grey.100', color: '#15b19d', fontWeight: 700 }}
										/>
									</motion.div>
								))}
							</Stack>
						</Stack>
						<motion.div initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 0.9 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.3 }}>
							<GraphicsCard sx={{ border: '5px solid', borderColor: 'grey.300', mt: 4, mx: 'auto', maxWidth: 320 }}>
								<img src={videoThumbnail || '/logo-icon.svg'} alt="Sustenty Icon" style={{ width: '100%', borderRadius: 16 }} />
							</GraphicsCard>
						</motion.div>
					</Box>
				</Box>
			</ContainerWrapper>
		</>
	);
}
