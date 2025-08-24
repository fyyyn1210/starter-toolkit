module.exports = {
    name: 'Node.js + Express + Prisma',
    description: 'REST API with Prisma ORM',
    scripts: {
      "dev": "nodemon src/index.js",
      "start": "node src/index.js",
      "db:generate": "prisma generate",
      "db:push": "prisma db push"
    },
    dependencies: {
      "express": "^4.18.0",
      "@prisma/client": "^5.0.0",
      "cors": "^2.8.5",
      "dotenv": "^16.0.0"
    },
    devDependencies: {
      "nodemon": "^3.0.0",
      "prisma": "^5.0.0"
    },
    "steps" : ["menjaring","berkentod","jadi presiden"]
  };