# Nokta Multi-Persona System Architecture

Nokta virtual assistant supports a modular, responsive **Multi-Persona System** allowing the user to switch active AI profiles dynamically.

---

## 👥 Persona Definitions

### 1. Junior Ravza (Vibrant Cyan Accent)
* **Title**: `JUNIOR DEVELOPER ASSISTANT`
* **Theme Accent**: `#00f2fe`
* **Focus**: Rapid prototyping, responsive UI fixes, and visual interface tweaks.
* **Glow Energy**: Concentrated, glowing cyan glassmorphism.

### 2. Senior Ravza (Deep Violet Accent)
* **Title**: `SENIOR ARCHITECT ASSISTANT`
* **Theme Accent**: `#a855f7`
* **Focus**: Core pipeline optimization, memory leak cleanup, Three.js shaders, and custom skeleton rigging.
* **Glow Energy**: Mystical, premium deep indigo and violet aesthetics.

---

## 🔒 State Sync & Persistence

The active persona is stored under AsyncStorage key `@avatar_persona`:
1. **Initial Mount**: Loads the active profile from storage (defaults to `junior`).
2. **On Switch**:
   * Instantly re-renders the Home Screen accents and labels.
   * Persists new state asynchronously.
   * Harmonizes with the dynamic 3D lighting rigs for absolute immersion.
