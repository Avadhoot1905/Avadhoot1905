/**
 * Quick Input Diagnostic
 * Paste this in console while Messages app is open
 */

console.clear();
console.log('🔍 Quick Input Diagnostic\n');

const input = document.querySelector('input[placeholder*="Message"]') || 
              document.querySelector('input[placeholder*="message"]') ||
              document.querySelector('input[placeholder*="Loading"]');

if (!input) {
  console.error('❌ INPUT NOT FOUND');
  console.log('Is Messages app open?');
} else {
  console.log('✅ Input found');
  
  // Check 1: Disabled?
  console.log('\n1. Disabled:', input.disabled);
  if (input.disabled) {
    console.warn('⚠️  INPUT IS DISABLED!');
    console.log('Placeholder:', input.placeholder);
    if (input.placeholder.includes('Loading')) {
      console.error('🐛 BUG: isLoadingHistory is stuck at true');
      console.log('Fix: Force enable...');
      input.disabled = false;
      console.log('✅ Now try typing');
    }
  }
  
  // Check 2: Value
  console.log('\n2. Current value:', `"${input.value}"`);
  
  // Check 3: Try to set value
  console.log('\n3. Testing value setting...');
  const originalValue = input.value;
  input.value = 'TEST123';
  console.log('   Set to "TEST123"');
  console.log('   Actually shows:', `"${input.value}"`);
  
  if (input.value === 'TEST123') {
    console.log('   ✅ Value setting works');
    
    // Trigger React update
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    
    setTimeout(() => {
      if (input.value === 'TEST123') {
        console.warn('   ⚠️  React not clearing value - state update issue');
      } else {
        console.log('   ✅ React responded to value change');
      }
      // Restore
      input.value = originalValue;
    }, 500);
  } else {
    console.error('   ❌ Cannot set value!');
  }
  
  // Check 4: Event listeners
  console.log('\n4. Testing keyboard events...');
  console.log('   Click the input and type a letter...');
  console.log('   (Watch for onChange/onInput/Key pressed logs)');
  
  // Check 5: Focus
  console.log('\n5. Testing focus...');
  input.focus();
  if (document.activeElement === input) {
    console.log('   ✅ Input can receive focus');
  } else {
    console.error('   ❌ Input cannot receive focus');
  }
}

console.log('\n' + '='.repeat(50));
console.log('NOW TRY TYPING IN THE INPUT');
console.log('Watch console for onChange/onInput logs');
console.log('='.repeat(50));
