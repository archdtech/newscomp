import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface RiskAssessmentRequest {
  alert: {
    title: string;
    description: string;
    category: string;
    source: string;
    affectedSystems?: string[];
    businessImpact?: string;
  };
  organizationContext?: {
    industry: string;
    size: 'small' | 'medium' | 'large';
    geography: string[];
    complianceMaturity: 'basic' | 'developing' | 'mature';
  };
}

interface RiskAssessmentResponse {
  overallRiskScore: number; // 0-100
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  riskFactors: {
    financial: number; // 0-100
    operational: number; // 0-100
    reputational: number; // 0-100
    regulatory: number; // 0-100
  };
  immediateActions: string[];
  mitigationStrategies: string[];
  monitoringRecommendations: string[];
  timeline: {
    assessment: string;
    mitigation: string;
    verification: string;
  };
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: RiskAssessmentRequest = await request.json();
    const { alert, organizationContext } = body;

    if (!alert || !alert.title || !alert.description) {
      return NextResponse.json(
        { error: 'Alert with title and description is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Create comprehensive risk assessment prompt
    const systemPrompt = `You are an expert risk assessment specialist with deep knowledge of compliance, operational risk, and business impact analysis.

Your task is to assess the risk level of the provided compliance alert and provide detailed recommendations.

Provide your analysis in JSON format with the following structure:
{
  "overallRiskScore": 0-100 (higher = more risky),
  "riskLevel": "Critical, High, Medium, or Low",
  "riskFactors": {
    "financial": 0-100 (potential financial impact),
    "operational": 0-100 (operational disruption impact),
    "reputational": 0-100 (reputational damage impact),
    "regulatory": 0-100 (regulatory penalty impact)
  },
  "immediateActions": ["Array of immediate actions to take"],
  "mitigationStrategies": ["Array of long-term mitigation strategies"],
  "monitoringRecommendations": ["Array of ongoing monitoring recommendations"],
  "timeline": {
    "assessment": "Timeline for initial assessment",
    "mitigation": "Timeline for mitigation implementation",
    "verification": "Timeline for verification of effectiveness"
  },
  "confidence": 0.0-1.0 confidence score in your assessment
}

Risk Level Guidelines:
- CRITICAL (90-100): Immediate threat to business continuity, significant regulatory penalties, major operational disruption
- HIGH (70-89): Substantial impact requiring immediate attention, potential for significant penalties
- MEDIUM (40-69): Moderate impact requiring attention within weeks/months, manageable penalties
- LOW (0-39): Minor impact, long-term implementation, minimal penalties

Consider the organization context in your assessment if provided.`;

    const assessmentPrompt = `Please assess the risk for this compliance alert:

Alert Details:
- Title: ${alert.title}
- Description: ${alert.description}
- Category: ${alert.category}
- Source: ${alert.source}
- Affected Systems: ${alert.affectedSystems?.join(', ') || 'Not specified'}
- Business Impact: ${alert.businessImpact || 'Not specified'}

${organizationContext ? `
Organization Context:
- Industry: ${organizationContext.industry}
- Size: ${organizationContext.size}
- Geography: ${organizationContext.geography.join(', ')}
- Compliance Maturity: ${organizationContext.complianceMaturity}
` : 'No specific organization context provided.'}

Provide a comprehensive risk assessment in the specified JSON format.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: assessmentPrompt
        }
      ],
      temperature: 0.2, // Lower temperature for consistent risk assessment
      max_tokens: 2500
    });

    const assessmentText = completion.choices[0]?.message?.content;
    
    if (!assessmentText) {
      throw new Error('No risk assessment generated');
    }

    // Parse the JSON response
    let assessment: RiskAssessmentResponse;
    try {
      // Extract JSON from the response
      const jsonMatch = assessmentText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      assessment = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse risk assessment response:', parseError);
      console.error('Raw response:', assessmentText);
      
      // Fallback response if parsing fails
      assessment = {
        overallRiskScore: 50,
        riskLevel: 'Medium',
        riskFactors: {
          financial: 50,
          operational: 50,
          reputational: 50,
          regulatory: 50
        },
        immediateActions: ['Manual risk assessment required'],
        mitigationStrategies: ['Develop custom mitigation plan'],
        monitoringRecommendations: ['Regular monitoring recommended'],
        timeline: {
          assessment: '1-2 weeks',
          mitigation: '1-3 months',
          verification: '3-6 months'
        },
        confidence: 0.3
      };
    }

    // Validate and normalize the response
    const validatedResponse: RiskAssessmentResponse = {
      overallRiskScore: Math.max(0, Math.min(100, assessment.overallRiskScore || 50)),
      riskLevel: ['Critical', 'High', 'Medium', 'Low'].includes(assessment.riskLevel) ? assessment.riskLevel : 'Medium',
      riskFactors: {
        financial: Math.max(0, Math.min(100, assessment.riskFactors?.financial || 50)),
        operational: Math.max(0, Math.min(100, assessment.riskFactors?.operational || 50)),
        reputational: Math.max(0, Math.min(100, assessment.riskFactors?.reputational || 50)),
        regulatory: Math.max(0, Math.min(100, assessment.riskFactors?.regulatory || 50))
      },
      immediateActions: Array.isArray(assessment.immediateActions) ? assessment.immediateActions : [],
      mitigationStrategies: Array.isArray(assessment.mitigationStrategies) ? assessment.mitigationStrategies : [],
      monitoringRecommendations: Array.isArray(assessment.monitoringRecommendations) ? assessment.monitoringRecommendations : [],
      timeline: {
        assessment: assessment.timeline?.assessment || '1-2 weeks',
        mitigation: assessment.timeline?.mitigation || '1-3 months',
        verification: assessment.timeline?.verification || '3-6 months'
      },
      confidence: typeof assessment.confidence === 'number' ? Math.max(0, Math.min(1, assessment.confidence)) : 0.5
    };

    // Add metadata
    const response = {
      ...validatedResponse,
      metadata: {
        assessedAt: new Date().toISOString(),
        alertCategory: alert.category,
        alertSource: alert.source,
        hasOrganizationContext: !!organizationContext
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Risk assessment error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to assess risk',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}