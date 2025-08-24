# Starter Toolkit 🚀

A powerful CLI tool to generate starter projects with popular tech stacks. Stop wasting time on boilerplate setup and focus on building awesome features!


## Installation  ✨

### Global Installation (Recommended)
```bash
npm install -g starter-toolkit
```

### One-time Usage
```bash
npx starter-toolkit create my-awesome-project
```

## Usage

```bash
# Interactive project creation
starter-toolkit create my-project

# Follow the prompts:
# ✔ Select your stack: Node.js + Express + Prisma
```

## Available Templates

| Template | Description | Core Technologies | Database Options | Auth Support |
|----------|-------------|-------------------|------------------|--------------|
| 🟢 **Node.js + Express + Prisma** | REST API with modern ORM | Express.js, Prisma, CORS | PostgreSQL, MySQL, MongoDB | JWT Authentication |
| 🔴 **Laravel + MySQL** | Full-featured PHP web app | Laravel Framework, Eloquent ORM | MySQL | Authentication scaffolding |
| ⚛️ **React + Vite + TypeScript** | Modern frontend setup | React 18, Vite, TypeScript | - | - |


## Requirements

- **Node.js** >= 14.0.0
- **npm** or **yarn**

## Development

Want to contribute or modify templates?

```bash
# Clone the repository
git clone https://github.com/fyyyn1210/starter-toolkit.git
cd starter-toolkit

# Install dependencies
npm install

# Build the project
npm run build

# Link for local testing
npm link

# Test your changes
starter-toolkit create test-project
```

## Adding Custom Templates

1. Create a new folder in `templates/`
2. Add your template files with Handlebars variables
3. Create `template.config.js` with configuration


Example template structure:
```
templates/my-custom-stack/
├── template.config.js
├── package.json
├── src/
│   └── index.js
└── .env.example
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://github.com/fyyyn1210/starter-toolkit/wiki)
- 🐛 [Report Issues](https://github.com/fyyyn1210/starter-toolkit/issues)
- 💬 [Discussions](https://github.com/fyyyn1210/starter-toolkit/discussions)

---

Made with ❤️ by R Putera Pratama

**Happy coding! 🎉**