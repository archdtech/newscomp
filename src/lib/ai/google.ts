import { GoogleGenerativeAI } from '@google/generative-ai'

const GOOGLE_AI_API_KEY = 'AIzaSyB7BWGSIc5PbGnJiyR0IgldRRc74b-tBhM'
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY)

export interface ComplianceAlert {
  title: string
  description: string
  source: string
  category: string
  riskLevel: string
}

export interface AIAnalysis {
  summary: string[]
  keyRequirements: string[]
  recommendations: string[]
  riskAssessment: string
  impactAnalysis: string
  deadlines: string[]
}

export async function generateComplianceSummary(alert: ComplianceAlert): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `
As a compliance expert, create a 3-bullet summary of this compliance alert for busy compliance managers:

Title: ${alert.title}
Description: ${alert.description}
Source: ${alert.source}
Category: ${alert.category}
Risk Level: ${alert.riskLevel}

Provide exactly 3 bullet points that answer:
1. What happened?
2. Why does this matter for compliance?
3. What action is needed?

Format as:
• [First bullet point]
• [Second bullet point]  
• [Third bullet point]

Keep each bullet under 25 words and focus on actionable insights.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse the bullet points
    const bullets = text
      .split('\n')
      .filter(line => line.trim().startsWith('•'))
      .map(line => line.replace('•', '').trim())
      .slice(0, 3) // Ensure exactly 3 bullets
    
    return bullets.length === 3 ? bullets : [
      'New compliance requirement identified',
      'Review impact on current processes',
      'Assess implementation timeline'
    ]
    
  } catch (error) {
    console.error('Error generating compliance summary:', error)
    return [
      'New compliance alert requires attention',
      'Review details and assess impact',
      'Take appropriate action based on risk level'
    ]
  }
}

export async function generateComplianceChecklist(alert: ComplianceAlert): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `
Create a compliance action checklist for this alert:

Title: ${alert.title}
Description: ${alert.description}
Source: ${alert.source}
Category: ${alert.category}
Risk Level: ${alert.riskLevel}

Generate 5-7 specific, actionable checklist items that a compliance team should complete. 
Focus on practical steps like:
- Documentation requirements
- Team notifications
- Process updates
- Deadline tracking
- Risk assessments

Format as simple checklist items without bullet points or numbers.
Each item should be a clear, actionable task.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse checklist items
    const items = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#'))
      .slice(0, 7) // Limit to 7 items
    
    return items.length > 0 ? items : [
      'Review alert details and source documentation',
      'Assess impact on current compliance processes',
      'Notify relevant team members and stakeholders',
      'Update compliance documentation and procedures',
      'Set implementation timeline and deadlines',
      'Monitor for additional updates or changes'
    ]
    
  } catch (error) {
    console.error('Error generating compliance checklist:', error)
    return [
      'Review alert details and source documentation',
      'Assess impact on current compliance processes',
      'Notify relevant team members and stakeholders',
      'Update compliance documentation and procedures'
    ]
  }
}

export async function generateRiskAssessment(alert: ComplianceAlert): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `
Provide a concise risk assessment for this compliance alert:

Title: ${alert.title}
Description: ${alert.description}
Source: ${alert.source}
Category: ${alert.category}
Risk Level: ${alert.riskLevel}

Analyze:
1. Potential financial impact
2. Regulatory consequences
3. Operational risks
4. Timeline urgency

Provide a 2-3 sentence risk assessment focusing on the most critical concerns.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()
    
    return text || 'This compliance alert requires review to assess potential regulatory and operational impacts.'
    
  } catch (error) {
    console.error('Error generating risk assessment:', error)
    return 'This compliance alert requires review to assess potential regulatory and operational impacts.'
  }
}

export async function generateRecommendations(alert: ComplianceAlert): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `
Generate 3-5 specific recommendations for addressing this compliance alert:

Title: ${alert.title}
Description: ${alert.description}
Source: ${alert.source}
Category: ${alert.category}
Risk Level: ${alert.riskLevel}

Provide actionable recommendations that include:
- Immediate actions
- Medium-term planning
- Long-term considerations
- Stakeholder involvement

Format as clear, actionable recommendations without bullet points.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse recommendations
    const recommendations = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#'))
      .slice(0, 5) // Limit to 5 recommendations
    
    return recommendations.length > 0 ? recommendations : [
      'Conduct immediate impact assessment',
      'Engage legal and compliance teams',
      'Review and update relevant policies',
      'Establish monitoring and reporting procedures'
    ]
    
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return [
      'Conduct immediate impact assessment',
      'Engage legal and compliance teams',
      'Review and update relevant policies'
    ]
  }
}

export async function generateFullAnalysis(alert: ComplianceAlert): Promise<AIAnalysis> {
  try {
    console.log(`Generating AI analysis for: ${alert.title}`)
    
    const [summary, keyRequirements, recommendations, riskAssessment] = await Promise.all([
      generateComplianceSummary(alert),
      generateComplianceChecklist(alert),
      generateRecommendations(alert),
      generateRiskAssessment(alert)
    ])
    
    return {
      summary,
      keyRequirements,
      recommendations,
      riskAssessment,
      impactAnalysis: riskAssessment, // Use risk assessment as impact analysis
      deadlines: [] // Will be populated based on alert content
    }
    
  } catch (error) {
    console.error('Error generating full AI analysis:', error)
    
    // Return fallback analysis
    return {
      summary: [
        'New compliance alert requires attention',
        'Review details and assess impact',
        'Take appropriate action based on risk level'
      ],
      keyRequirements: [
        'Review alert details and source documentation',
        'Assess impact on current compliance processes',
        'Notify relevant team members and stakeholders'
      ],
      recommendations: [
        'Conduct immediate impact assessment',
        'Engage legal and compliance teams',
        'Review and update relevant policies'
      ],
      riskAssessment: 'This compliance alert requires review to assess potential impacts.',
      impactAnalysis: 'Impact analysis pending detailed review.',
      deadlines: []
    }
  }
}
