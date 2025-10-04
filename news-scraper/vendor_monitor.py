#!/usr/bin/env python3
"""
Vendor Status Page Monitor for Beacon Compliance Intelligence Platform
Monitors critical vendor status pages and creates compliance alerts for outages
"""

import requests
import json
import sqlite3
import os
from datetime import datetime
from typing import List, Dict, Optional
import time

class VendorStatusMonitor:
    def __init__(self):
        self.base_url = "http://localhost:3000"
        self.db_path = os.path.join(os.path.dirname(__file__), "data", "vendor_status.db")
        self.ensure_data_directory()
        self.init_database()
        
        # Critical vendor status pages
        self.vendors = [
            {
                "name": "Amazon Web Services",
                "status_url": "https://status.aws.amazon.com/data.json",
                "type": "aws",
                "criticality": "Critical",
                "category": "Cloud Infrastructure"
            },
            {
                "name": "Microsoft Azure", 
                "status_url": "https://status.azure.com/en-us/status/history/",
                "type": "azure",
                "criticality": "Critical",
                "category": "Cloud Infrastructure"
            },
            {
                "name": "Google Cloud Platform",
                "status_url": "https://status.cloud.google.com/incidents.json",
                "type": "gcp",
                "criticality": "Critical", 
                "category": "Cloud Infrastructure"
            },
            {
                "name": "Stripe",
                "status_url": "https://status.stripe.com/api/v2/status.json",
                "type": "stripe",
                "criticality": "High",
                "category": "Payment Processing"
            },
            {
                "name": "Plaid",
                "status_url": "https://status.plaid.com/api/v2/status.json",
                "type": "plaid", 
                "criticality": "High",
                "category": "Financial Services"
            },
            {
                "name": "Salesforce",
                "status_url": "https://api.status.salesforce.com/v1/instances/status/preview",
                "type": "salesforce",
                "criticality": "Medium",
                "category": "CRM Platform"
            }
        ]
    
    def ensure_data_directory(self):
        """Ensure the data directory exists"""
        data_dir = os.path.dirname(self.db_path)
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
    
    def init_database(self):
        """Initialize SQLite database for storing vendor status"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS vendor_status (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vendor_name TEXT NOT NULL,
                status TEXT NOT NULL,
                incident_id TEXT,
                incident_title TEXT,
                incident_description TEXT,
                severity TEXT,
                started_at TEXT,
                resolved_at TEXT,
                checked_at TEXT,
                sent_to_api BOOLEAN DEFAULT FALSE
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def check_generic_status_page(self, vendor: Dict) -> List[Dict]:
        """Generic status page checker for most vendors"""
        try:
            print(f"Checking {vendor['name']} status...")
            
            headers = {
                'User-Agent': 'Beacon-Compliance-Monitor/1.0',
                'Accept': 'application/json'
            }
            
            response = requests.get(vendor['status_url'], headers=headers, timeout=10)
            
            if response.status_code != 200:
                return [{
                    'vendor_name': vendor['name'],
                    'status': 'Unknown',
                    'incident_title': 'Status Page Unavailable',
                    'incident_description': f'Unable to fetch status from {vendor["status_url"]} (HTTP {response.status_code})',
                    'severity': 'Medium',
                    'started_at': datetime.now().isoformat(),
                    'checked_at': datetime.now().isoformat()
                }]
            
            # Try to parse JSON response
            try:
                data = response.json()
            except json.JSONDecodeError:
                # If not JSON, assume operational
                return [{
                    'vendor_name': vendor['name'],
                    'status': 'Operational',
                    'incident_title': None,
                    'incident_description': None,
                    'severity': 'Info',
                    'checked_at': datetime.now().isoformat()
                }]
            
            # Parse different status page formats
            incidents = []
            
            if vendor['type'] == 'aws':
                incidents = self.parse_aws_status(data, vendor)
            elif vendor['type'] == 'stripe' or vendor['type'] == 'plaid':
                incidents = self.parse_statuspage_io(data, vendor)
            elif vendor['type'] == 'gcp':
                incidents = self.parse_gcp_status(data, vendor)
            else:
                # Generic parsing
                incidents = self.parse_generic_status(data, vendor)
            
            return incidents
            
        except Exception as e:
            print(f"Error checking {vendor['name']}: {e}")
            return [{
                'vendor_name': vendor['name'],
                'status': 'Error',
                'incident_title': 'Monitoring Error',
                'incident_description': f'Error checking vendor status: {str(e)}',
                'severity': 'Low',
                'started_at': datetime.now().isoformat(),
                'checked_at': datetime.now().isoformat()
            }]
    
    def parse_aws_status(self, data: Dict, vendor: Dict) -> List[Dict]:
        """Parse AWS status page format"""
        incidents = []
        
        # AWS uses a complex nested structure
        if 'current' in data:
            for region_data in data.get('current', []):
                if region_data.get('status') != 0:  # 0 = operational
                    incidents.append({
                        'vendor_name': vendor['name'],
                        'status': 'Incident',
                        'incident_id': f"aws-{region_data.get('region', 'unknown')}",
                        'incident_title': f"AWS {region_data.get('region', 'Unknown Region')} Issue",
                        'incident_description': region_data.get('message', 'Service disruption detected'),
                        'severity': 'High' if region_data.get('status') > 1 else 'Medium',
                        'started_at': datetime.now().isoformat(),
                        'checked_at': datetime.now().isoformat()
                    })
        
        if not incidents:
            incidents.append({
                'vendor_name': vendor['name'],
                'status': 'Operational',
                'checked_at': datetime.now().isoformat()
            })
        
        return incidents
    
    def parse_statuspage_io(self, data: Dict, vendor: Dict) -> List[Dict]:
        """Parse StatusPage.io format (used by Stripe, Plaid, etc.)"""
        incidents = []
        
        # Check overall status
        status = data.get('status', {})
        if status.get('indicator') != 'none':
            incidents.append({
                'vendor_name': vendor['name'],
                'status': 'Incident',
                'incident_title': status.get('description', 'Service Issue'),
                'incident_description': f"Overall status: {status.get('description', 'Unknown issue')}",
                'severity': 'High' if status.get('indicator') == 'major' else 'Medium',
                'started_at': datetime.now().isoformat(),
                'checked_at': datetime.now().isoformat()
            })
        
        if not incidents:
            incidents.append({
                'vendor_name': vendor['name'],
                'status': 'Operational',
                'checked_at': datetime.now().isoformat()
            })
        
        return incidents
    
    def parse_gcp_status(self, data: Dict, vendor: Dict) -> List[Dict]:
        """Parse Google Cloud Platform status format"""
        incidents = []
        
        # GCP returns list of incidents
        if isinstance(data, list):
            for incident in data:
                if incident.get('status') in ['open', 'investigating']:
                    incidents.append({
                        'vendor_name': vendor['name'],
                        'status': 'Incident',
                        'incident_id': incident.get('id'),
                        'incident_title': incident.get('summary', 'GCP Incident'),
                        'incident_description': incident.get('description', 'Service disruption'),
                        'severity': 'High' if 'major' in incident.get('severity', '').lower() else 'Medium',
                        'started_at': incident.get('created_at', datetime.now().isoformat()),
                        'checked_at': datetime.now().isoformat()
                    })
        
        if not incidents:
            incidents.append({
                'vendor_name': vendor['name'],
                'status': 'Operational',
                'checked_at': datetime.now().isoformat()
            })
        
        return incidents
    
    def parse_generic_status(self, data: Dict, vendor: Dict) -> List[Dict]:
        """Generic status parsing for unknown formats"""
        # Look for common status indicators
        status_indicators = ['status', 'state', 'health', 'operational']
        incident_indicators = ['incidents', 'issues', 'problems', 'outages']
        
        incidents = []
        
        # Check for incidents
        for key in incident_indicators:
            if key in data and data[key]:
                incidents_data = data[key]
                if isinstance(incidents_data, list) and len(incidents_data) > 0:
                    for incident in incidents_data[:3]:  # Limit to 3 most recent
                        incidents.append({
                            'vendor_name': vendor['name'],
                            'status': 'Incident',
                            'incident_title': str(incident.get('title', incident.get('name', 'Service Issue'))),
                            'incident_description': str(incident.get('description', incident.get('summary', 'Service disruption detected'))),
                            'severity': 'Medium',
                            'started_at': datetime.now().isoformat(),
                            'checked_at': datetime.now().isoformat()
                        })
        
        if not incidents:
            incidents.append({
                'vendor_name': vendor['name'],
                'status': 'Operational',
                'checked_at': datetime.now().isoformat()
            })
        
        return incidents
    
    def save_vendor_status(self, incidents: List[Dict]) -> int:
        """Save vendor status to local database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        saved_count = 0
        for incident in incidents:
            try:
                cursor.execute('''
                    INSERT INTO vendor_status 
                    (vendor_name, status, incident_id, incident_title, incident_description, 
                     severity, started_at, resolved_at, checked_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    incident.get('vendor_name'),
                    incident.get('status'),
                    incident.get('incident_id'),
                    incident.get('incident_title'),
                    incident.get('incident_description'),
                    incident.get('severity'),
                    incident.get('started_at'),
                    incident.get('resolved_at'),
                    incident.get('checked_at')
                ))
                saved_count += 1
            except Exception as e:
                print(f"Error saving incident: {e}")
        
        conn.commit()
        conn.close()
        return saved_count
    
    def send_to_nextjs_api(self, incidents: List[Dict]) -> bool:
        """Send vendor incidents to Next.js API for processing"""
        try:
            # Filter only incidents (not operational status)
            actual_incidents = [i for i in incidents if i.get('status') != 'Operational']
            
            if not actual_incidents:
                return True  # No incidents to report
            
            # Transform incidents for the API
            api_alerts = []
            for incident in actual_incidents:
                api_alert = {
                    'title': f"{incident['vendor_name']}: {incident.get('incident_title', 'Service Issue')}",
                    'description': incident.get('incident_description', 'Vendor service disruption detected'),
                    'source': f"{incident['vendor_name']} Status Page",
                    'category': 'Vendor',
                    'subcategory': 'Service Outage',
                    'riskLevel': incident.get('severity', 'Medium'),
                    'severity': 'Critical' if incident.get('severity') == 'High' else 'Warning',
                    'status': 'Active',
                    'priority': 1 if incident.get('severity') == 'High' else 2,
                    'publishedAt': incident.get('started_at', datetime.now().isoformat()),
                    'tags': ['vendor-monitoring', 'service-outage', incident['vendor_name'].lower().replace(' ', '-')]
                }
                api_alerts.append(api_alert)
            
            # Send to Next.js API
            response = requests.post(
                f"{self.base_url}/api/news/process",
                json={'articles': api_alerts},
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                print(f"Successfully sent {len(api_alerts)} vendor alerts to Next.js API")
                return True
            else:
                print(f"Failed to send vendor alerts to API: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"Error sending vendor alerts to Next.js API: {e}")
            return False
    
    def run_monitoring_cycle(self):
        """Run a complete vendor monitoring cycle"""
        print("🚀 Starting vendor status monitoring cycle...")
        
        all_incidents = []
        
        # Check each vendor
        for vendor in self.vendors:
            incidents = self.check_generic_status_page(vendor)
            all_incidents.extend(incidents)
            
            # Small delay between checks
            time.sleep(1)
        
        if all_incidents:
            # Save to local database
            saved_count = self.save_vendor_status(all_incidents)
            print(f"💾 Saved {saved_count} vendor status records to database")
            
            # Send incidents to API
            if self.send_to_nextjs_api(all_incidents):
                print(f"✅ Sent vendor status updates to Next.js application")
            else:
                print("❌ Failed to send vendor status updates to Next.js application")
        
        print("✅ Vendor monitoring cycle completed")

def main():
    monitor = VendorStatusMonitor()
    monitor.run_monitoring_cycle()

if __name__ == "__main__":
    main()
