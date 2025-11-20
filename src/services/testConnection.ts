import { checkBackendHealth, getServices, getAvailableTimeSlots } from './appointmentService';

// Test script to verify backend connectivity
async function testBackendConnection() {
  console.log('🔄 Testing appointment service backend connectivity...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const healthResult = await checkBackendHealth();
    console.log(`   Health check: ${healthResult ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (!healthResult) {
      console.log('   ❌ Cannot proceed with other tests - backend is not healthy');
      return false;
    }

    // Test 2: Get Services
    console.log('\n2. Testing services endpoint...');
    const servicesResult = await getServices();
    if (servicesResult.success) {
      console.log(`   ✅ Services loaded: ${servicesResult.data?.length} services found`);
      console.log(`   📋 Available services: ${servicesResult.data?.map(s => s.name).join(', ')}`);
    } else {
      console.log(`   ❌ Services failed: ${servicesResult.error}`);
    }

    // Test 3: Get Time Slots
    console.log('\n3. Testing time slots endpoint...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const testDate = tomorrow.toISOString().split('T')[0];
    
    const timeSlotsResult = await getAvailableTimeSlots(testDate);
    if (timeSlotsResult.success) {
      console.log(`   ✅ Time slots loaded: ${timeSlotsResult.data?.length} slots found for ${testDate}`);
    } else {
      console.log(`   ❌ Time slots failed: ${timeSlotsResult.error}`);
    }

    console.log('\n🎉 Backend connectivity test completed!');
    return true;

  } catch (error) {
    console.error('\n💥 Unexpected error during testing:', error);
    return false;
  }
}

// Usage instructions
console.log(`
📋 Backend Connection Test Script
=================================

To test the backend connection:

1. Ensure your appointment service is running on port 8084
2. Run this script from your frontend project:
   
   // In browser console or Node.js environment
   testBackendConnection();

3. Check the console output for connection status

Expected endpoints:
- Health: http://localhost:8084/actuator/health
- Services: http://localhost:8084/api/v1/services  
- Time Slots: http://localhost:8084/api/v1/timeslots?date=YYYY-MM-DD
- Bookings: http://localhost:8084/api/v1/bookings
`);

export { testBackendConnection };