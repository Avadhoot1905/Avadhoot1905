/**
 * List all available Gemini models for your API key
 * Run this in your terminal: node list-gemini-models.mjs
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

console.log('🔍 Listing Available Gemini Models\n');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function listModels() {
  try {
    console.log('Fetching available models...\n');
    
    // Make a direct API call to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Available Models:\n');
    
    if (data.models && data.models.length > 0) {
      data.models.forEach((model) => {
        console.log(`📦 ${model.name}`);
        console.log(`   Display Name: ${model.displayName}`);
        console.log(`   Description: ${model.description}`);
        console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
        console.log('');
      });
      
      console.log('\n📝 Recommended models for generateContent:');
      const generateModels = data.models.filter(m => 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      
      generateModels.forEach(model => {
        const modelName = model.name.replace('models/', '');
        console.log(`   - ${modelName}`);
      });
      
    } else {
      console.log('⚠️  No models found');
    }
    
  } catch (error) {
    console.error('❌ Error fetching models:', error.message);
  }
}

listModels();
