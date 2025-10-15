/**
 * Messages Input Field Debugger
 * Copy and paste this entire script into your browser console
 * while the Messages app is open
 */

console.clear();
console.log('🔍 Messages Input Field Debugger\n');
console.log('═'.repeat(60));

// Step 1: Find the input field
console.log('\n1️⃣ Finding input field...');
const input = document.querySelector('input[placeholder*="Message"]') || 
              document.querySelector('input[placeholder*="message"]') ||
              document.querySelector('input[type="text"]');

if (!input) {
  console.error('❌ Input field not found! Is Messages app open?');
  console.log('\n💡 Try:');
  console.log('   1. Close Messages app');
  console.log('   2. Open Messages app again');
  console.log('   3. Run this script again');
} else {
  console.log('✅ Input field found:', input);
  
  // Step 2: Check disabled state
  console.log('\n2️⃣ Checking disabled state...');
  console.log('   Disabled:', input.disabled);
  if (input.disabled) {
    console.warn('⚠️  Input is DISABLED');
    console.log('   Attempting to enable...');
    input.disabled = false;
    console.log('   ✅ Input enabled');
  } else {
    console.log('   ✅ Input is NOT disabled');
  }
  
  // Step 3: Check computed styles
  console.log('\n3️⃣ Checking CSS styles...');
  const styles = window.getComputedStyle(input);
  const issues = [];
  
  console.log('   pointer-events:', styles.pointerEvents);
  if (styles.pointerEvents === 'none') {
    issues.push('pointer-events is "none"');
  }
  
  console.log('   display:', styles.display);
  if (styles.display === 'none') {
    issues.push('display is "none"');
  }
  
  console.log('   visibility:', styles.visibility);
  if (styles.visibility === 'hidden') {
    issues.push('visibility is "hidden"');
  }
  
  console.log('   opacity:', styles.opacity);
  if (parseFloat(styles.opacity) === 0) {
    issues.push('opacity is 0');
  }
  
  console.log('   user-select:', styles.userSelect);
  if (styles.userSelect === 'none') {
    issues.push('user-select is "none"');
  }
  
  console.log('   z-index:', styles.zIndex);
  
  if (issues.length > 0) {
    console.warn('⚠️  Found CSS issues:');
    issues.forEach(issue => console.log('      -', issue));
  } else {
    console.log('   ✅ No CSS issues found');
  }
  
  // Step 4: Check for overlays
  console.log('\n4️⃣ Checking for overlaying elements...');
  const rect = input.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const elementAtPoint = document.elementFromPoint(centerX, centerY);
  
  console.log('   Input position:', { x: rect.left, y: rect.top, width: rect.width, height: rect.height });
  console.log('   Element at input center:', elementAtPoint);
  
  if (elementAtPoint !== input && !input.contains(elementAtPoint)) {
    console.warn('⚠️  Another element is covering the input!');
    console.log('   Covering element:', elementAtPoint);
    console.log('   Covering element z-index:', window.getComputedStyle(elementAtPoint).zIndex);
  } else {
    console.log('   ✅ No overlay detected');
  }
  
  // Step 5: Check parent elements
  console.log('\n5️⃣ Checking parent elements...');
  let parent = input.parentElement;
  let level = 1;
  while (parent && level <= 5) {
    const parentStyles = window.getComputedStyle(parent);
    const parentIssues = [];
    
    if (parentStyles.pointerEvents === 'none') parentIssues.push('pointer-events: none');
    if (parentStyles.display === 'none') parentIssues.push('display: none');
    if (parentStyles.visibility === 'hidden') parentIssues.push('visibility: hidden');
    
    if (parentIssues.length > 0) {
      console.warn(`   ⚠️  Level ${level} parent has issues:`, parentIssues);
      console.log('      Element:', parent);
    }
    
    parent = parent.parentElement;
    level++;
  }
  console.log('   ✅ Parent check complete');
  
  // Step 6: Check React state
  console.log('\n6️⃣ Checking React state...');
  console.log('   Session ID:', sessionStorage.getItem('chat-session-id') || 'Not set');
  
  // Step 7: Try to focus
  console.log('\n7️⃣ Attempting to focus input...');
  try {
    input.focus();
    console.log('   ✅ Focus successful');
    console.log('   Active element:', document.activeElement === input ? 'Input is focused' : 'Input is NOT focused');
  } catch (e) {
    console.error('   ❌ Focus failed:', e.message);
  }
  
  // Step 8: Try to type
  console.log('\n8️⃣ Simulating keyboard input...');
  try {
    input.value = 'Test';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    console.log('   ✅ Programmatic input successful');
    console.log('   Current value:', input.value);
    
    // Clear test input
    setTimeout(() => {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, 1000);
  } catch (e) {
    console.error('   ❌ Programmatic input failed:', e.message);
  }
}

// Summary
console.log('\n═'.repeat(60));
console.log('🎯 SUMMARY\n');

if (!input) {
  console.log('❌ PROBLEM: Input field not found');
  console.log('   Solution: Make sure Messages app is open');
} else if (input.disabled) {
  console.log('⚠️  PROBLEM: Input was disabled (now fixed)');
  console.log('   Try typing now!');
} else {
  console.log('✅ Input field appears to be functional');
  console.log('\n📝 Next steps:');
  console.log('   1. Click on the input field');
  console.log('   2. Try typing');
  console.log('   3. If still not working, check the detailed output above');
}

console.log('\n💡 Quick fixes to try:');
console.log('   • Refresh the page (Cmd+R or F5)');
console.log('   • Close and reopen Messages app');
console.log('   • Try clicking directly on the input field');
console.log('   • Check if any browser extensions are blocking input');

console.log('\n═'.repeat(60));
console.log('Debugger complete! Check output above for issues.\n');
