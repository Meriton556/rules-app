'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import RuleForm from '@/components/rule-form';
import { createRule, Rule } from '@/app/api/rulesApi';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NewRulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnCategory = searchParams.get('returnCategory');
  const isOfficial = searchParams.get('isOfficial') === 'true';
  
  // Set initial form values
  const [formValues, setFormValues] = useState<Partial<Rule>>({
    title: '',
    description: '',
    content: '',
    category: returnCategory || '',
    tags: [],
    isOfficial: isOfficial,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (ruleData: Omit<Rule, 'id' | 'createdAt' | 'count'>) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      console.log("Submitting rule data to API:", JSON.stringify(ruleData, null, 2));
      const createdRule = await createRule(ruleData);
      console.log("Rule created successfully:", createdRule);
      
      // Force cache revalidation by adding a timestamp parameter
      const timestamp = new Date().getTime();
      
      // Redirect to the category page if returnCategory is provided, otherwise to rules
      if (returnCategory) {
        router.push(`/category/${returnCategory}?t=${timestamp}`);
      } else {
        router.push(`/rules?t=${timestamp}`);
      }
    } catch (err) {
      console.error("Error creating rule:", err);
      let errorMessage = 'Unknown error occurred';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(`Failed to create rule: ${errorMessage}`);
      setIsSubmitting(false);
    }
  };

  // Determine where to go back to
  const backLink = returnCategory ? `/category/${returnCategory}` : '/rules';

  const handleCancel = () => {
    router.push(backLink);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-900/40 overflow-auto flex items-center justify-center">
      <div className="max-w-3xl w-full px-4 py-8 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white bg-clip-text bg-gradient-to-r from-white to-zinc-400">
            Create New Rule
          </h1>
          <Button 
            variant="outline"
            onClick={handleCancel}
            className="text-zinc-400 hover:text-white border-zinc-700 hover:bg-zinc-800 transition-all"
            size="sm"
          >
            Cancel
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-800 text-red-300">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/30 rounded-xl shadow-xl overflow-hidden transition-all">
          <div className="p-6">
            <RuleForm 
              onSubmit={handleSubmit} 
              buttonText={isSubmitting ? 'Creating...' : 'Create Rule'}
              isSubmitting={isSubmitting}
              initialData={formValues}
            />
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
} 