import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface WorkflowRequest {
  regulatoryRequirements: string[];
  riskLevel: 'High' | 'Medium' | 'Low';
  industry: string;
  organizationSize: 'small' | 'medium' | 'large';
  timeline?: string;
  budget?: string;
  teamSize?: number;
}

interface WorkflowResponse {
  workflow: {
    phases: Array<{
      name: string;
      description: string;
      duration: string;
      tasks: Array<{
        title: string;
        description: string;
        assignedRole: string;
        dependencies?: string[];
        deliverables: string[];
        estimatedHours: number;
      }>;
      milestones: string[];
      risks: string[];
    }>;
  };
  resourceRequirements: {
    personnel: Array<{
      role: string;
      responsibilities: string[];
      timeCommitment: string;
      skillsRequired: string[];
    }>;
    tools: Array<{
      name: string;
      purpose: string;
      priority: 'essential' | 'recommended' | 'optional';
    }>;
    budget: {
      estimatedRange: string;
      breakdown: Array<{
        category: string;
        description: string;
        estimatedCost: string;
      }>;
    };
  };
  monitoringAndReporting: {
    kpis: Array<{
      metric: string;
      target: string;
      frequency: string;
    }>;
    reportingSchedule: Array<{
      type: string;
      audience: string[];
      frequency: string;
      format: string;
    }>;
    escalationPaths: Array<{
      trigger: string;
      escalationLevel: string;
      timeframe: string;
    }>;
  };
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: WorkflowRequest = await request.json();
    const { 
      regulatoryRequirements, 
      riskLevel, 
      industry, 
      organizationSize,
      timeline,
      budget,
      teamSize
    } = body;

