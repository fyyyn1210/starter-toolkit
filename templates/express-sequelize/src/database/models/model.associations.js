import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const setupAssociations = async () => {
  const models = {};

  // 1. Auto-import semua model files
  const modelFiles = fs.readdirSync(__dirname)
    .filter(file => {
      return file !== 'model.associations.js' && file.endsWith('.model.js');
    });

  // 2. Load semua model
  console.log('📦 Loading models...');
  for (const file of modelFiles) {
    const modelName = path.basename(file, '.model.js');

    // FIX: Gunakan import.meta.resolve untuk Windows compatibility
    const modelPath = import.meta.resolve(`./${file}`);
    const model = (await import(modelPath)).default;

    models[model.name] = model;
    console.log(`  ✓ Loaded ${model.name} from ${file}`);
  }

  // Rest of your code...
  console.log('\n🔗 Setting up associations...');
  Object.keys(models).forEach(modelName => {
    const model = models[modelName];

    if (model.associate && typeof model.associate === 'function') {
      console.log(`  ✓ Associating ${modelName}`);
      model.associate(models);
    } else {
      console.log(`  ⚠️  ${modelName} has no associate method`);
    }
  });

  console.log('\n✅ All model associations setup completed');
  return models;
};

export default setupAssociations;