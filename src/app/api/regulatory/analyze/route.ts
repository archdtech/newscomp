import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface RegulatoryAnalysisRequest {
  content: string;
  type: 'regulation' | 'policy' | 'guidance' | 'enforcement';
  jurisdiction?: string;
  industry?: string;
}

interface RegulatoryAnalysisResponse {
  summary: string;
  keyRequirements: string[];
  riskLevel: 'High' | 'Medium' | 'Low';
  complianceDeadlines: string[];
  recommendedActions: string[];
  impactAnalysis: string;
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegulatoryAnalysisRequest = await request.json();
    const { content, type, jurisdiction = 'US', industry = 'General' } = body;

    if (!content || !type) {
      return NextResponse.json(
        { error: 'Content and type are required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Create system prompt based on document type and context
    const systemPrompt = `You are an expert compliance analyst specializing in ${type === 'enforcement' ? 'regulatory enforcement actions' : type === 'guidance' ? 'regulatory guidance' : type === 'policy' ? 'corporate compliance policies' : 'regulatory requirements'}.

Your task is to analyze the provided ${type} document and extract key compliance information.

Context:
- Jurisdiction: ${jurisdiction}
- Industry: ${industry}
- Document Type: ${type}

Provide a comprehensive analysis in JSON format with the following structure:
{
  "summary": "Brief executive summary of the document",
  "keyRequirements": ["Array of specific compliance requirements"],
  "riskLevel": "High, Medium, or Low based on impact and urgency",
  "complianceDeadlines": ["Array of specific deadlines mentioned or implied"],
  "recommendedActions": ["Array of recommended compliance actions"],
  "impactAnalysis": "Analysis of potential business impact",
  "confidence": 0.0-1.0 confidence score in your analysis
}

Be specific, actionable, and focus on compliance implications. Extract exact deadlines when mentioned. Assess risk level based on:
- HIGH: Significant fines, criminal liability, immediate action required
- MEDIUM: Moderate penalties, civil liability, action required within months
- LOW: Minor penalties, voluntary compliance, long-term implementation`;

    const analysisPrompt = `Please analyze this ${type} document for compliance requirements:

${content}

Provide the analysis in the specified JSON format.`;

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
      temperature: 0.3, // Lower temperature for more consistent analysis
      max_tokens: 2000
    });

    const analysisText = completion.choices[0]?.message?.content;
    
    if (!analysisText) {
      throw new Error('No analysis generated');
    }

    // Parse the JSON response
    let analysis: RegulatoryAnalysisResponse;
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      analysis = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse analysis response:', parseError);
      console.error('Raw response:', analysisText);
      
      // Fallback response if parsing fails
      analysis = {
        summary: analysisText.substring(0, 500) + '...',
        keyRequirements: ['Unable to parse requirements automatically'],
        riskLevel: 'Medium',
        complianceDeadlines: [],
        recommendedActions: ['Manual review required'],
        impactAnalysis: 'Unable to determine impact automatically',
        confidence: 0.3
      };
    }

    // Validate and normalize the response
    const validatedResponse: RegulatoryAnalysisResponse = {
      summary: analysis.summary || 'No summary available',
      keyRequirements: Array.isArray(analysis.keyRequirements) ? analysis.keyRequirements : [],
      riskLevel: ['High', 'Medium', 'Low'].includes(analysis.riskLevel) ? analysis.riskLevel : 'Medium',
      complianceDeadlines: Array.isArray(analysis.complianceDeadlines) ? analysis.complianceDeadlines : [],
      recommendedActions: Array.isArray(analysis.recommendedActions) ? analysis.recommendedActions : [],
      impactAnalysis: analysis.impactAnalysis || 'Impact analysis not available',
      confidence: typeof analysis.confidence === 'number' ? Math.max(0, Math.min(1, analysis.confidence)) : 0.5
    };

    // Add metadata
    const response = {
      ...validatedResponse,
      metadata: {
        analyzedAt: new Date().toISOString(),
        documentType: type,
        jurisdiction,
        industry,
        contentLength: content.length
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Regulatory analysis error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze regulatory document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}