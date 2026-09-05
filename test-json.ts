import fs from 'fs';
import { modulSchema } from './lib/validators';

const data = JSON.parse(fs.readFileSync('module.json', 'utf8'));

const result = modulSchema.safeParse(data);

if (!result.success) {
  console.log('Validation Errors:');
  console.log(JSON.stringify(result.error.issues, null, 2));
} else {
  console.log('JSON is valid!');
}
