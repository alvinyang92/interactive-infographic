# Interactive Infographic – Frontend Assignment

This project is a standalone interactive infographic built as part of a Frontend Developer assignment.
The goal is to create an embeddable interactive asset that tells a story visually, with animations and user interactions,
instead of a full multi-page website.

The infographic is designed to work as a self-contained section that can be embedded into any webpage.

---

## Tech Stack

- HTML  
- TailwindCSS  
- Vanilla JavaScript (ES Modules)  
- GSAP animations  

No frontend framework is used to keep the setup simple and portable.

---

## How to Run the Project

### Option 1: Run locally

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   ```

2. Go into the project folder:
   ```bash
   cd <project-folder>
   ```

3. Run using a local server (recommended):
   ```bash
   npx serve
   ```
   or
   ```bash
   npx http-server
   ```

4. Open the local URL shown in the terminal (usually http://localhost:3000).

> Opening the HTML file directly without a local server may cause issues due to ES module imports.

---

### Option 2: Hosted Demo

A live demo is hosted on Netlify:  
👉 [https://frontend-interactive-infographic.netlify.app/]

---

## Features Implemented

- **Interactive Infographic Asset**
  - Implemented as a custom Web Component.
  - Fully self-contained (HTML, CSS, and JavaScript encapsulated).
  - Designed to be easily embedded into any webpage without external dependencies.

- **Dynamic Visuals**
  - Smooth transitions between sections.
  - Subtle animations triggered by scroll and interaction.
  - Hover effects for better engagement.

- **Interactive Elements**
  - Clickable steps to reveal additional details.
  - Tooltips or hidden content on hover/click.
  - Animated state changes based on user interaction.

- **Responsive Design**
  - Desktop layout optimised for 1440px width.
  - Mobile layout optimised for 375px width.
  - Layout adapts smoothly across screen sizes.

- **Code Structure**
  - Web Component structure used to encapsulate markup, styles, and behavior.
  - Clear separation between layout, interaction logic, and animation logic.
  - Scoped styles to prevent conflicts when embedded into existing websites.

---

## Design & Implementation Notes

- The infographic was designed as an embeddable asset instead of a full webpage.
- The interactive asset is implemented using a Web Component (Custom Element) to ensure encapsulation and reusability.
- Interactions are kept simple and clear to prioritise usability and performance.

---

## Assumptions & Limitations

- This project focuses purely on frontend interactivity using Web Components. No backend or API integration is included.
- Content is static and for demonstration purposes.
- Animations are kept lightweight for better mobile performance.
- Targeted at modern browsers (Chrome, Edge, Safari, Firefox).
- Accessibility can be further improved if required.

---

## Notes

- The project intentionally avoids frontend frameworks to keep the interactive asset lightweight and portable.
- The Web Component approach allows the infographic to be reused across different projects or pages with minimal setup.
- Additional enhancements (such as THREE.js) can be integrated without refactoring the existing structure.
