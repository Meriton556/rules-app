// API functions for interacting with the Flask backend

export interface Rule {
  id?: number;
  title: string;
  description: string;
  content: string;
  bestPractices?: string; // Optional field for best practices
  author: string;
  authorName: string;
  tags: string[];
  category: string;
  createdAt?: string;
  count?: string;
  isOfficial?: boolean; // Flag for official rules
  isGeneral?: boolean; // Flag for general rules
}

export interface Category {
  id?: number;
  name: string;
  description: string;
  icon?: string;
}

// Fetch all rules from the backend
export const fetchRules = async (): Promise<Rule[]> => {
  const response = await fetch('http://localhost:8000/api/rules');
  if (!response.ok) {
    throw new Error('Failed to fetch rules');
  }
  return response.json();
};

// Create a new rule
export const createRule = async (ruleData: Omit<Rule, 'id' | 'createdAt' | 'count'>): Promise<Rule> => {
  try {
    console.log("Creating rule with data:", JSON.stringify(ruleData, null, 2));
    
    // Validate isOfficial data type
    if (ruleData.isOfficial !== undefined) {
      console.log("isOfficial type:", typeof ruleData.isOfficial);
      
      // Ensure isOfficial is boolean
      if (typeof ruleData.isOfficial !== 'boolean') {
        ruleData.isOfficial = Boolean(ruleData.isOfficial);
        console.log("Converted isOfficial to boolean:", ruleData.isOfficial);
      }
    }
    
    // Validate isGeneral data type
    if (ruleData.isGeneral !== undefined) {
      console.log("isGeneral type:", typeof ruleData.isGeneral);
      
      // Ensure isGeneral is boolean
      if (typeof ruleData.isGeneral !== 'boolean') {
        ruleData.isGeneral = Boolean(ruleData.isGeneral);
        console.log("Converted isGeneral to boolean:", ruleData.isGeneral);
      }
    }
    
    const response = await fetch('http://localhost:8000/api/rules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ruleData),
    });
    
    let responseBody: any;
    
    try {
      responseBody = await response.json();
      console.log("Response body:", responseBody);
    } catch (parseError) {
      console.error("Failed to parse response:", parseError);
      responseBody = null;
    }
    
    if (!response.ok) {
      const errorMessage = responseBody?.error || response.statusText || 'Unknown error';
      console.error("API Error Response:", errorMessage);
      throw new Error(`Failed to create rule: ${errorMessage}`);
    }
    
    return responseBody;
  } catch (error) {
    console.error("Error in createRule:", error);
    throw error;
  }
};

// Fetch all categories
export const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch('http://localhost:8000/api/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
}; 