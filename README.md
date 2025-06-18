# 🍋 Lemonaut

**Lemonaut** is a lightweight and juicy microframework for building REST APIs in Node.js with simplicity, speed, and a batteries-included mindset.

> Designed for learning. Optimized for productivity.

---

## 🚀 Features

- Zero-config setup for fast prototyping  
- Built-in middleware: CORS, logging, error handling, body parsing, static serving, file uploads, rate limiting, and more  
- Fully written in TypeScript  
- Dependency injection support via container pattern  
- Modular architecture inspired by clean code principles  
- Minimal boilerplate, maximum productivity

---

## 📦 Installation

Install Lemonaut using your favorite package manager:

```bash
npm install lemonaut
```

### 🍋 Example
Here's a minimal Lemonaut app:

```bash
import { lemonaut } from "lemonaut";

const app = lemonaut();

app.get("/", (req, res) => {
  res.json({ message: "Hello, Lemon World! 🍋" });
});

app.get("/juicy", (req, res) => {
  res.json({ taste: "lemon-fresh" });
});

app.startMission(3000); // 🚀
```

📚 Full documentation is available at:
👉 https://lemonaut-docs.vercel.app/

Explore guides, architecture, best practices, and examples in one beautiful and searchable interface.

🧠 Open Source & Educational
Lemonaut was born out of a desire to understand how Express works under the hood and how to resolve common backend pain points in a clean and structured way.

Instead of reading theory, we built a working microframework from scratch.

It’s open source and educational — whether you're curious about framework internals, dependency injection, middleware systems, or just want to build fast without repeating boilerplate, Lemonaut is here to help.

Give it a ⭐ if you enjoy it or learn something new!

⚖️ License
Lemonaut is MIT licensed.
Use it, learn from it, and modify it as you wish.