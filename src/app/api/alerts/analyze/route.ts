import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

interface AnalysisRequest {
  alertId: string;
  analysisType?: 'comprehensive' | 'risk' | 'compliance' | 'operational';
  organizationContext?: {
    industry: string;
    size: 'small' | 'medium' | 'large';
    geography: string[];
    complianceMaturity: 'basic' | 'developing' | 'mature';
  };
}

interface AnalysisResponse {
  alertId: string;
  analysisType: string;
  summary: string;
  keyRequirements: string[];
  riskAssessment: {
    overallRiskScore: number;
    riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
    riskFactors: {
      financial: number;
      operational: number;
      reputational: number;
      regulatory: number;
    };
  };
  complianceAnalysis: {
    applicableRegulations: string[];
    complianceGaps: string[];
    remediationSteps: string[];
    deadlines: string[];
  };
  businessImpact: {
    operational: string;
    financial: string;
    reputational: string;
    legal: string;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  monitoringPlan: {
    keyMetrics: string[];
    frequency: string;
    escalationTriggers: string[];
  };
  confidence: number;
  metadata: {
    analyzedAt: string;
    analysisDuration: number;
    modelVersion: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { alertId, analysisType = 'comprehensive', organizationContext } = body;

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    // Fetch the alert with related data
    const alert = await db.complianceAlert.findUnique({
      where: { id: alertId },
      include: {
        analysis: true,
        assignments: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        responses: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    const startTime = Date.now();
    const zai = await ZAI.create();

    // Create comprehensive analysis prompt
    const systemPrompt = `You are an expert compliance analyst with deep knowledge of regulatory requirements, risk assessment, and business impact analysis.

Your task is to provide a comprehensive analysis of the compliance alert. Consider the alert details, existing analysis, and any organizational context provided.

Provide your analysis in JSON format with the following structure:
{
  "summary": "Brief executive summary of the alert and its implications",
  "keyRequirements": ["Array of key compliance requirements affected"],
  "riskAssessment": {
    "overallRiskScore": 0-100,
    "riskLevel": "Critical|High|Medium|Low",
    "riskFactors": {
      "financial": 0-100,
      "operational": 0-100,
      "reputational": 0-100,
      "regulatory": 0-100
    }
  },
  "complianceAnalysis": {
    "applicableRegulations": ["Array of applicable regulations/laws"],
    "complianceGaps": ["Array of identified compliance gaps"],
    "remediationSteps": ["Array of specific remediation steps"],
    "deadlines": ["Array of compliance deadlines with timeframes"]
  },
  "businessImpact": {
    "operational": "Description of operational impact",
    "financial": "Description of financial impact",
    "reputational": "Description of reputational impact",
    "legal": "Description of legal impact"
  },
  "recommendations": {
    "immediate": ["Array of immediate actions (0-7 days)"],
    "shortTerm": ["Array of short-term actions (1-4 weeks)"],
    "longTerm": ["Array of long-term actions (1-6 months)"]
  },
  "monitoringPlan": {
    "keyMetrics": ["Array of key metrics to monitor"],
    "frequency": "Monitoring frequency recommendation",
    "escalationTriggers": ["Array of escalation triggers"]
  }
}

Risk Level Guidelines:
- CRITICAL (90-100): Immediate threat to business continuity, significant regulatory penalties, major operational disruption
- HIGH (70-89): Substantial impact requiring immediate attention, potential for significant penalties
- MEDIUM (40-69): Moderate impact requiring attention within weeks/months, manageable penalties
- LOW (0-39): Minor impact, long-term implementation, minimal penalties

Be specific, actionable, and consider both technical and business perspectives.`;

    const analysisPrompt = `Please provide a comprehensive ${analysisType} analysis for this compliance alert:

Alert Details:
- Title: ${alert.title}
- Description: ${alert.description}
- Category: ${alert.category}
- Risk Level: ${alert.riskLevel}
- Severity: ${alert.severity}
- Source: ${alert.source}
- Published: ${new Date(alert.publishedAt).toLocaleDateString()}

${alert.analysis ? `
Existing Analysis:
- Summary: ${alert.analysis.summary}
- Key Requirements: ${alert.analysis.keyRequirements ? JSON.parse(alert.analysis.keyRequirements as string).join(', ') : 'None provided'}
- Recommendations: ${alert.analysis.recommendations ? JSON.parse(alert.analysis.recommendations as string).join(', ') : 'None provided'}
` : ''}

${alert.assignments && alert.assignments.length > 0 ? `
Assignments:
${alert.assignments.map(a => `- Assigned to: ${a.user.name} (${a.user.email}), Status: ${a.status}`).join('\n')}
` : ''}

${alert.responses && alert.responses.length > 0 ? `
Recent Responses:
${alert.responses.map(r => `- ${r.type}: ${r.content.substring(0, 100)}...`).join('\n')}
` : ''}

${organizationContext ? `
Organization Context:
- Industry: ${organizationContext.industry}
- Size: ${organizationContext.size}
- Geography: ${organizationContext.geography.join(', ')}
- Compliance Maturity: ${organizationContext.complianceMaturity}
` : 'No specific organization context provided.'}

Please provide a comprehensive analysis in the specified JSON format.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 3000
    });

    const analysisText = completion.choices[0]?.message?.content;
    
    if (!analysisText) {
      throw new Error('No analysis generated');
    }

    // Parse the JSON response
    let analysisData;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      analysisData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse analysis response:', parseError);
      console.error('Raw response:', analysisText);
      
      // Fallback response
      analysisData = {
        summary: 'Analysis requires manual review due to processing issues.',
        keyRequirements: ['Manual review required'],
        riskAssessment: {
          overallRiskScore: 50,
          riskLevel: 'Medium',
          riskFactors: { financial: 50, operational: 50, reputational: 50, regulatory: 50 }
        },
        complianceAnalysis: {
          applicableRegulations: ['To be determined'],
          complianceGaps: ['Requires assessment'],
          remediationSteps: ['Manual review needed'],
          deadlines: ['To be determined']
        },
        businessImpact: {
          operational: 'Requires assessment',
          financial: 'Requires assessment',
          reputational: 'Requires assessment',
          legal: 'Requires assessment'
        },
        recommendations: {
          immediate: ['Manual review required'],
          shortTerm: ['Develop analysis plan'],
          longTerm: ['Implement monitoring system']
        },
        monitoringPlan: {
          keyMetrics: ['To be determined'],
          frequency: 'To be determined',
          escalationTriggers: ['To be determined']
        }
      };
    }

    const analysisDuration = Date.now() - startTime;

    // Create or update alert analysis in database
    const analysisRecord = await db.alertAnalysis.upsert({
      where: { alertId },
      update: {
        summary: analysisData.summary,
        keyRequirements: JSON.stringify(analysisData.keyRequirements),
        riskFactors: JSON.stringify(analysisData.riskAssessment.riskFactors),
        deadlines: JSON.stringify(analysisData.complianceAnalysis.deadlines),
        recommendations: JSON.stringify([...analysisData.recommendations.immediate, ...analysisData.recommendations.shortTerm, ...analysisData.recommendations.longTerm]),
        impactAnalysis: JSON.stringify(analysisData.businessImpact),
        confidence: 0.85,
        analysisType: analysisType
      },
      create: {
        alertId,
        summary: analysisData.summary,
        keyRequirements: JSON.stringify(analysisData.keyRequirements),
        riskFactors: JSON.stringify(analysisData.riskAssessment.riskFactors),
        deadlines: JSON.stringify(analysisData.complianceAnalysis.deadlines),
        recommendations: JSON.stringify([...analysisData.recommendations.immediate, ...analysisData.recommendations.shortTerm, ...analysisData.recommendations.longTerm]),
        impactAnalysis: JSON.stringify(analysisData.businessImpact),
        confidence: 0.85,
        analysisType: analysisType
      }
    });

    // Create monitoring log
    await db.monitoringLog.create({
      data: {
        source: 'ai_analysis',
        sourceId: alertId,
        status: 'success',
        message: 'Comprehensive AI analysis completed',
        metadata: JSON.stringify({
          analysisType,
          analysisDuration,
          confidence: 0.85,
          riskScore: analysisData.riskAssessment.overallRiskScore,
          riskLevel: analysisData.riskAssessment.riskLevel
        })
      }
    });

    // Format response
    const response: AnalysisResponse = {
      alertId,
      analysisType,
      summary: analysisData.summary,
      keyRequirements: analysisData.keyRequirements,
      riskAssessment: analysisData.riskAssessment,
      complianceAnalysis: analysisData.complianceAnalysis,
      businessImpact: analysisData.businessImpact,
      recommendations: analysisData.recommendations,
      monitoringPlan: analysisData.monitoringPlan,
      confidence: 0.85,
      metadata: {
        analyzedAt: new Date().toISOString(),
        analysisDuration,
        modelVersion: 'z-ai-web-dev-sdk-v1'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Compliance analysis error:', error);
    
    // Create error log
    try {
      await db.monitoringLog.create({
        data: {
          source: 'ai_analysis',
          sourceId: body.alertId || 'error',
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
          metadata: JSON.stringify({
            analysisType: body.analysisType,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          })
        }
      });
    } catch (logError) {
      console.error('Failed to create error log:', logError);
    }

    return NextResponse.json(
      { 
        error: 'Failed to analyze compliance alert',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    // Fetch existing analysis
    const analysis = await db.alertAnalysis.findUnique({
      where: { alertId },
      include: {
        alert: {
          select: {
            id: true,
            title: true,
            category: true,
            riskLevel: true,
            severity: true
          }
        }
      }
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found for this alert' },
        { status: 404 }
      );
    }

    // Format the response
    const formattedAnalysis = {
      alertId: analysis.alertId,
      alert: analysis.alert,
      analysisType: analysis.analysisType,
      summary: analysis.summary,
      keyRequirements: analysis.keyRequirements ? JSON.parse(analysis.keyRequirements as string) : [],
      riskFactors: analysis.riskFactors ? JSON.parse(analysis.riskFactors as string) : {},
      deadlines: analysis.deadlines ? JSON.parse(analysis.deadlines as string) : [],
      recommendations: analysis.recommendations ? JSON.parse(analysis.recommendations as string) : [],
      impactAnalysis: analysis.impactAnalysis ? JSON.parse(analysis.impactAnalysis as string) : {},
      confidence: analysis.confidence,
      metadata: {
        analyzedAt: analysis.updatedAt.toISOString(),
        analysisType: analysis.analysisType
      }
    };

    return NextResponse.json(formattedAnalysis);

  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}