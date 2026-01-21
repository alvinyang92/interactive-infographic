# Interactive Infographic – Frontend Assignment

This project is a standalone interactive infographic built as part of a Frontend Developer assignment.
The goal is to create an embeddable interactive asset that tells a story visually, with animations and user interactions,
instead of a full multi-page website.

The infographic is designed to work as a self-contained section that can be embedded into any webpage.

---

## Tech Stack

- HTML  
- CSS  
- Vanilla JavaScript  
- Web Components (Custom Elements)  
- CSS & JavaScript-based animations  

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
👉 [Netlify Demo URL]

---

## Features Implemented

- **Interactive Infographic Asset**
  - Built as a self-contained component that can be embedded into any webpage.
  - All interactions happen within the asset itself.

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
  - Logic organised into reusable components.
  - Styles scoped to avoid conflicts when embedded.
  - Easy to extend for other infographic topics.

---

## Design & Implementation Notes

- The infographic was designed as an embeddable asset instead of a full webpage.
- Web Components were used to keep markup, styling, and behaviour encapsulated.
- Interactions are kept simple and clear to prioritise usability and performance.

---

## Assumptions & Limitations

- This project focuses on frontend interactivity only. No backend or API integration.
- Content is static and for demonstration purposes.
- Animations are kept lightweight for better mobile performance.
- Targeted at modern browsers (Chrome, Edge, Safari, Firefox).
- Accessibility can be further improved if required.

---

## Notes

- The project is intentionally framework-free for portability and reusability.
- The structure allows easy extension or conversion into reusable components.
- Additional enhancements (e.g. THREE.js) can be added without changing the core structure.
