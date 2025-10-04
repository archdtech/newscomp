import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface RegulatorySearchRequest {
  query: string;
  jurisdiction?: string;
  regulatoryBody?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  category?: string;
  limit?: number;
}

interface RegulatorySearchResponse {
  results: Array<{
    url: string;
    name: string;
    snippet: string;
    hostName: string;
    rank: number;
    date: string;
    favicon: string;
    relevanceScore: number;
    category: string;
    riskLevel: 'High' | 'Medium' | 'Low' | 'Unknown';
  }>;
  searchMetadata: {
    query: string;
    totalResults: number;
    searchTime: string;
    filters: {
      jurisdiction?: string;
      regulatoryBody?: string;
      category?: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: RegulatorySearchRequest = await request.json();
    const { 
      query, 
      jurisdiction, 
      regulatoryBody, 
      dateRange,
      category,
      limit = 10 
    } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Construct enhanced search query based on filters
    let enhancedQuery = query;
    
    if (jurisdiction) {
      enhancedQuery += ` ${jurisdiction} jurisdiction`;
    }
    
    if (regulatoryBody) {
      enhancedQuery += ` ${regulatoryBody}`;
    }
    
    if (category) {
      enhancedQuery += ` ${category} compliance regulation`;
    }

    // Add time-based filters if specified
    if (dateRange) {
      enhancedQuery += ` after:${dateRange.start} before:${dateRange.end}`;
    }

    // Add regulatory search terms
    enhancedQuery += ' (regulation OR compliance OR regulatory OR enforcement OR guidance OR policy)';

    console.log('Enhanced search query:', enhancedQuery);

    const searchResults = await zai.functions.invoke("web_search", {
      query: enhancedQuery,
      num: limit
    });

    if (!searchResults || !Array.isArray(searchResults)) {
      throw new Error('Invalid search results');
    }

    // Process and enhance search results with regulatory context
    const processedResults = await Promise.all(
      searchResults.map(async (result, index) => {
        // Analyze each result for regulatory relevance and risk
        const relevanceAnalysis = await analyzeRegulatoryRelevance(result, zai);
        
        return {
          ...result,
          relevanceScore: relevanceAnalysis.relevanceScore,
          category: relevanceAnalysis.category || 'General',
          riskLevel: relevanceAnalysis.riskLevel || 'Unknown'
        };
      })
    );

    // Sort by relevance score
    processedResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    const response: RegulatorySearchResponse = {
      results: processedResults,
      searchMetadata: {
        query: enhancedQuery,
        totalResults: processedResults.length,
        searchTime: new Date().toISOString(),
        filters: {
          jurisdiction,
          regulatoryBody,
          category
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Regulatory search error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to search regulatory information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function analyzeRegulatoryRelevance(result: any, zai: any) {
  try {
    const analysisPrompt = `Analyze this search result for regulatory relevance and categorize it:

Title: ${result.name}
Snippet: ${result.snippet}
URL: ${result.url}
Host: ${result.hostName}

Provide a JSON response with:
{
  "relevanceScore": 0.0-1.0 (how relevant to regulatory compliance),
  "category": "Regulation, Enforcement, Guidance, Policy, or General",
  "riskLevel": "High, Medium, Low, or Unknown",
  "keyTerms": ["array of key regulatory terms found"]
}`;

    const analysis = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a regulatory content analysis expert. Analyze search results for regulatory relevance and categorization.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const analysisText = analysis.choices[0]?.message?.content;
    
    if (!analysisText) {
      return {
        relevanceScore: 0.5,
        category: 'General',
        riskLevel: 'Unknown'
      };
    }

    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          relevanceScore: Math.max(0, Math.min(1, parsed.relevanceScore || 0.5)),
          category: parsed.category || 'General',
          riskLevel: parsed.riskLevel || 'Unknown'
        };
      }
    } catch (parseError) {
      console.warn('Failed to parse relevance analysis:', parseError);
    }

    return {
      relevanceScore: 0.5,
      category: 'General',
      riskLevel: 'Unknown'
    };

  } catch (error) {
    console.warn('Relevance analysis failed:', error);
    return {
      relevanceScore: 0.5,
      category: 'General',
      riskLevel: 'Unknown'
    };
  }
}