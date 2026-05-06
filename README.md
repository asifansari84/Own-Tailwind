# ChaiCSS Utility Engine

A lightweight utility-first CSS engine built with vanilla JavaScript. Users write
classes that start with `chai-`, and the script converts those classes into
inline styles after the page loads.

## Live links

- Hosted project: add your deployed link here
- GitHub repository: add your public repository link here
- Twitter/X post: add your final post link here

## How it works

1. `script.js` waits for `DOMContentLoaded`.
2. `ChaiUtilityEngine` scans the DOM for elements with `chai-*` classes.
3. Each class is parsed by utility groups: spacing, colors, typography, borders,
   layout, and effects.
4. Valid declarations are applied with `element.style.setProperty(...)`.
5. The original `chai-*` classes are removed after the inline styles are applied.

Example:

```html
<div class="chai-bg-red chai-text-white chai-text-center chai-p-2">
	Hello ChaiCSS
</div>
```

Becomes:

```css
background-color: red;
color: #ffffff;
text-align: center;
padding: 2px;
```

## Supported utilities

- Spacing: `chai-p-24`, `chai-px-16`, `chai-mt-10`, `chai-mx-auto`
- Colors: `chai-bg-red`, `chai-bg-slate-950`, `chai-text-white`,
  `chai-border-slate-300`
- Typography: `chai-text-xl`, `chai-text-center`, `chai-font-bold`,
  `chai-leading-relaxed`
- Borders: `chai-border`, `chai-border-0`, `chai-rounded-xl`,
  `chai-rounded-full`
- Layout: `chai-flex`, `chai-grid`, `chai-grid-cols-2`, `chai-gap-18`,
  `chai-items-center`
- Effects and states: `chai-shadow-md`, `chai-hover-bg-blue`
- Responsive variants: `chai-sm-*`, `chai-md-*`, `chai-lg-*`

## Run locally

Open `index.html` in a browser. No build step or package install is required.

## Submission checklist

- Deploy the project and paste the hosted link above.
- Push this folder to a public GitHub repository and paste the repository link.
- Record a short video that explains the approach, the class parser, key code in
  `script.js`, and a browser demo.
- Post on Twitter/X with what you built, how it works, screenshots or demo,
  GitHub link, and hosted link.
- Submit the Twitter/X post link with the project.
