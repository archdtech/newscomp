#!/usr/bin/env node

/**
 * Beacon MVP Testing Script
 * Tests all core functionality of the Beacon Compliance Intelligence Platform
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const TESTS = [];

// Test configuration
const config = {
  baseUrl: BASE_URL,
  timeout: 10000,
  verbose: true
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }[type] || '📋';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

async function testEndpoint(name, url, options = {}) {
  try {
    log(`Testing ${name}...`);
    
    const response = await fetch(`${config.baseUrl}${url}`, {
      timeout: config.timeout,
      ...options
    });
    
    const data = await response.json();
    
    if (response.ok) {
      log(`${name} - SUCCESS`, 'success');
      if (config.verbose) {
        console.log('Response:', JSON.stringify(data, null, 2));
      }
      return { success: true, data };
    } else {
      log(`${name} - FAILED (${response.status})`, 'error');
      console.log('Error:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    log(`${name} - ERROR: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

// Test definitions
TESTS.push({
  name: 'Health Check',
  test: () => testEndpoint('Health Check', '/api/health')
});

TESTS.push({
  name: 'Compliance Alerts API',
  test: () => testEndpoint('Compliance Alerts', '/api/alerts')
});

TESTS.push({
  name: 'News API',
  test: () => testEndpoint('News API', '/api/news')
});

TESTS.push({
  name: 'News Statistics API',
  test: () => testEndpoint('News Statistics', '/api/news/stats')
});

TESTS.push({
  name: 'AI Alert Generation',
  test: () => testEndpoint('AI Alert Generation', '/api/alerts/ai-generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: 'New GDPR regulation requires enhanced data protection measures for EU companies',
      category: 'Regulatory'
    })
  })
});

TESTS.push({
  name: 'Email Digest Generation',
  test: () => testEndpoint('Email Digest', '/api/email/digest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'send-to-user'
    })
  })
});

// Main test runner
async function runTests() {
  log('🚀 Starting Beacon MVP Test Suite');
  log(`Testing against: ${config.baseUrl}`);
  
  const results = {
    total: TESTS.length,
    passed: 0,
    failed: 0,
    errors: []
  };
  
  for (const test of TESTS) {
    try {
      const result = await test.test();
      
      if (result.success) {
        results.passed++;
      } else {
        results.failed++;
        results.errors.push({
          test: test.name,
          error: result.error
        });
      }
    } catch (error) {
      results.failed++;
      results.errors.push({
        test: test.name,
        error: error.message
      });
      log(`Test "${test.name}" threw an exception: ${error.message}`, 'error');
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  log(`Total Tests: ${results.total}`);
  log(`Passed: ${results.passed}`, 'success');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'error' : 'success');
  
  if (results.errors.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.errors.forEach(error => {
      console.log(`  • ${error.test}: ${JSON.stringify(error.error)}`);
    });
  }
  
  const successRate = Math.round((results.passed / results.total) * 100);
  log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'success' : 'warning');
  
  if (successRate >= 80) {
    log('🎉 MVP is ready for deployment!', 'success');
  } else {
    log('⚠️ MVP needs attention before deployment', 'warning');
  }
  
  return results;
}

// Additional system checks
async function checkSystemRequirements() {
  log('🔍 Checking System Requirements');
  
  const checks = [
    {
      name: 'Node.js Version',
      check: () => {
        const version = process.version;
        const major = parseInt(version.slice(1).split('.')[0]);
        return { success: major >= 18, info: version };
      }
    },
    {
      name: 'Environment Variables',
      check: () => {
        const required = ['DATABASE_URL'];
        const missing = required.filter(env => !process.env[env]);
        return { 
          success: missing.length === 0, 
          info: missing.length > 0 ? `Missing: ${missing.join(', ')}` : 'All present'
        };
      }
    }
  ];
  
  for (const check of checks) {
    const result = check.check();
    log(`${check.name}: ${result.info}`, result.success ? 'success' : 'warning');
  }
}

// Run the tests
async function main() {
  try {
    await checkSystemRequirements();
    console.log('\n');
    
    const results = await runTests();
    
    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
    
  } catch (error) {
    log(`Test suite failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Handle command line arguments
if (process.argv.includes('--help')) {
  console.log(`
Beacon MVP Test Suite

Usage: node test-mvp.js [options]

Options:
  --help          Show this help message
  --quiet         Reduce output verbosity
  --url <url>     Test against different base URL

Examples:
  node test-mvp.js
  node test-mvp.js --quiet
  node test-mvp.js --url http://localhost:3001
  `);
  process.exit(0);
}

if (process.argv.includes('--quiet')) {
  config.verbose = false;
}

const urlIndex = process.argv.indexOf('--url');
if (urlIndex !== -1 && process.argv[urlIndex + 1]) {
  config.baseUrl = process.argv[urlIndex + 1];
}

// Run the main function
if (require.main === module) {
  main();
}

module.exports = { runTests, testEndpoint };
