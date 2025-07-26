const fs = require('fs');
const path = require('path');

// 测试SQL解析
const schemaPath = path.join(__dirname, 'config', 'schema.sql');
console.log('📂 Reading schema from:', schemaPath);

if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found:', schemaPath);
    process.exit(1);
}

const schemaSql = fs.readFileSync(schemaPath, 'utf8');
console.log('📄 Schema file content:');
console.log('='.repeat(50));
console.log(schemaSql);
console.log('='.repeat(50));

// 按分号分割SQL语句
const statements = schemaSql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

console.log('\n🔍 Parsed statements:');
statements.forEach((stmt, i) => {
    console.log(`\n--- Statement ${i + 1} ---`);
    console.log(stmt);
    console.log('Contains CREATE TABLE:', stmt.toUpperCase().includes('CREATE TABLE'));
});
