// Test script to verify API endpoints
import fetch from 'node-fetch'

const API_BASE_URL = 'http://localhost:5000/api'

async function testAPI() {
  console.log('🧪 Testing API endpoints...')
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...')
    const healthResponse = await fetch(`${API_BASE_URL}/health`)
    const healthData = await healthResponse.json()
    console.log('Health check result:', healthData)
    
    // Test registration endpoint
    console.log('\n2. Testing registration endpoint...')
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'testpass123',
      school: 'Test School',
      county: 'Test County'
    }
    
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    })
    
    console.log('Registration status:', registerResponse.status)
    if (registerResponse.ok) {
      const registerData = await registerResponse.json()
      console.log('Registration successful:', { ...registerData, token: '***' })
      
      // Test login with the created user
      console.log('\n3. Testing login endpoint...')
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      })
      
      console.log('Login status:', loginResponse.status)
      if (loginResponse.ok) {
        const loginData = await loginResponse.json()
        console.log('Login successful:', { ...loginData, token: '***' })
      } else {
        const errorData = await loginResponse.text()
        console.log('Login failed:', errorData)
      }
    } else {
      const errorData = await registerResponse.text()
      console.log('Registration failed:', errorData)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testAPI() 