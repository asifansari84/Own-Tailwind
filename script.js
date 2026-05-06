class ChaiUtilityEngine {
	constructor(root = document) {
		this.root = root
		this.breakpoints = {
			sm: '(min-width: 640px)',
			md: '(min-width: 768px)',
			lg: '(min-width: 1024px)'
		}
		this.colors = {
			red: 'red',
			blue: 'blue',
			cyan: '#06b6d4',
			emerald: '#10b981',
			amber: '#f59e0b',
			white: '#ffffff',
			black: '#000000',
			transparent: 'transparent',
			zinc: {
				50: '#fafafa',
				100: '#f4f4f5',
				200: '#e4e4e7',
				300: '#d4d4d8',
				400: '#a1a1aa',
				500: '#71717a',
				600: '#52525b',
				700: '#3f3f46',
				800: '#27272a',
				900: '#18181b',
				950: '#09090b'
			},
			slate: {
				50: '#f8fafc',
				100: '#f1f5f9',
				200: '#e2e8f0',
				300: '#cbd5e1',
				400: '#94a3b8',
				500: '#64748b',
				600: '#475569',
				700: '#334155',
				800: '#1e293b',
				900: '#0f172a',
				950: '#020617'
			}
		}
		this.parsers = [
			this.parseSpacing.bind(this),
			this.parseColor.bind(this),
			this.parseTypography.bind(this),
			this.parseBorder.bind(this),
			this.parseLayout.bind(this),
			this.parseEffects.bind(this)
		]
		this.cache = new Map()
		this.elements = new Set()
		this.responsiveMedia = new Map()
		this.initializeBreakpoints()
	}

	initialize() {
		const elements = Array.from(this.root.querySelectorAll("[class*='chai-']"))
		elements.forEach(element => {
			this.elements.add(element)
			this.applyUtilities(element)
		})
	}

	initializeBreakpoints() {
		Object.entries(this.breakpoints).forEach(([name, query]) => {
			const media = window.matchMedia(query)
			media.addEventListener('change', () => this.renderAllElements())
			this.responsiveMedia.set(name, media)
		})
	}

	applyUtilities(element) {
		const classNames = Array.from(element.classList).filter(className =>
			className.startsWith('chai-')
		)
		const state = {
			base: {},
			responsive: [],
			hover: {},
			activeHover: false,
			managedProperties: new Set()
		}

		classNames.forEach(className => {
			const utility = this.parseClassName(className)
			if (!utility) return

			Object.keys(utility.styles).forEach(property =>
				state.managedProperties.add(property)
			)

			if (utility.variant === 'hover') {
				Object.assign(state.hover, utility.styles)
				return
			}

			if (this.breakpoints[utility.variant]) {
				state.responsive.push(utility)
				return
			}

			Object.assign(state.base, utility.styles)
		})

		element.__chaiState = state
		this.renderElement(element)
		this.bindHover(element)
	}

	parseClassName(className) {
		if (this.cache.has(className)) {
			return this.cache.get(className)
		}

		let token = className.slice(5)
		let variant = null

		for (const prefix of [...Object.keys(this.breakpoints), 'hover']) {
			if (token.startsWith(`${prefix}-`)) {
				variant = prefix
				token = token.slice(prefix.length + 1)
				break
			}
		}

		const styles = this.parseToken(token)
		const utility = styles ? { variant, styles } : null
		this.cache.set(className, utility)
		return utility
	}

	parseToken(token) {
		for (const parser of this.parsers) {
			const styles = parser(token)
			if (styles) return styles
		}
		return null
	}

	parseSpacing(token) {
		const match = token.match(/^([mp])([trblxy]?)-(.+)$/)
		if (!match) return null

		const [, type, axis, rawValue] = match
		const property = type === 'p' ? 'padding' : 'margin'
		const value = rawValue === 'auto' ? 'auto' : this.toPixelValue(rawValue)

		if (!axis) return { [property]: value }

		const axisProperties = {
			t: [`${property}-top`],
			r: [`${property}-right`],
			b: [`${property}-bottom`],
			l: [`${property}-left`],
			x: [`${property}-left`, `${property}-right`],
			y: [`${property}-top`, `${property}-bottom`]
		}

		return axisProperties[axis].reduce((styles, cssProperty) => {
			styles[cssProperty] = value
			return styles
		}, {})
	}

	parseColor(token) {
		const match = token.match(/^(bg|text|border)-([a-z]+)(?:-(\d{2,3}))?$/)
		if (!match) return null

		const [, type, colorName, shade] = match
		const value = this.resolveColor(colorName, shade)
		if (!value) return null

		const properties = {
			bg: 'background-color',
			text: 'color',
			border: 'border-color'
		}

		return { [properties[type]]: value }
	}

	parseTypography(token) {
		const textSizes = {
			xs: '0.75rem',
			sm: '0.875rem',
			base: '1rem',
			lg: '1.125rem',
			xl: '1.25rem',
			'2xl': '1.5rem',
			'3xl': '1.875rem',
			'4xl': '2.25rem',
			'5xl': '3rem'
		}
		const sizeMatch = token.match(/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)$/)
		if (sizeMatch) return { 'font-size': textSizes[sizeMatch[1]] }

		const alignMatch = token.match(/^text-(left|center|right|justify)$/)
		if (alignMatch) return { 'text-align': alignMatch[1] }

		const fontWeights = {
			normal: '400',
			medium: '500',
			semibold: '600',
			bold: '700'
		}
		const weightMatch = token.match(/^font-(normal|medium|semibold|bold)$/)
		if (weightMatch) return { 'font-weight': fontWeights[weightMatch[1]] }

		const tracking = {
			tight: '-0.025em',
			normal: '0',
			wide: '0.025em',
			wider: '0.05em'
		}
		const trackingMatch = token.match(/^tracking-(tight|normal|wide|wider)$/)
		if (trackingMatch) return { 'letter-spacing': tracking[trackingMatch[1]] }

		if (token === 'uppercase') return { 'text-transform': 'uppercase' }
		if (token === 'leading-relaxed') return { 'line-height': '1.7' }

		return null
	}

	parseBorder(token) {
		if (token === 'border') return { border: '1px solid currentColor' }
		if (token === 'border-0') return { border: '0' }

		const widthMatch = token.match(/^border-(\d+)$/)
		if (widthMatch) return { border: `${widthMatch[1]}px solid currentColor` }

		const radius = {
			none: '0',
			sm: '4px',
			md: '6px',
			lg: '8px',
			xl: '12px',
			'2xl': '16px',
			'3xl': '24px',
			full: '9999px'
		}
		if (token === 'rounded') return { 'border-radius': radius.lg }

		const radiusMatch = token.match(/^rounded-(none|sm|md|lg|xl|2xl|3xl|full)$/)
		if (radiusMatch) return { 'border-radius': radius[radiusMatch[1]] }

		return null
	}

	parseLayout(token) {
		const layoutMap = {
			block: { display: 'block' },
			hidden: { display: 'none' },
			flex: { display: 'flex' },
			grid: { display: 'grid' },
			'inline-flex': { display: 'inline-flex' },
			'flex-row': { 'flex-direction': 'row' },
			'flex-col': { 'flex-direction': 'column' },
			'items-start': { 'align-items': 'flex-start' },
			'items-center': { 'align-items': 'center' },
			'items-end': { 'align-items': 'flex-end' },
			'justify-start': { 'justify-content': 'flex-start' },
			'justify-center': { 'justify-content': 'center' },
			'justify-end': { 'justify-content': 'flex-end' },
			'justify-between': { 'justify-content': 'space-between' },
			'w-full': { width: '100%' },
			'min-h-screen': { 'min-height': '100vh' },
			'max-w-prose': { 'max-width': '65ch' },
			'max-w-screen-lg': { 'max-width': '1024px' },
			'list-disc': { 'list-style-type': 'disc' },
			'cursor-pointer': { cursor: 'pointer' }
		}

		if (layoutMap[token]) return layoutMap[token]

		const gapMatch = token.match(/^gap-(.+)$/)
		if (gapMatch) return { gap: this.toPixelValue(gapMatch[1]) }

		const gridColsMatch = token.match(/^grid-cols-(\d+)$/)
		if (gridColsMatch) {
			return {
				'grid-template-columns': `repeat(${gridColsMatch[1]}, minmax(0, 1fr))`
			}
		}

		return null
	}

	parseEffects(token) {
		const shadows = {
			sm: '0 1px 2px rgba(15, 23, 42, 0.08)',
			md: '0 8px 18px rgba(15, 23, 42, 0.12)',
			lg: '0 18px 35px rgba(15, 23, 42, 0.14)',
			xl: '0 24px 48px rgba(15, 23, 42, 0.18)'
		}
		const shadowMatch = token.match(/^shadow-(sm|md|lg|xl)$/)
		if (shadowMatch) return { 'box-shadow': shadows[shadowMatch[1]] }

		return null
	}

	renderElement(element) {
		const state = element.__chaiState
		if (!state) return

		const responsiveStyles = state.responsive.reduce((styles, utility) => {
			const media = this.responsiveMedia.get(utility.variant)
			return media?.matches ? { ...styles, ...utility.styles } : styles
		}, {})
		const hoverStyles = state.activeHover ? state.hover : {}
		const nextStyles = { ...state.base, ...responsiveStyles, ...hoverStyles }

		state.managedProperties.forEach(property => element.style.removeProperty(property))
		Object.entries(nextStyles).forEach(([property, value]) => {
			element.style.setProperty(property, value)
		})
	}

	bindHover(element) {
		const state = element.__chaiState
		if (!state || Object.keys(state.hover).length === 0 || element.__chaiHoverBound) {
			return
		}

		element.addEventListener('mouseenter', () => {
			state.activeHover = true
			this.renderElement(element)
		})
		element.addEventListener('mouseleave', () => {
			state.activeHover = false
			this.renderElement(element)
		})
		element.__chaiHoverBound = true
	}

	renderAllElements() {
		this.elements.forEach(element => this.renderElement(element))
	}

	resolveColor(name, shade) {
		const color = this.colors[name]
		if (!color) return shade ? null : name
		return typeof color === 'string' ? color : color[shade]
	}

	toPixelValue(value) {
		if (value === 'px') return '1px'
		if (/^\d+(\.\d+)?$/.test(value)) return `${value}px`
		return value
	}
}

window.addEventListener('DOMContentLoaded', () => {
	const engine = new ChaiUtilityEngine(document)
	engine.initialize()
	window.ChaiUtilityEngine = ChaiUtilityEngine

	const copyButton = document.querySelector('[data-copy-demo]')
	const sampleCode = document.querySelector('[data-sample-code]')
	if (!copyButton || !sampleCode) return

	copyButton.addEventListener('click', async () => {
		if (navigator.clipboard) {
			await navigator.clipboard.writeText(sampleCode.textContent.trim())
		}
		copyButton.textContent = 'Copied'
		window.setTimeout(() => {
			copyButton.textContent = 'Copy demo'
		}, 1500)
	})
})
