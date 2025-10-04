import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateFullAnalysis } from '@/lib/ai/google';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      source = 'AI Analysis',
      category = 'Regulatory',
      autoAnalyze = true 
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Create alert object for AI analysis
    const alertForAnalysis = {
      title: `AI-Generated Alert: ${prompt.substring(0, 50)}...`,
      description: prompt,
      source: source,
      category: category,
      riskLevel: 'Medium'
    };

    // Generate AI analysis using Google AI
    console.log('Generating AI analysis for prompt:', prompt);
    const aiAnalysis = await generateFullAnalysis(alertForAnalysis);
    
    /*
    // Initialize ZAI SDK (commented out until properly configured)
    const zai = await ZAI.create();

    // Generate compliance alert using AI
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a compliance intelligence expert. Analyze the following input and generate a structured compliance alert with:
          - Title: Clear, concise title
          - Description: Detailed explanation
          - Risk Level: Critical, High, Medium, or Low
          - Severity: Critical, Warning, or Info
          - Category: Regulatory, Vendor Risk, Policy, or Enforcement
          - Tags: Relevant keywords for filtering
          - Key Requirements: List of key compliance requirements
          - Recommendations: Suggested actions
          - Impact Analysis: Business impact assessment

          Respond in JSON format with the following structure:
          {
            "title": "string",
            "description": "string",
            "riskLevel": "Critical|High|Medium|Low",
            "severity": "Critical|Warning|Info",
            "category": "Regulatory|Vendor Risk|Policy|Enforcement",
            "tags": ["string"],
            "keyRequirements": ["string"],
            "recommendations": ["string"],
            "impactAnalysis": "string"
          }`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });
    */

    // Create alert data from AI analysis
    const alertData = {
      title: alertForAnalysis.title,
      description: alertForAnalysis.description,
      riskLevel: alertForAnalysis.riskLevel,
      severity: 'Warning',
      category: category,
      tags: ['AI-generated', 'requires-review'],
      keyRequirements: aiAnalysis.keyRequirements,
      recommendations: aiAnalysis.recommendations,
      impactAnalysis: aiAnalysis.impactAnalysis,
      summary: aiAnalysis.summary,
      riskAssessment: aiAnalysis.riskAssessment
    };

    // Create compliance alert in database
    const alert = await db.complianceAlert.create({
      data: {
        title: alertData.title,
        description: alertData.description,
        source: source,
        category: alertData.category,
        riskLevel: alertData.riskLevel,
        severity: alertData.severity,
        publishedAt: new Date(),
        tags: alertData.tags && alertData.tags.length > 0 ? JSON.stringify(alertData.tags) : '[]',
        priority: getPriorityFromRiskLevel(alertData.riskLevel),
        metadata: {
          aiGenerated: true,
          originalPrompt: prompt,
          confidence: 0.8,
          aiAnalysisUsed: true
        }
      }
    });

    // Create AI analysis if requested
    if (autoAnalyze) {
      await db.alertAnalysis.create({
        data: {
          alertId: alert.id,
          summary: alertData.riskAssessment || alertData.description,
          keyRequirements: JSON.stringify(alertData.keyRequirements || []),
          riskFactors: JSON.stringify({
            riskLevel: alertData.riskLevel,
            severity: alertData.severity,
            category: alertData.category
          }),
          recommendations: JSON.stringify(alertData.recommendations || []),
          impactAnalysis: alertData.impactAnalysis || 'AI-generated analysis pending review',
          confidence: 0.8,
          analysisType: 'AI'
        }
      });
    }

    // Create monitoring log
    await db.monitoringLog.create({
      data: {
        source: 'ai_analysis',
        sourceId: alert.id,
        status: 'success',
        message: 'AI-generated compliance alert created',
        metadata: {
          prompt,
          aiAnalysisGenerated: true,
          processingTime: Date.now()
        }
      }
    });

    // Format response
    const formattedAlert = {
      ...alert,
      tags: alert.tags ? JSON.parse(alert.tags as string) : [],
      metadata: alert.metadata ? JSON.parse(alert.metadata as string) : null,
      analysis: autoAnalyze ? {
        keyRequirements: alertData.keyRequirements,
        recommendations: alertData.recommendations,
        impactAnalysis: alertData.impactAnalysis
      } : null
    };

    return NextResponse.json({
      alert: formattedAlert,
      message: 'AI-generated compliance alert created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating AI compliance alert:', error);
    
    // Create monitoring log for error
    try {
      await db.monitoringLog.create({
        data: {
          source: 'ai_analysis',
          sourceId: 'error',
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
          metadata: JSON.stringify({
            prompt: body.prompt,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          })
        }
      });
    } catch (logError) {
      console.error('Failed to create error log:', logError);
    }

    return NextResponse.json(
      { error: 'Failed to create AI compliance alert' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const category = searchParams.get('category');

    const where: any = {};
    if (category) {
      where.category = category;
    }

    // Get recent AI-generated alerts
    const alerts = await db.complianceAlert.findMany({
      where: {
        ...where,
        metadata: {
          path: '$.aiGenerated',
          equals: true
        }
      },
      include: {
        analysis: true,
        _count: {
          select: {
            assignments: true,
            responses: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: limit
    });

    // Format alerts
    const formattedAlerts = alerts.map(alert => ({
      ...alert,
      tags: alert.tags ? JSON.parse(alert.tags as string) : [],
      metadata: alert.metadata ? JSON.parse(alert.metadata as string) : null,
      keyRequirements: alert.analysis?.keyRequirements ? JSON.parse(alert.analysis.keyRequirements as string) : [],
      recommendations: alert.analysis?.recommendations ? JSON.parse(alert.analysis.recommendations as string) : []
    }));

    return NextResponse.json({
      alerts: formattedAlerts,
      count: formattedAlerts.length
    });

  } catch (error) {
    console.error('Error fetching AI alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI alerts' },
      { status: 500 }
    );
  }
}

function getPriorityFromRiskLevel(riskLevel: string): number {
  switch (riskLevel) {
    case 'Critical': return 1;
    case 'High': return 2;
    case 'Medium': return 3;
    case 'Low': return 4;
    default: return 3;
  }
}