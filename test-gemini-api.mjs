/**
 * Gemini API Test & Diagnosis
 * Run this in your terminal: node test-gemini-api.js
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Test different model names
const modelsToTest = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-pro-latest',
];

console.log('🧪 Testing Gemini API Models\n');
console.log('API Key:', process.env.GEMINI_API_KEY ? `✅ Set (${process.env.GEMINI_API_KEY.substring(0, 10)}...)` : '❌ Missing');
console.log('');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function testModel(modelName) {
  try {
    console.log(`Testing: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const result = await model.generateContent('Say hi in 3 words');
    const response = await result.response;
    const text = response.text();
    
    console.log(`✅ SUCCESS: ${modelName}`);
    console.log(`   Response: ${text}\n`);
    return true;
  } catch (error) {
    console.log(`❌ FAILED: ${modelName}`);
    console.log(`   Error: ${error.message}`);
    if (error.status) console.log(`   Status: ${error.status}`);
    console.log('');
    return false;
  }
}

async function runTests() {
  console.log('Testing all model names...\n');
  
  for (const model of modelsToTest) {
    await testModel(model);
  }
  
  console.log('\n✅ Test complete!');
  console.log('\nRecommendation: Use the first model that succeeded.');
}

runTests().catch(console.error);