    if (!regulatoryRequirements || !Array.isArray(regulatoryRequirements) || regulatoryRequirements.length === 0) {
      return NextResponse.json(
        { error: 'Regulatory requirements array is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Create comprehensive workflow generation prompt
    const systemPrompt = `You are an expert compliance project manager with extensive experience in implementing compliance workflows across different industries and organization sizes.

Your task is to generate a comprehensive compliance implementation workflow based on the provided regulatory requirements and organizational context.

Provide your response in JSON format with the following structure:
{
  "workflow": {
    "phases": [
      {
        "name": "Phase name",
        "description": "Phase description",
        "duration": "Estimated duration",
        "tasks": [
          {
            "title": "Task title",
            "description": "Task description",
            "assignedRole": "Role responsible",
            "dependencies": ["task dependencies"],
            "deliverables": ["expected deliverables"],
            "estimatedHours": number
          }
        ],
        "milestones": ["key milestones"],
        "risks": ["potential risks"]
      }
    ]
  },
  "resourceRequirements": {
    "personnel": [
      {
        "role": "Role title",
        "responsibilities": ["key responsibilities"],
        "timeCommitment": "time commitment",
        "skillsRequired": ["required skills"]
      }
    ],
    "tools": [
      {
        "name": "Tool name",
        "purpose": "Tool purpose",
        "priority": "essential|recommended|optional"
      }
    ],
    "budget": {
      "estimatedRange": "cost range",
      "breakdown": [
        {
          "category": "category name",
          "description": "description",
          "estimatedCost": "estimated cost"
        }
      ]
    }
  },
  "monitoringAndReporting": {
    "kpis": [
      {
        "metric": "KPI name",
        "target": "target value",
        "frequency": "measurement frequency"
      }
    ],
    "reportingSchedule": [
      {
        "type": "report type",
        "audience": ["target audience"],
        "frequency": "reporting frequency",
        "format": "report format"
      }
    ],
    "escalationPaths": [
      {
        "trigger": "escalation trigger",
        "escalationLevel": "escalation level",
        "timeframe": "timeframe"
      }
    ]
  },
  "confidence": 0.0-1.0 confidence score
}

Consider the organization size, risk level, and industry context when designing the workflow. For high-risk requirements, include more rigorous controls and monitoring.`;

    const workflowPrompt = `Generate a comprehensive compliance implementation workflow for the following requirements:

Regulatory Requirements:
${regulatoryRequirements.map((req, index) => `${index + 1}. ${req}`).join('\n')}

Context:
- Risk Level: ${riskLevel}
- Industry: ${industry}
- Organization Size: ${organizationSize}
${timeline ? `- Timeline: ${timeline}` : ''}
${budget ? `- Budget: ${budget}` : ''}
${teamSize ? `- Team Size: ${teamSize} people` : ''}

Generate a detailed, actionable workflow that addresses all regulatory requirements. The workflow should be practical for a ${organizationSize} organization in the ${industry} industry with ${riskLevel} risk level requirements.

Provide the complete workflow in the specified JSON format.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: workflowPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    });

    const workflowText = completion.choices[0]?.message?.content;
    
    if (!workflowText) {
      throw new Error('No workflow generated');
    }

    // Parse the JSON response
    let workflow: WorkflowResponse;
    try {
      // Extract JSON from the response
      const jsonMatch = workflowText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      workflow = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse workflow response:', parseError);
      console.error('Raw response:', workflowText);
      
      // Fallback response if parsing fails
      workflow = {
        workflow: {
          phases: [{
            name: 'Implementation Phase',
            description: 'General compliance implementation',
            duration: '3-6 months',
            tasks: [{
              title: 'Requirements Analysis',
              description: 'Analyze regulatory requirements',
              assignedRole: 'Compliance Officer',
              deliverables: ['Requirements document'],
              estimatedHours: 40
            }],
            milestones: ['Requirements documented'],
            risks: ['Resource constraints']
          }]
        },
        resourceRequirements: {
          personnel: [{
            role: 'Compliance Officer',
            responsibilities: ['Oversight'],
            timeCommitment: '50%',
            skillsRequired: ['Compliance knowledge']
          }],
          tools: [{
            name: 'Compliance Management System',
            purpose: 'Track compliance activities',
            priority: 'essential'
          }],
          budget: {
            estimatedRange: '$50,000 - $100,000',
            breakdown: [{
              category: 'Personnel',
              description: 'Staff costs',
              estimatedCost: '$40,000 - $80,000'
            }]
          }
        },
        monitoringAndReporting: {
          kpis: [{
            metric: 'Compliance Rate',
            target: '100%',
            frequency: 'Monthly'
          }],
          reportingSchedule: [{
            type: 'Status Report',
            audience: ['Management'],
            frequency: 'Monthly',
            format: 'Written report'
          }],
          escalationPaths: [{
            trigger: 'Non-compliance',
            escalationLevel: 'Executive',
            timeframe: '24 hours'
          }]
        },
        confidence: 0.3
      };
    }

    // Validate and normalize the response
    const validatedResponse: WorkflowResponse = {
      workflow: {
        phases: Array.isArray(workflow.workflow?.phases) ? workflow.workflow.phases : [],
      },
      resourceRequirements: {
        personnel: Array.isArray(workflow.resourceRequirements?.personnel) ? workflow.resourceRequirements.personnel : [],
        tools: Array.isArray(workflow.resourceRequirements?.tools) ? workflow.resourceRequirements.tools : [],
        budget: workflow.resourceRequirements?.budget || {
          estimatedRange: 'TBD',
          breakdown: []
        }
      },
      monitoringAndReporting: {
        kpis: Array.isArray(workflow.monitoringAndReporting?.kpis) ? workflow.monitoringAndReporting.kpis : [],
        reportingSchedule: Array.isArray(workflow.monitoringAndReporting?.reportingSchedule) ? workflow.monitoringAndReporting.reportingSchedule : [],
        escalationPaths: Array.isArray(workflow.monitoringAndReporting?.escalationPaths) ? workflow.monitoringAndReporting.escalationPaths : []
      },
      confidence: typeof workflow.confidence === 'number' ? Math.max(0, Math.min(1, workflow.confidence)) : 0.5
    };

    // Add metadata
    const response = {
      ...validatedResponse,
      metadata: {
        generatedAt: new Date().toISOString(),
        requirementCount: regulatoryRequirements.length,
        riskLevel,
        industry,
        organizationSize
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Workflow generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate compliance workflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}