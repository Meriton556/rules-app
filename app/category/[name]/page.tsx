"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Clipboard, Trash2, X, FileText, CheckCircle } from "lucide-react"
import { XLogo } from "@/components/x-logo"
import UserMenu from '@/components/auth/UserMenu'
import { fetchRules, Rule } from "@/app/api/rulesApi"
import { toast } from "@/components/ui/use-toast"
import { OfficialBadge } from "@/components/official-badge"

// Extend the Rule interface but keep the original id type
interface ExtendedRule extends Omit<Rule, 'id'> {
  id?: number; // Keep the original type from the API
  isOfficial?: boolean;
}

// Add a TagsTooltip component at the top level of the file
interface TooltipPosition {
  x: number;
  y: number;
}

interface TagsTooltipProps {
  tags: string[];
  isOpen: boolean;
  onClose: () => void;
  position: TooltipPosition;
}

function TagsTooltip({ tags, isOpen, onClose, position }: TagsTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Close tooltip when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      ref={tooltipRef}
      className="absolute z-50 bg-zinc-800 rounded-md shadow-lg p-2 text-xs text-zinc-400"
      style={{ 
        top: `${position.y - 15}px`,
        left: `${position.x + 60}px`,
        width: 'fit-content'
      }}
    >
      <div className="flex flex-col">
        {tags.map((tag: string, index: number) => (
          <span key={index}>{tag}</span>
        ))}
      </div>
    </div>
  );
}

// Add SaveDialog component at the top level of the file
interface SaveDialogProps {
  fileName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (fileName: string) => void;
}

function SaveDialog({ fileName, isOpen, onClose, onSave }: SaveDialogProps) {
  // Reset input value when dialog opens using useEffect
  const [inputFileName, setInputFileName] = useState(fileName);
  
  // Reset the input value whenever the dialog opens with a new fileName
  useEffect(() => {
    if (isOpen) {
      setInputFileName(fileName);
    }
  }, [isOpen, fileName]);
  
  if (!isOpen) return null;
  
  const handleSave = () => {
    if (inputFileName.trim() === '') {
      return;
    }
    onSave(inputFileName);
  };
  
  return (
    <>
      {/* White overlay for the entire page */}
      <div className="fixed inset-0 z-40 bg-white/70" />
      
      {/* Dialog positioned on top of the overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div style={{ backgroundColor: '#000000' }} className="w-[450px]">
          {/* Header with close button */}
          <div className="flex justify-between items-center px-5 pt-5 pb-3">
            <h2 className="text-white text-xl font-bold">Save Rule</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Dialog content */}
          <div className="px-5 pb-3">
            <p className="text-gray-400 text-base font-medium mb-4">Save a rule on cursor/rules directory.</p>
            
            {/* File name input */}
            <div className="mb-4">
              <label className="block text-gray-300 text-base font-semibold mb-2">File Name</label>
              <input 
                type="text"
                value={inputFileName}
                onChange={(e) => setInputFileName(e.target.value)}
                className="w-full text-white px-3 py-2 text-base font-medium border-0 focus:outline-none"
                style={{ 
                  backgroundColor: '#111111',
                  color: '#ffffff'
                }}
              />
            </div>
            
            {/* Footer text */}
            <p className="text-gray-400 text-base font-medium mb-5">
              The file will be saved with a .mdc extension.
            </p>
          </div>
          
          {/* Save button */}
          <div className="px-5 pb-5">
            <button
              onClick={handleSave}
              className="bg-white text-black px-8 py-1.5 text-base font-semibold hover:bg-gray-100"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const initialCategoryName = decodeURIComponent(params.name as string)
  const [activeCategoryName, setActiveCategoryName] = useState<string>(
    initialCategoryName ? decodeURIComponent(initialCategoryName.toString()) : "All"
  );
  
  // Check if we're on the "all" category initially
  useEffect(() => {
    if (initialCategoryName.toLowerCase() === 'all') {
      setFilterType('all');
      setShowAllCategories(true);
    } else if (initialCategoryName.toLowerCase() === 'officials') {
      setFilterType('official');
      setShowAllCategories(false);
    } else if (initialCategoryName.toLowerCase() === 'general') {
      setFilterType('general');
      setActiveCategoryName('General');
      setShowAllCategories(false);
    } else if (initialCategoryName.toLowerCase() === 'goldenpath') {
      setFilterType('goldenPath');
      setGoldenPathMode(true);
      setActiveCategoryName('Assemble Rules');
      setShowAllCategories(false);
    }
    
    // Store the current category in sessionStorage for persistence across refreshes
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('currentCategory', initialCategoryName);
    }
  }, [initialCategoryName]);
  
  // State for rules and loading
  const [rules, setRules] = useState<ExtendedRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Add state for search
  const [searchQuery, setSearchQuery] = useState("")
  
  // State for managing the current filter type
  const [filterType, setFilterType] = useState<'all' | 'official' | 'community' | 'goldenPath' | 'general' | null>(null)
  
  // Add state for selected rules in Golden Path mode
  const [selectedRules, setSelectedRules] = useState<ExtendedRule[]>([])
  
  // Add state for save dialog
  const [saveDialog, setSaveDialog] = useState({
    isOpen: false,
    fileName: '',
    ruleContent: '',
    rule: null as ExtendedRule | null
  });
  
  // Add state for preview mode in Golden Path
  const [showPreview, setShowPreview] = useState(false);
  
  // Add state for Golden Path mode
  const [isGoldenPathMode, setGoldenPathMode] = useState(false);
  
  // Add a user state at the top of the component function
  const [user, setUser] = useState<any>(null);
  
  // Add state for expanded categories and selected export target
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [selectedExportTarget, setSelectedExportTarget] = useState<string>("Cursor");
  
  // Add state for recent custom templates near other state declarations
  const [recentCustomTemplates, setRecentCustomTemplates] = useState<string[]>([]);
  
  // Modify the predefined templates array to be shorter
  const predefinedTemplates = [
    {
      name: "Python-PostgreSQL-React",
      categories: ["Python", "PostgreSQL", "React"]
    },
    {
      name: "React-TypeScript-Tailwind",
      categories: ["React", "TypeScript", "Tailwind"]
    }
  ];
  
  // Add state for selected template
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Add state for custom template
  const [customTemplate, setCustomTemplate] = useState('');
  
  // Add a useEffect to initialize expanded categories at component level
  useEffect(() => {
    // Get all categories from rules
    const categories = [...new Set(rules.map(rule => rule.category || 'Uncategorized'))];
    
    // Create initial expanded state - all collapsed by default
    const initialExpandedState: Record<string, boolean> = {};
    categories.forEach(category => {
      initialExpandedState[category] = false; // Set to false instead of true
    });
    
    // Set the initial state
    setExpandedCategories(initialExpandedState);
  }, [rules]); // Depend on rules array
  
  // Fetch rules from API
  useEffect(() => {
    const loadRules = async () => {
      try {
        setLoading(true)
        const data = await fetchRules()
        // Use the isOfficial property directly from the API response
        console.log("All rules loaded:", data);
        console.log("Official rules:", data.filter(rule => rule.isOfficial === true));
        setRules(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch rules:", err)
        setError("Failed to load rules from the backend.")
        setRules([])
      } finally {
        setLoading(false)
      }
    }
    
    // Update useEffect to always derive state from URL
    const path = window.location.pathname;
    
    // Clear any stored route preferences on any category page load
    if (typeof window !== 'undefined') {
      // Clear ALL related sessionStorage items to prevent any conflicts
      sessionStorage.removeItem('preferCategoryRoute');
      sessionStorage.removeItem('currentCategory');
    }
    
    loadRules();
  }, []);
  
  // Add a separate useEffect specifically for handling URL changes
  useEffect(() => {
    // This function handles the URL path changes and updates state accordingly
    const updateStateFromURL = () => {
      const path = window.location.pathname;
      const categoryMatch = path.match(/\/category\/([^\/]+)/i);
      
      if (categoryMatch) {
        const categoryFromURL = decodeURIComponent(categoryMatch[1]);
        console.log('URL category detected:', categoryFromURL);
        
        // Always update the active category based on the URL
        setActiveCategoryName(categoryFromURL);
        
        // Set states based on special categories
        if (categoryFromURL.toLowerCase() === 'general') {
          setFilterType('general');
          setShowAllCategories(false);
        } else if (categoryFromURL.toLowerCase() === 'officials') {
          setFilterType('official');
          setShowAllCategories(false);
        } else if (categoryFromURL.toLowerCase() === 'all') {
          setFilterType('all');
          setShowAllCategories(true);
        } else if (categoryFromURL.toLowerCase() === 'goldenpath') {
          setFilterType('goldenPath');
          setGoldenPathMode(true);
          setShowAllCategories(false);
        } else {
          // For regular categories
          setFilterType(null);
          setShowAllCategories(false);
        }
      }
    };
    
    // Call once on mount
    updateStateFromURL();
    
    // Also listen for popstate events (browser back/forward navigation)
    window.addEventListener('popstate', updateStateFromURL);
    
    // Clean up
    return () => window.removeEventListener('popstate', updateStateFromURL);
  }, []);
  
  // Filter rules by category
  const filteredRules = activeCategoryName.toLowerCase() === 'all' 
    ? rules.filter(rule => !rule.isGeneral) // If 'all' is selected, show all rules EXCEPT general rules
    : rules.filter(rule => 
    rule.category?.toLowerCase() === activeCategoryName.toLowerCase()
      );

  // Add loading state to handle transitions
  const [isLoading, setIsLoading] = useState(false)
  
  // State to track expanded cards
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})
  // State to track copy feedback
  const [copySuccess, setCopySuccess] = useState<Record<string, boolean>>({})
  
  // Calculate if any card is expanded
  const isAnyCardExpanded = Object.values(expandedCards).some(value => value === true)
  // Get the ID of the expanded card (if any)
  const expandedCardId = Object.keys(expandedCards).find(key => expandedCards[key] === true)
  
  // State to track if we're showing all categories
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  // Update URL when category changes but handle filtering client-side
  useEffect(() => {
    // Only update URL if category has changed from the initial load
    if (activeCategoryName !== initialCategoryName) {
      const encodedCategory = encodeURIComponent(activeCategoryName.toLowerCase())
      // Update URL without navigation
      window.history.pushState({}, '', `/category/${encodedCategory}`)
    }
    
    // Handle special "all" category
    if (activeCategoryName.toLowerCase() === 'all') {
      setFilterType('all');
      setShowAllCategories(true);
    }
    
    // Turn off loading after a brief delay for visual transition
    if (isLoading) {
      const timer = setTimeout(() => setIsLoading(false), 250)
      return () => clearTimeout(timer)
    }
  }, [activeCategoryName, initialCategoryName, isLoading])
  
  // Add popstate event listener to handle browser back/forward and refreshes correctly
  useEffect(() => {
    // Handle browser navigation events (back/forward) 
    const handlePopState = (event: PopStateEvent) => {
      // Get the current URL path to determine what to do
      const path = window.location.pathname;
      const categoryMatch = path.match(/\/category\/([^\/]+)/i);
      
      if (categoryMatch) {
        const categoryName = decodeURIComponent(categoryMatch[1]);
        
        // Set states accordingly based on category name
        if (categoryName.toLowerCase() === 'general') {
          setFilterType('general');
          setActiveCategoryName('General');
        } else if (categoryName.toLowerCase() === 'officials') {
          setFilterType('official');
          setActiveCategoryName('Officials');
        } else if (categoryName.toLowerCase() === 'all') {
          setFilterType('all');
          setShowAllCategories(true);
          setActiveCategoryName('All');
        } else if (categoryName.toLowerCase() === 'goldenpath') {
          setFilterType('goldenPath');
          setGoldenPathMode(true);
          setActiveCategoryName('Assemble Rules');
        } else {
          // For regular categories
          setFilterType(null);
          setActiveCategoryName(categoryName);
          setShowAllCategories(false);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Clean up listener
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Client-side category switching without page refresh
  const handleCategoryClick = (categoryName: string, skipLoadingState = false) => {
    if (categoryName.toLowerCase() === 'all') {
      setFilterType('all')
      setShowAllCategories(true)
      router.push(`/category/all`)
    } else if (categoryName.toLowerCase() === 'officials') {
      setFilterType('official')
      router.push(`/category/officials`)
    } else if (categoryName.toLowerCase() === 'general') {
      setFilterType('general')
      router.push(`/category/general`)
      // Clean up sessionStorage when navigating via UI
      sessionStorage.removeItem('preferCategoryRoute');
    } else if ((categoryName !== activeCategoryName || filterType === 'official') && !isLoading) {
      if (!skipLoadingState) {
        setIsLoading(true)
      }
      setActiveCategoryName(categoryName)
      // Reset filter type to null when changing categories
      setFilterType(null)
      // Always set showAllCategories to false when clicking a specific category
      setShowAllCategories(false)
      // Clear expanded state when changing categories only if we're not explicitly keeping it
      if (!skipLoadingState) {
        setExpandedCards({})
      }
    }
  }

  // Toggle card expansion
  const toggleCardExpansion = (id: string) => {
    setExpandedCards(prev => {
      // If this card is already expanded, close it
      if (prev[id]) {
        const newState = { ...prev };
        delete newState[id];
        
        // Reset scroll position of any scrolled content areas
        setTimeout(() => {
          const contentAreas = document.querySelectorAll('.content-area');
          contentAreas.forEach(area => {
            if (area instanceof HTMLElement) {
              area.scrollTop = 0;
            }
          });
        }, 50);
        
        return newState;
      }
      
      // Otherwise, expand this card and close all others
      return { [id]: true };
    })
    // Reset copy success state when toggling
    setCopySuccess(prev => ({
      ...prev,
      [id]: false
    }))
  }

  // Handle rule deletion with confirmation
  const handleDeleteRule = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmation = confirm('Are you sure you want to delete this rule?');
    
    if (confirmation) {
      try {
        // TODO: Implement delete API call
        setExpandedCards(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        // Refresh rules
        const loadRules = async () => {
          try {
            setLoading(true)
            const data = await fetchRules()
            // Use the isOfficial property directly from the API response
            setRules(data)
          } catch (err) {
            console.error("Failed to fetch rules:", err)
          } finally {
            setLoading(false)
          }
        }
        loadRules()
      } catch (error) {
        console.error('Error deleting rule:', error);
      }
    }
  }

  // Handle copying rule content to clipboard
  const handleCopyContent = (id: string, content: string, e: React.MouseEvent) => {
    e.stopPropagation()
    // Ensure content is a string
    const textToCopy = content
    
    try {
      // Use a more compatible approach for copying text
      const textArea = document.createElement('textarea')
      textArea.value = textToCopy
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      
      setCopySuccess(prev => ({
        ...prev,
        [id]: true
      }))
      // Reset success message after 2 seconds
      setTimeout(() => {
        setCopySuccess(prev => ({
          ...prev,
          [id]: false
        }))
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  // Count rules by category
  const getCategoryCount = (category: string): number => {
    return rules.filter(rule => rule.category?.toLowerCase() === category.toLowerCase()).length
  }

  // Get all unique categories with counts
  const categoriesWithCounts = Array.from(
    new Set(rules.map(rule => rule.category))
  ).filter(Boolean).map(category => ({
    name: category as string, // Type assertion to avoid undefined
    count: getCategoryCount(category as string) // Type assertion
  })).sort((a, b) => b.count - a.count)
  
  // Add any missing predefined categories with count 0
  const predefinedCategories = [
    "TypeScript", "React", "Next.js", "Python", "PHP", 
    "TailwindCSS", "Laravel", "C#", "JavaScript", 
    "Game Development", "Expo", "React Native", "Tailwind",
    "Vite", "Supabase", "Rust", "Web Development", "Flutter",
    "API", "Meta-Prompt", "SvelteKit", "SwiftUI", "Java", 
    "Apache Airflow", "Go", "Docker", "Kubernetes", "MongoDB",
    "PostgreSQL", "AWS", "Azure", "Google Cloud", "GraphQL",
    "Express.js", "Django", "Spring Boot", "Angular", "Vue.js",
    "Terraform", "Ansible", "Jenkins", "CI/CD", "Microservices",
    // New categories
    "React Coding Standards", "React Router", "Redux", "Zustand",
    "React Query", "Styled Components", "SASS/SCSS", "SQL", "NoSQL",
    "Graph", "Containerization", "Unit Testing", "Flask", "FastAPI",
    "Python/Spring", "Python/Spring Data JPA"
  ]
  
  predefinedCategories.forEach(cat => {
    if (!categoriesWithCounts.some(c => c.name === cat)) {
      categoriesWithCounts.push({ name: cat, count: 0 })
    }
  })

  // Capitalize first letter of category name
  const capitalizedCategoryName = activeCategoryName.charAt(0).toUpperCase() + activeCategoryName.slice(1).toLowerCase();

  // Add state for tag tooltip
  const [tagTooltip, setTagTooltip] = useState<{ 
    isOpen: boolean; 
    tags: string[]; 
    position: TooltipPosition;
  }>({ 
    isOpen: false, 
    tags: [], 
    position: { x: 0, y: 0 } 
  });
  
  // Function to handle showing more tags
  const handleShowMoreTags = (e: React.MouseEvent, tags: string[]) => {
    e.stopPropagation();
    // Get click position
    const rect = e.currentTarget.getBoundingClientRect();
    setTagTooltip({
      isOpen: true,
      tags,
      position: { 
        x: rect.left, 
        y: rect.top // Use top instead of bottom to position above
      }
    });
  };
  
  // Close tooltip
  const closeTooltip = () => {
    setTagTooltip(prev => ({ ...prev, isOpen: false }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-900/40">
        <div className="text-white">Loading rules...</div>
      </div>
    )
  }

  // Apply filtering based on selected filter and search query
  const filteredByTypeRules = filterType === 'official' 
    ? rules.filter(rule => {
        console.log(`Rule ${rule.id} - ${rule.title} isOfficial:`, rule.isOfficial);
        return rule.isOfficial === true;
      })
    : filterType === 'general'
      ? rules.filter(rule => rule.isGeneral === true)
    : filterType === 'all'
      ? (showAllCategories ? rules.filter(rule => !rule.isGeneral) : filteredRules) // Exclude general rules from 'all' view
      : filterType === 'goldenPath'
        ? rules // Show all rules when in Golden Path mode
        : (showAllCategories ? rules : filteredRules); // When filterType is null, show unfiltered
  
  // Apply search filtering - first check category matches, then tags, title, and content
  const searchFilteredRules = searchQuery.trim() === '' 
    ? filteredByTypeRules 
    : (() => {
        const query = searchQuery.toLowerCase();
        
        // First find exact category matches
        const categoryMatches = filteredByTypeRules.filter(rule => 
          rule.category && rule.category.toLowerCase() === query
        );
        
        // Then find partial category matches that aren't exact matches
        const partialCategoryMatches = filteredByTypeRules.filter(rule => 
          rule.category && 
          rule.category.toLowerCase().includes(query) && 
          rule.category.toLowerCase() !== query
        );
        
        // Then find tag matches that aren't already in category matches
        const alreadyMatchedIds = [...categoryMatches, ...partialCategoryMatches].map(r => r.id);
        const tagMatches = filteredByTypeRules.filter(rule => {
          // Skip if already matched by category
          if (alreadyMatchedIds.includes(rule.id)) return false;
          
          // Check if any tag matches
          return Array.isArray(rule.tags) && 
            rule.tags.some(tag => tag.toLowerCase().includes(query));
        });
        
        // Finally, check title and content for remaining rules
        const contentMatches = filteredByTypeRules.filter(rule => {
          // Skip if already matched
          if ([...alreadyMatchedIds, ...tagMatches.map(r => r.id)].includes(rule.id)) 
            return false;
          
          // Check title match
          const titleMatch = rule.title && rule.title.toLowerCase().includes(query);
          
          // Check content match
          let contentMatch = false;
          if (rule.content) {
            if (typeof rule.content === 'string') {
              contentMatch = rule.content.toLowerCase().includes(query);
            } else if (Array.isArray(rule.content)) {
              contentMatch = (rule.content as string[]).some((line: string) => 
                line.toLowerCase().includes(query)
              );
            }
          }
          
          // Check author match as lowest priority
          const authorMatch = rule.authorName && rule.authorName.toLowerCase().includes(query);
              
          return titleMatch || contentMatch || authorMatch;
        });
        
        // Combine all matches in priority order
        return [...categoryMatches, ...partialCategoryMatches, ...tagMatches, ...contentMatches];
      })();

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Function to toggle rule selection for Golden Path
  const toggleRuleSelection = (rule: ExtendedRule) => {
    setSelectedRules(prev => {
      const isSelected = prev.some(r => r.id === rule.id);
      const newSelectedRules = isSelected 
        ? prev.filter(r => r.id !== rule.id)
        : [...prev, rule];
      
      // Clear template selection if rules are deselected
      if (isSelected) {
        setSelectedTemplate(null);
      }
      
      return newSelectedRules;
    });
  };

  // Modified applyTemplate function to expand categories when selected
  const applyTemplate = (templateName: string, isCustom: boolean = false) => {
    let templateCategories: string[] = [];
    
    if (isCustom) {
      // Split custom template by hyphen and clean up each category
      templateCategories = templateName.split('-').map(cat => {
        // Handle special cases and normalize category names
        const normalized = cat.trim().toLowerCase();
        
        // Map common variations to their canonical form
        const categoryMappings: Record<string, string> = {
          'php': 'PHP',
          'react': 'React',
          'python': 'Python',
          // ... rest of the mappings ...
        };
        
        // Return the mapped category name or capitalize the first letter
        return categoryMappings[normalized] || 
          (cat.trim().charAt(0).toUpperCase() + cat.trim().slice(1).toLowerCase());
      });
    } else {
      // Find the predefined template
      const template = predefinedTemplates.find(t => t.name === templateName);
      if (!template) return;
      templateCategories = template.categories;
    }
    
    // Clear current selections
    setSelectedRules([]);
    
    // Expand only the categories in the template
    const newExpandedCategories = {...expandedCategories};
    // First collapse all categories
    Object.keys(newExpandedCategories).forEach(category => {
      newExpandedCategories[category] = false;
    });
    // Then expand only the selected template categories
    templateCategories.forEach(category => {
      newExpandedCategories[category] = true;
    });
    setExpandedCategories(newExpandedCategories);
    
    // Select rules for each category
    const newSelectedRules: ExtendedRule[] = [];
    
    // Process each category
    templateCategories.forEach(category => {
      // Get all rules in this category, case-insensitive matching
      const categoryRules = rules.filter(rule => 
        rule.category?.toLowerCase() === category.toLowerCase()
      );
      
      if (categoryRules.length > 0) {
        // First try to find official rules
        const officialRules = categoryRules.filter(rule => rule.isOfficial === true);
        
        if (officialRules.length > 0) {
          // Add up to 2 official rules
          newSelectedRules.push(officialRules[0]);
          if (officialRules.length > 1) {
            newSelectedRules.push(officialRules[1]);
          }
        } else {
          // If no official rules, add up to 2 community rules
          newSelectedRules.push(categoryRules[0]);
          if (categoryRules.length > 1) {
            newSelectedRules.push(categoryRules[1]);
          }
        }
      }
    });
    
    setSelectedRules(newSelectedRules);
    setSelectedTemplate(templateName);
  };

  // Create a function to generate combined content that respects the export target format
  const createCombinedContent = () => {
    if (selectedRules.length === 0) {
      return "";
    }

    // For Roocode - create a single combined file
    if (selectedExportTarget === "Roocode") {
      // Combine rule contents
      return selectedRules.map(rule => {
        const content = Array.isArray(rule.content) ? rule.content.join('\n') : rule.content || '';
        return `## ${rule.title || rule.category || 'Untitled Rule'}\n\n${content}\n\n`;
      }).join('---\n\n');
    } 
    // For Cursor/Cline - each rule gets its own complete file content
    else {
      // Get the currently selected rule or the first one
      const previewRule = selectedRules[0];
      const content = Array.isArray(previewRule.content) ? previewRule.content.join('\n') : previewRule.content || '';
      
      return `# AI Rules for {project-name}\n\n{project-description}\n\n## ${previewRule.title || previewRule.category || 'Untitled Rule'}\n\n${content}`;
    }
  };

  // Modify the createCombinedRule function to handle different export targets
  const createCombinedRule = async () => {
    if (selectedRules.length === 0) {
      return;
    }
    
    // Create filename for export
    const date = new Date().toISOString().split('T')[0];
    
    try {
      // For all export types - export as a zip file containing all rules
      // Dynamic import JSZip
      const JSZip = await import('jszip').then(module => module.default);
      const zip = new JSZip();
      
      // Common header content
      const headerContent = `# AI Rules for {project-name}\n\n{project-description}`;
      
      // Different folder and file extensions based on export target
      let folderPrefix = '';
      let fileExtension = '.md';
      
      if (selectedExportTarget === "Cursor") {
        folderPrefix = '.cursor/rules/';
        fileExtension = '.mdc';
      } else if (selectedExportTarget === "Cline") {
        folderPrefix = '.clinerules/';
        fileExtension = '.md';
      } else if (selectedExportTarget === "Roocode") {
        folderPrefix = '.roo/rules/';
        fileExtension = '.md';
      }
      
      // Add rules to the zip
      selectedRules.forEach((rule, index) => {
        const content = Array.isArray(rule.content) ? rule.content.join('\n') : rule.content || '';
        const ruleName = (rule.title || `rule-${index+1}`)
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        
        // Create file path based on export target
        const filePath = `${folderPrefix}${ruleName}${fileExtension}`;
        
        // Create full content with header for each rule
        const fullContent = `${headerContent}\n\n${content}`;
        
        // Add file to zip
        zip.file(filePath, fullContent);
      });
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({type: 'blob'});
      const zipUrl = URL.createObjectURL(zipBlob);
      
      // Create zip name based on export target
      const zipName = `${selectedExportTarget.toLowerCase()}-rules-${date}.zip`;
      
      // Download the zip file
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = zipName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(zipUrl);
      
      toast({
        title: "Rules exported as ZIP",
        description: `${selectedRules.length} rules exported to ${zipName}`
      });
    } catch (error) {
      console.error("Error creating zip file:", error);
      
      // Fallback to regular file export if JSZip fails
      if (selectedExportTarget === "Roocode") {
        // For Roocode - export as a single MD file with all rules
        const combinedContent = selectedRules.map(rule => {
          const content = Array.isArray(rule.content) ? rule.content.join('\n') : rule.content || '';
          return content;
        }).join('\n---\n');
        
        // Create the file for download
        const sanitizedTitle = "combined-rules";
        const filename = `${date}-${sanitizedTitle}.md`;
        const blob = new Blob([combinedContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        // Download the file
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: `Combined Rules Exported`,
          description: `Saved as ${filename}`
        });
      } else {
        // For Cursor/Cline - export each rule as a separate file
        let downloadDelay = 0;
        
        selectedRules.forEach((rule, index) => {
          const content = Array.isArray(rule.content) ? rule.content.join('\n') : rule.content || '';
          const ruleName = (rule.title || `rule-${index+1}`).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          const extension = selectedExportTarget === "Cursor" ? ".mdc" : ".md";
          const filename = `${ruleName}${extension}`;
          
          // Add the standard header to each file
          const finalContent = `# AI Rules for {project-name}\n\n{project-description}\n\n${content}`;
          
          // Create blob for this rule
          const blob = new Blob([finalContent], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          
          // Delay downloads slightly to prevent browsers from blocking them
          setTimeout(() => {
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, downloadDelay);
          
          downloadDelay += 500; // Add delay between downloads
        });
        
        toast({
          title: `${selectedRules.length} Rules Exported`,
          description: selectedExportTarget === "Cursor" 
            ? "Files saved with .mdc extension" 
            : "Files saved with .md extension"
        });
      }
    }
  };

  // Function to render the preview content based on selected export target
  const renderPreviewContent = () => {
    // For Roocode - show all rules combined in one document
    if (selectedExportTarget === "Roocode") {
      // Combine all rules into one content string
      const combinedContent = selectedRules.map(rule => {
        const content = Array.isArray(rule.content) ? rule.content.join('\n') : rule.content || '';
        return content;
      }).join('\n---\n');
      
      return (
        <div className="h-full flex flex-col">
          <div className="p-2 bg-zinc-900 flex-1 overflow-auto">
            <div className="p-4 bg-black h-full border border-zinc-700 rounded-xl relative w-full">
              {selectedRules.length > 0 && (
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(combinedContent);
                    toast({
                      title: "Copied to clipboard",
                      description: "All rules have been copied to your clipboard"
                    });
                  }}
                  className="absolute top-2 right-2 bg-zinc-800 p-1.5 rounded-md hover:bg-zinc-700 transition-colors"
                  title="Copy all rules"
                >
                  <Clipboard className="h-3.5 w-3.5 text-zinc-300" />
                </button>
              )}
              
              <pre className="text-[15px] font-mono text-[#bbbbbb] flex flex-col h-full overflow-auto leading-[1.6]">
                {/* Header */}
                <span className="text-blue-400 text-[15px] font-medium"># AI Rules for {'{project-name}'}</span>
                <span className="h-[0.65rem]"></span>
                <span className="text-blue-300 text-[15px]">{'{project-description}'}</span>
                <span className="h-[0.65rem]"></span>
                
                {selectedRules.length > 0 ? (
                  <>
                    <span className="text-yellow-500">---</span>
                    <span className="h-[0.65rem]"></span>
                    {selectedRules.map((rule, index) => {
                      const content = Array.isArray(rule.content) ? rule.content.join('\n') : rule.content || '';
                      
                      return (
                        <div key={`preview-${rule.id}`} className="mb-2">
                          <div className="text-[#bbbbbb] text-[15px] flex flex-wrap">
                            {content.split('\n').map((line, i) => (
                              <div key={i} className="w-full break-words text-[#bbbbbb]">
                                {line}
                              </div>
                            ))}
                          </div>
                          {index < selectedRules.length - 1 && (
                            <>
                              <span className="h-[0.65rem]"></span>
                              <span className="text-yellow-500">---</span>
                              <span className="h-[0.65rem]"></span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="text-zinc-500 mt-4 text-[15px]">
                    <p>No rules selected yet.</p>
                    <p>Select rules from the builder on the left to assemble rules.</p>
                  </div>
                )}
              </pre>
            </div>
          </div>
        </div>
      );
    }
    
    // For Cursor/Cline - show each rule as a separate file
    return (
      <div className="h-full flex flex-col">
        <div className="p-2 bg-zinc-900 flex-1 overflow-auto">
          {/* Header box - always visible */}
          <div className="p-4 bg-black rounded-xl border border-zinc-700 mb-4 relative w-full">
            {/* Add copy and export buttons for the header */}
            <div className="absolute top-2 right-2 flex space-x-2">
              {/* Copy button for header */}
              <button 
                onClick={() => {
                  const headerContent = `# AI Rules for {project-name}\n\n{project-description}`;
                  navigator.clipboard.writeText(headerContent);
                  toast({
                    title: "Copied to clipboard",
                    description: "Header has been copied"
                  });
                }}
                className="bg-zinc-800 p-2 rounded-full hover:bg-zinc-700 transition-colors"
                title="Copy header"
              >
                <Clipboard className="h-4 w-4 text-zinc-300" />
              </button>
              
              {/* Export button for header */}
              <button 
                onClick={() => {
                  const headerContent = `# AI Rules for {project-name}\n\n{project-description}`;
                  const fileName = "header";
                  const extension = selectedExportTarget === "Cursor" ? ".mdc" : ".md";
                  const blob = new Blob([headerContent], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${fileName}${extension}`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  
                  toast({
                    title: "Header exported",
                    description: `Saved as ${fileName}${extension}`
                  });
                }}
                className="bg-zinc-800 p-2 rounded-full hover:bg-zinc-700 transition-colors"
                title={`Export header as ${selectedExportTarget === "Cursor" ? ".mdc" : ".md"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 101.414 1.414l-4 4a1 1 0 00-1.414 0l-4-4a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <pre className="text-base font-mono text-white flex flex-col gap-2 pr-16">
              <span className="text-blue-400 text-lg font-semibold"># AI Rules for {'{project-name}'}</span>
              <span></span>
              <span className="text-blue-300 text-lg">{'{project-description}'}</span>
            </pre>
          </div>

          {selectedRules.length === 0 ? (
            <div className="p-4 bg-black rounded-xl border border-zinc-700">
              <div className="text-base font-mono text-zinc-500">
                <p>No rules selected yet.</p>
                <p>Select rules from the builder on the left to assemble rules.</p>
              </div>
            </div>
          ) : (
            // Each rule in its own separate box
            <div className="flex flex-col gap-4">
              {selectedRules.map((rule, index) => {
                const content = Array.isArray(rule.content) ? rule.content.join('\n') : rule.content || '';
                
                // Create the rule's file content including header for export (not copy)
                const fullContent = `# AI Rules for {project-name}\n\n{project-description}\n\n${content}`;
                
                return (
                  <div key={`rule-block-${rule.id}`} className="p-4 bg-black rounded-xl border border-zinc-700 relative">
                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex space-x-2">
                      {/* Copy button - only copy the content */}
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(content);
                          toast({
                            title: "Copied to clipboard",
                            description: "Rule content has been copied"
                          });
                        }}
                        className="bg-zinc-800 p-1.5 rounded-md hover:bg-zinc-700 transition-colors"
                        title="Copy rule content"
                      >
                        <Clipboard className="h-3.5 w-3.5 text-zinc-300" />
                      </button>
                      
                      {/* Export button - export the full content with header */}
                      <button 
                        onClick={() => {
                          const fileName = rule.title?.toLowerCase().replace(/\s+/g, '-') || 'rule';
                          const extension = selectedExportTarget === "Cursor" ? ".mdc" : ".md";
                          const blob = new Blob([fullContent], { type: 'text/markdown' });
                          const url = URL.createObjectURL(blob);
                          
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${fileName}${extension}`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                          
                          toast({
                            title: "Rule exported",
                            description: `Saved as ${fileName}${extension}`
                          });
                        }}
                        className="bg-zinc-800 p-1.5 rounded-md hover:bg-zinc-700 transition-colors"
                        title={`Export as ${selectedExportTarget === "Cursor" ? ".mdc" : ".md"}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-zinc-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 101.414 1.414l-4 4a1 1 0 00-1.414 0l-4-4a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="text-base font-mono text-white flex flex-col gap-2 pr-16">
                      {/* Just show the content/description without titles or extra formatting */}
                      <div className="whitespace-pre-wrap text-zinc-300 text-base">
                        {/* Break content into smaller manageable chunks */}
                        {content.split('\n').map((line, i) => (
                          <div key={i} className="max-w-[70ch] break-words">
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Update the renderGoldenPathUI function with the requested changes
  const renderGoldenPathUI = () => {
    const categoryGroups: Record<string, ExtendedRule[]> = {};
    
    // Group rules by category
    searchFilteredRules.forEach(rule => {
      const category = rule.category || 'Uncategorized';
      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push(rule);
    });

    // Available export targets - limited to the ones mentioned
    const exportTargets = ["Cursor", "Cline", "Roocode"];
    
    // Get path format based on selected target
    const getPathFormat = () => {
      if (selectedExportTarget === "Cursor") return ".cursor/rules/{rule}.mdc";
      if (selectedExportTarget === "Cline") return ".clinerules/{rule}.md";
      if (selectedExportTarget === "Roocode") return ".roo/rules/{rule}.md";
      return "rules/{rule}.md";
    };

    // Get color for a specific framework or category
    const getCategoryColor = (category: string) => {
      const lowerCategory = category.toLowerCase();
      if (lowerCategory.includes('react')) return 'bg-blue-600 text-white';
      if (lowerCategory.includes('next')) return 'bg-black text-white';
      if (lowerCategory.includes('vue')) return 'bg-emerald-600 text-white';
      if (lowerCategory.includes('angular')) return 'bg-red-600 text-white';
      if (lowerCategory.includes('python')) return 'bg-green-600 text-white';
      if (lowerCategory.includes('node') || lowerCategory.includes('express')) return 'bg-lime-600 text-white';
      if (lowerCategory.includes('typescript')) return 'bg-blue-500 text-white';
      if (lowerCategory.includes('javascript')) return 'bg-yellow-500 text-black';
      if (lowerCategory.includes('testing')) return 'bg-amber-500 text-black';
      if (lowerCategory.includes('database')) return 'bg-purple-600 text-white';
      if (lowerCategory.includes('devops')) return 'bg-pink-600 text-white';
      if (lowerCategory.includes('tailwind')) return 'bg-cyan-600 text-white';
      if (lowerCategory.includes('zustand')) return 'bg-indigo-600 text-white';
      
      // Default color
      return 'bg-zinc-600 text-white';
    };

    return (
      <div className="flex flex-col space-y-6">
        {/* Template sets selection */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <h3 className="font-semibold text-base text-white mb-3">Template Sets</h3>
          <div className="flex flex-wrap gap-2">
            {/* Show custom templates first, then predefined ones */}
            {[...recentCustomTemplates, ...predefinedTemplates.map(t => t.name)]
              .slice(0, 4) // Limit to 4 templates total
              .map(templateName => {
                const isCustom = recentCustomTemplates.includes(templateName);
                return (
                  <button
                    key={templateName}
                    onClick={() => applyTemplate(templateName, isCustom)}
                    className={`px-3 py-2 text-sm rounded-lg font-medium whitespace-nowrap flex items-center justify-between gap-2 ${
                      selectedTemplate === templateName
                        ? 'bg-emerald-700/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-transparent'
                    }`}
                  >
                    <span>{templateName}</span>
                    {selectedTemplate === templateName && (
                      <span className="bg-emerald-700 text-emerald-100 text-xs px-1.5 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                    {isCustom && (
                      <span className="bg-zinc-700 text-zinc-300 text-xs px-1.5 py-0.5 rounded-full ml-1">
                        Custom
                      </span>
                    )}
                  </button>
                );
              })}
          </div>

          {/* Custom Template Input */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={customTemplate}
              onChange={(e) => setCustomTemplate(e.target.value)}
              placeholder="Enter custom template (e.g., python-docker-aws)"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              onClick={() => {
                if (customTemplate.trim()) {
                  // Add the new template to recent templates
                  setRecentCustomTemplates(prev => {
                    const newTemplate = customTemplate.trim();
                    // Remove the template if it already exists
                    const filtered = prev.filter(t => t !== newTemplate);
                    // Add new template to the beginning and keep only the last 2
                    return [newTemplate, ...filtered].slice(0, 2);
                  });
                  applyTemplate(customTemplate.trim(), true);
                  setCustomTemplate('');
                }
              }}
              disabled={!customTemplate.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              Apply Custom
            </button>
          </div>
        </div>

        {/* Main content area with rule builder and preview */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6 h-[calc(100vh-380px)]">
          {/* Left side - Rule Builder */}
          <div className="md:col-span-3 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-white">Rule Builder</h3>
              <button
                onClick={() => {
                  setSelectedRules([]);
                  setSelectedTemplate(null);
                  // Collapse all categories
                  const newExpandedCategories = {...expandedCategories};
                  Object.keys(newExpandedCategories).forEach(category => {
                    newExpandedCategories[category] = false;
                  });
                  setExpandedCategories(newExpandedCategories);
                }}
                className="text-zinc-400 hover:text-red-400 text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear all
              </button>
            </div>
            
            {/* Search input */}
            <div className="px-3 pt-2 pb-3">
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-2.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for patterns, frameworks, libraries..."
                  className="w-full bg-zinc-800 text-white pl-10 pr-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                />
                {searchQuery && (
                  <button
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Rules list - the main scrollable area */}
            <div className="flex-1 overflow-auto p-2 max-h-full">
              {Object.entries(categoryGroups).map(([category, categoryRules]) => {
                // Calculate color for count badge
                let countBadgeColor = "bg-zinc-700 text-zinc-300"; // default
                const selectedCount = selectedRules.filter(r => r.category === category).length;
                const totalCount = categoryRules.length;
                
                // Use different color schemes based on selection ratio
                if (selectedCount > 0) {
                  if (category.toLowerCase().includes("testing")) countBadgeColor = "bg-amber-700 text-amber-200";
                  else if (category.toLowerCase().includes("react")) countBadgeColor = "bg-blue-700 text-blue-200";
                  else if (category.toLowerCase().includes("next")) countBadgeColor = "bg-slate-700 text-slate-200";
                  else if (category.toLowerCase().includes("node") || category.toLowerCase().includes("express")) countBadgeColor = "bg-lime-700 text-lime-200";
                  else if (category.toLowerCase().includes("python")) countBadgeColor = "bg-blue-700 text-blue-200";
                  else if (category.toLowerCase().includes("database")) countBadgeColor = "bg-purple-700 text-purple-200";
                  else if (category.toLowerCase().includes("devops")) countBadgeColor = "bg-pink-700 text-pink-200";
                  else if (category.toLowerCase().includes("typescript")) countBadgeColor = "bg-blue-800 text-blue-200";
                  else if (category.toLowerCase().includes("javascript")) countBadgeColor = "bg-yellow-700 text-yellow-100";
                  else countBadgeColor = "bg-blue-700 text-blue-200";
                }
                
                return (
                  <div key={category} className="mb-4">
                    <div 
                      className={`flex justify-between items-center px-4 py-2.5 rounded-full mb-2 cursor-pointer ${
                        expandedCategories[category] 
                          ? 'bg-zinc-800 text-white' 
                          : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800'
                      }`}
                      onClick={() => toggleCategory(category)}
                    >
                      <div className="flex items-center">
                        <div className="mr-2 text-zinc-400">
                          {expandedCategories[category] ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <h4 className="font-medium">{category}</h4>
                      </div>
                      <div className={`px-2.5 py-0.5 rounded-full text-xs ${countBadgeColor}`}>
                        {selectedCount}/{totalCount}
                      </div>
                    </div>
                    
                    {expandedCategories[category] && (
                      <div className="pl-2">
                        {categoryRules.map(rule => {
                          const isSelected = selectedRules.some(r => r.id === rule.id);
                          return (
                            <div 
                              key={rule.id}
                              onClick={() => toggleRuleSelection(rule)}
                              className={`flex items-center px-3 py-2 rounded-lg cursor-pointer mb-1 ${
                                isSelected 
                                  ? 'bg-blue-900/20 border border-blue-500/50 text-blue-400' 
                                  : 'hover:bg-zinc-800/70 text-zinc-400 border border-transparent'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center ${
                                isSelected 
                                  ? 'bg-blue-500 text-white' 
                                  : 'border border-zinc-600'
                              }`}>
                                {isSelected && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1 flex items-center">
                                <span className="truncate">{rule.title || 'Untitled'}</span>
                                {rule.isOfficial && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Selected Rules Display - moved to bottom of builder */}
            {selectedRules.length > 0 && (
              <div className="bg-zinc-800 p-3 border-t border-zinc-700">
                <p className="text-zinc-300 mb-2 text-sm font-medium">Selected Rules ({selectedRules.length})</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRules.map(rule => (
                    <div 
                      key={`selected-${rule.id}`}
                      className={`flex items-center rounded-full px-3 py-1 text-xs ${getCategoryColor(rule.category || '')}`}
                    >
                      <span className="mr-1">{rule.category || 'Uncategorized'}</span>
                      {rule.isOfficial && (
                        <OfficialBadge variant="icon-only" className="mr-1 h-3.5 w-3.5 text-emerald-500" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRuleSelection(rule);
                        }}
                        className="text-white/80 hover:text-white"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right side - Preview - ALWAYS render renderPreviewContent() */}
          <div className="md:col-span-4 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden flex flex-col">
            {/* Export targets selector - now at the top of the preview area */}
            <div className="bg-zinc-800 border-b border-zinc-700">
              {/* Top row with export targets and export icon */}
              <div className="flex justify-between items-center p-3">
                <div className="flex gap-2">
                  {exportTargets.map(target => (
                    <button
                      key={target}
                      onClick={() => setSelectedExportTarget(target)}
                      className={`px-3 py-1 text-sm rounded-full font-medium ${
                        selectedExportTarget === target 
                          ? 'bg-blue-800 text-white' 
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      }`}
                    >
                      {target}
                    </button>
                  ))}
                </div>
                <button
                  onClick={createCombinedRule}
                  disabled={selectedRules.length === 0}
                  className={`text-zinc-400 hover:text-zinc-200 p-1.5 rounded-md ${selectedRules.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={selectedRules.length === 0 ? "Select rules first" : "Export combined rule"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 101.414 1.414l-4 4a1 1 0 00-1.414 0l-4-4a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {/* Path on its own row - now left-aligned and bigger */}
              <div className="text-sm text-zinc-400 px-3 pb-2 text-left">
                Path: <span className="font-medium text-zinc-300">{getPathFormat()}</span>
              </div>
            </div>
            
            {/* Always render the preview content */}
            <div className="flex-1 overflow-auto">
              {renderPreviewContent()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add Golden Path toggle button to the top navbar
  const renderTopNav = () => {
    return (
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{activeCategoryName}</h1>
          <p className="text-muted-foreground">
            Browse and discover best practices for {activeCategoryName}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant={isGoldenPathMode ? "default" : "outline"}
            onClick={() => setGoldenPathMode(!isGoldenPathMode)}
          >
            {isGoldenPathMode ? "Exit Assemble Rules Mode" : "Assemble Rules Builder"}
          </Button>
          <UserMenu />
        </div>
      </div>
    );
  };

  // Add a toggleCategory function
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Add function to handle browser-based file download
  const downloadFile = (fileName: string, content: string) => {
    // Create the file content with proper formatting
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.mdc') ? fileName : `${fileName}.mdc`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Restore handleSaveConfirm function
  const handleSaveConfirm = async (fileName: string) => {
    if (!saveDialog.rule) return;
    
    try {
      const rule = saveDialog.rule;
      const content = saveDialog.ruleContent;
      
      // Show loading state
      setSaveDialog(prev => ({ ...prev, isSaving: true }));
      
      // Call backend API to show save dialog
      const response = await fetch('http://localhost:8000/api/rules/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: fileName,
          content: content,
          title: rule.title || rule.category || 'Untitled Rule',
          category: rule.category || 'Uncategorized',
          authorName: rule.authorName || (rule as any).author_name || 'Anonymous',
          tags: rule.tags || []
        }),
      });
      
      const data = await response.json();
      
      // Handle API response
      if (data.success) {
        // Show success message if a file was saved
        alert(`Rule saved successfully to: ${data.path}`);
      } else if (data.message === "Operation cancelled by user") {
        // User cancelled the save dialog, no need for error message
        console.log("Save operation cancelled by user");
      } else {
        // Some other error occurred
        throw new Error(data.error || "Failed to save file");
      }
      
      // Close dialog
      setSaveDialog(prev => ({ ...prev, isOpen: false, isSaving: false }));
    } catch (error) {
      console.error('Error saving rule:', error);
      alert(`Failed to save rule: ${error instanceof Error ? error.message : String(error)}`);
      setSaveDialog(prev => ({ ...prev, isOpen: false, isSaving: false }));
    }
  };

  // Add back the exportRuleAsMDC function
  const exportRuleAsMDC = (rule: ExtendedRule) => {
    // Create a better default file name using category and title if available
    let defaultFileName = '';
    
    if (rule.title && rule.category) {
      defaultFileName = `${rule.category}-${rule.title}`.toLowerCase();
    } else if (rule.title) {
      defaultFileName = rule.title.toLowerCase();
    } else if (rule.category) {
      defaultFileName = rule.category.toLowerCase();
    } else {
      defaultFileName = 'rule';
    }
    
    // Sanitize the filename - replace spaces and special chars with hyphens
    defaultFileName = defaultFileName
      .replace(/\s+/g, '-')        // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '-') // Replace special chars with hyphens
      .replace(/-+/g, '-')         // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '');      // Remove leading/trailing hyphens
    
    // Open save dialog
    setSaveDialog({
      isOpen: true,
      fileName: defaultFileName,
      ruleContent: Array.isArray(rule.content) ? rule.content.join('\n') : rule.content || '',
      rule
    });
  };

  // Restore the renderRuleCard function with its full functionality
  const renderRuleCard = (rule: ExtendedRule) => {
    // Format rule content for display
    const formattedContent = Array.isArray(rule.content) 
      ? rule.content.join('\n') 
      : rule.content || '';
    
    // Convert numeric ID to string for use in record access
    const ruleIdStr = rule.id !== undefined ? String(rule.id) : '';
    const isExpanded = ruleIdStr && expandedCards[ruleIdStr] === true;
    const isCopied = ruleIdStr && copySuccess[ruleIdStr] === true;
    
    // If any card is expanded and this is not the expanded one, don't render it
    if (isAnyCardExpanded && !isExpanded) {
      return null;
    }
    
    return (
      <div 
        key={ruleIdStr}
        className={`
          bg-zinc-900/90 border border-zinc-800/80 rounded-md overflow-hidden group
          hover:border-white/40 transition-all duration-200 ease-in-out cursor-pointer
          hover:shadow-[0_0_10px_rgba(255,255,255,0.08)] 
          ${isExpanded ? 'h-[700px] flex flex-col' : 'h-[380px]'}
          ${isAnyCardExpanded && isExpanded ? 'col-span-full max-w-[900px]' : ''}
        `}
        onClick={(e) => {
          // Always expand on card click, unless we're clicking on a specific control
          const target = e.target as HTMLElement;
          const isButton = target.closest('button');
          
          // Stop propagation for all clicks
          e.stopPropagation();
          
          if (!isButton && ruleIdStr) {
            if (showAllCategories && rule.category) {
              // If we're in "All" mode, navigate to rule's category instead of expanding in place
              setShowAllCategories(false);
              handleCategoryClick(rule.category, true); // Skip loading state
              
              // Delay expansion to match other tabs' behavior
              setTimeout(() => {
                toggleCardExpansion(ruleIdStr);
              }, 100);
            } else {
              // Regular toggle behavior when not in "All" mode
              toggleCardExpansion(ruleIdStr);
            }
          }
        }}
        tabIndex={0} // Make div focusable
        role="button" // Add ARIA role
        aria-expanded={isExpanded ? "true" : "false"} // Ensure proper ARIA attribute type
      >
        <div className={`${isExpanded ? 'flex-grow overflow-hidden' : 'h-full flex flex-col justify-between'} flex flex-col`}>
          <div className="relative flex flex-col h-full">
            <div 
              className={`px-4 py-3 ${isExpanded ? 'flex-grow overflow-y-auto' : 'overflow-hidden max-h-[300px]'} scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 content-area`}
              onClick={(e) => {
                // Allow text selection when expanded
                if (isExpanded) {
                  e.stopPropagation();
                }
              }}
            >
              {isExpanded && (
                <div className="mb-4"></div>
              )}
              
              {/* Only show official badge, remove title */}
              <div className="flex justify-end mb-3">
                {rule.isOfficial && <OfficialBadge variant="subtle" />}
              </div>
              
              <pre 
                className="font-mono text-sm text-[#bbbbbb] group-hover:text-white whitespace-pre-wrap user-select-text pb-12"
                style={{ userSelect: 'text' }}
                onClick={(e) => {
                  // Allow text selection when expanded
                  if (isExpanded) {
                    e.stopPropagation();
                  }
                }}
              >
                {formattedContent.split('\n').map((line, i) => {
                  // Format numbered lines (1. , 2. , etc.)
                  const isNumberedLine = /^\d+\.\s/.test(line.trim());
                  
                  return (
                    <div 
                      key={i} 
                      className={`${
                        line.trim().startsWith('-') ? 'text-blue-400 group-hover:text-blue-300 group-hover:font-medium' : 
                        line.trim().startsWith('-') ? 'text-emerald-400 group-hover:text-emerald-300 group-hover:font-medium' : 
                        isNumberedLine ? 'text-[#85bfff] group-hover:text-[#b8dfff] group-hover:font-medium' :
                        line.trim().startsWith('Key Principles') || 
                        line.trim().startsWith('PHP/Laravel') || 
                        line.trim().startsWith('Core Principles') || 
                        line.trim().startsWith('Dependencies') || 
                        line.trim().startsWith('Laravel Best Practices') ||
                        line.trim().startsWith('Key Conventions') ||
                        line.trim().startsWith('File structure:') ? 'text-[#e7e7e7] font-medium py-1 group-hover:text-white group-hover:font-bold' : 
                        line.trim() === '' ? 'py-2' : 
                        line.trim().includes('composer') || line.trim().includes('Laravel 10.0+') || line.trim().includes('PHP 8') ? 'text-[#ffa07a] group-hover:text-[#ffc0a0] group-hover:font-medium' :
                        'text-[#bbbbbb] py-0.5 group-hover:text-white group-hover:font-medium transition-all duration-150'
                      }`}
                      style={{ userSelect: 'text' }}
                      onClick={(e) => {
                        if (isExpanded) {
                          e.stopPropagation();
                        }
                      }}
                    >
                      {line}
                    </div>
                  );
                })}
              </pre>
            </div>
            
            {!isExpanded && (
              <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#121212] to-transparent pointer-events-none"></div>
            )}
          </div>
          
          {!isExpanded && (
            <div className="px-4 pt-3 pb-3 relative bg-zinc-900/90 z-10 border-t border-zinc-800/50">
              {/* Show author name for all rules */}
              <div className="text-sm text-white font-mono mb-2 group-hover:font-medium transition-all duration-150">
                {rule.authorName || (rule as any).author_name || 'Anonymous'}
              </div>
              <div className="flex flex-wrap gap-1 items-center">
                {Array.isArray(rule.tags) && rule.tags.length > 0 ? (
                  <>
                    {rule.tags.slice(0, Math.min(2, rule.tags.length)).map((tag, index) => (
                      <div 
                        key={`${tag}-${index}`}
                        className="text-xs px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded"
                      >
                        {tag}
                      </div>
                    ))}
                    
                    {rule.tags.length > 2 && (
                      <div 
                        className="text-xs px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded cursor-pointer hover:bg-zinc-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowMoreTags(e, rule.tags.slice(2));
                        }}
                      >
                        +{rule.tags.length - 2} more
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>
        
        {isExpanded && (
          <div className="p-4 py-2 bg-zinc-900/80 border-t border-zinc-800">
            <div className="flex flex-col">
              {/* Show author name for all rules */}
              <span className="text-sm text-white font-mono mb-2 group-hover:font-medium transition-all duration-150">
                {rule.authorName || (rule as any).author_name || 'Anonymous'}
              </span>
              
              <div className="flex justify-between items-center">
                <div className="flex flex-wrap gap-1 items-center">
                  {Array.isArray(rule.tags) && rule.tags.length > 0 ? (
                    <>
                      {rule.tags.slice(0, Math.min(2, rule.tags.length)).map((tag, index) => (
                        <div 
                          key={`${tag}-${index}`}
                          className="text-xs px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded"
                        >
                          {tag}
                        </div>
                      ))}
                      
                      {rule.tags.length > 2 && (
                        <div 
                          className="text-xs px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded cursor-pointer hover:bg-zinc-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowMoreTags(e, rule.tags.slice(2));
                          }}
                        >
                          +{rule.tags.length - 2} more
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={(e) => ruleIdStr && handleCopyContent(ruleIdStr, formattedContent, e)}
                    className="flex items-center text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-xs"
                    title="Copy text"
                  >
                    <Clipboard className="h-3 w-3 mr-1" />
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      exportRuleAsMDC(rule);
                    }}
                    className="flex items-center text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-xs"
                    title="Export as .mdc file"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 101.414 1.414l-4 4a1 1 0 00-1.414 0l-4-4a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Export</span>
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (ruleIdStr) toggleCardExpansion(ruleIdStr);
                    }}
                    className="text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Restore the renderRules function for non-Golden Path mode
  const renderRules = () => {
    if (!showAllCategories) {
      // Regular view - just show the filtered rules for current category
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" onClick={(e) => e.stopPropagation()}>
          {searchFilteredRules.map((rule) => renderRuleCard(rule))}
        </div>
      );
    } else {
      // All categories view - group by category
      const groupedRules: Record<string, ExtendedRule[]> = {};
      
      // Group rules by category
      searchFilteredRules.forEach(rule => {
        const category = rule.category || 'Uncategorized';
        if (!groupedRules[category]) {
          groupedRules[category] = [];
        }
        groupedRules[category].push(rule);
      });
      
      // Render groups with headers
      return Object.entries(groupedRules)
        .sort(([categoryA], [categoryB]) => {
          // When searching, prioritize categories that match the search query
          if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            
            // If category A exactly matches query, it comes first
            if (categoryA.toLowerCase() === query) return -1;
            // If category B exactly matches query, it comes first
            if (categoryB.toLowerCase() === query) return 1;
            
            // If category A contains query, it comes before categories that don't
            const aContainsQuery = categoryA.toLowerCase().includes(query);
            const bContainsQuery = categoryB.toLowerCase().includes(query);
            
            if (aContainsQuery && !bContainsQuery) return -1;
            if (!aContainsQuery && bContainsQuery) return 1;
          }
          
          // Default alphabetical sort if no special search prioritization
          return categoryA.localeCompare(categoryB);
        })
        .map(([category, rules]) => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              {category.replace(/_/g, ' ').charAt(0).toUpperCase() + category.replace(/_/g, ' ').slice(1).toLowerCase()} <span className="text-zinc-400 text-base">({rules.length})</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" onClick={(e) => e.stopPropagation()}>
              {rules.map(rule => renderRuleCard(rule))}
            </div>
          </div>
        ));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-900/40" onClick={closeTooltip}>
      {/* Add custom scrollbar style */}
      <style jsx global>{`
        /* Make scrollbar extremely thin */
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px !important;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #080808 !important;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #444 !important;
        }
        .custom-scrollbar {
          scrollbar-width: thin !important;
          scrollbar-color: #444 #080808 !important;
        }
        
        /* Hide scrollbar completely while maintaining functionality in Firefox */
        .custom-scrollbar.hide-scrollbar {
          scrollbar-width: none !important;
        }
        
        /* Hide scrollbar completely while maintaining functionality in Chrome */
        .custom-scrollbar.hide-scrollbar::-webkit-scrollbar {
          width: 0px !important;
          display: none !important;
        }
      `}</style>
      
      {/* Top Header - Fixed */}
      <div className="bg-transparent py-3 px-6 flex-shrink-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <Link href="/" className="text-lg font-medium text-white">
              XponentL
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link 
              href="/category/all" 
              className="text-zinc-400 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Rules
            </Link>
            <Link 
              href="/best-practices" 
              className="text-zinc-400 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Best Practices
            </Link>
            <Link 
              href="/generate" 
              className="text-zinc-400 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Generate
            </Link>
          </div>
          <div>
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Main Content Area - Flex with Overflow */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fixed Width with Internal Scroll */}
        <div className="w-64 flex flex-col h-screen">
          <div className="flex-1 overflow-y-auto custom-scrollbar hide-scrollbar pb-24 pt-3">
            {/* Single unified list of all categories */}
            <div className="mb-0">
              {categoriesWithCounts
                .sort((a, b) => b.count - a.count) // Sort by count (descending)
                .map((category, index, array) => (
                  <div
                    key={category.name}
                    onClick={() => handleCategoryClick(category.name)}
                    className={`flex justify-between items-center pl-8 pr-4 py-2 ${index === array.length - 1 ? 'mb-0' : 'mb-1.5'} cursor-pointer font-medium text-base font-['SF Pro Display','Inter','Segoe UI',system-ui,sans-serif] ${
                      activeCategoryName === category.name && filterType !== 'official' && filterType !== 'all'
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-300 hover:bg-zinc-800/70 hover:text-white transition-all duration-200'
                    } ${isLoading ? 'pointer-events-none opacity-70' : ''}`}
                  >
                    <span>{category.name.charAt(0).toUpperCase() + category.name.slice(1).toLowerCase()}</span>
                    <span className="text-zinc-500">{category.count}</span>
                  </div>
                ))}
            </div>
          </div>
          {/* Submit Button - Fixed at Bottom */}
          <div className="p-4 border-t border-zinc-800/30 bg-zinc-900/80 backdrop-blur-sm sticky bottom-0 w-full mt-0 z-20">
            <Link href={`/rules/new?returnCategory=${encodeURIComponent(activeCategoryName)}${filterType === 'official' ? '&isOfficial=true' : ''}`}>
              <button className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:from-blue-700 hover:to-blue-600">
                <span className="font-medium">Add Rule</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </Link>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-auto relative">
          <div className={`p-8 transition-all duration-300 ease-in-out ${
            isLoading ? 'opacity-50 transform scale-[0.99]' : 'opacity-100 transform scale-100'
          }`}>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                {/* Filter tabs */}
                <div className="flex bg-zinc-900 rounded-md overflow-hidden border border-zinc-800">
                  <button 
                    onClick={() => {
                      // Clear any expanded cards when switching to All view
                      if (isAnyCardExpanded) {
                        setExpandedCards({});
                      }
                      setFilterType('all');
                      setShowAllCategories(!showAllCategories); // Toggle between all categories and current category
                      
                      // Update URL to show /category/all
                      if (activeCategoryName.toLowerCase() !== 'all') {
                        setActiveCategoryName('All');
                        window.history.pushState({}, '', '/category/all');
                      }
                    }}
                    className={`px-4 py-2 transition-colors duration-200 text-sm ${
                      filterType === 'all' // Only highlight when explicitly selected
                        ? 'bg-white text-black font-medium' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => {
                      setFilterType('official');
                      setShowAllCategories(false); // Reset to only show current category
                      
                      // Update URL to show /category/officials
                      if (activeCategoryName.toLowerCase() !== 'officials') {
                        setActiveCategoryName('Officials');
                        window.history.pushState({}, '', '/category/officials');
                      }
                    }}
                    className={`px-4 py-2 transition-colors duration-200 text-sm ${
                      filterType === 'official' 
                        ? 'bg-white text-black font-medium' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    Official
                  </button>
                  <button 
                    onClick={() => {
                      setFilterType('general');
                      setShowAllCategories(false); // Reset to only show current category
                      
                      // Update URL to show /category/general
                      if (activeCategoryName.toLowerCase() !== 'general') {
                        setActiveCategoryName('General');
                        window.history.pushState({}, '', '/category/general');
                      }
                    }}
                    className={`px-4 py-2 transition-colors duration-200 text-sm ${
                      filterType === 'general' 
                        ? 'bg-white text-black font-medium' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    General
                  </button>
                  <button 
                    onClick={() => {
                      setFilterType('goldenPath');
                      setShowAllCategories(false); // Reset to only show current category
                      setGoldenPathMode(true);  // <-- Added this line to enable Golden Path mode
                      
                      // Update URL to show /category/goldenPath
                      if (activeCategoryName.toLowerCase() !== 'goldenPath') {
                        setActiveCategoryName('Assemble Rules');
                        window.history.pushState({}, '', '/category/goldenPath');
                      }
                    }}
                    className={`px-4 py-2 transition-colors duration-200 text-sm ${
                      filterType === 'goldenPath' 
                        ? 'bg-white text-black font-medium' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    Assemble Rules
                  </button>
                </div>
                
                {/* Title moved inside tabs area */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search rules..."
                    className="w-64 px-4 py-3 bg-transparent text-white border border-white/20 rounded-lg focus:outline-none focus:border focus:border-white/70 transition-all duration-200"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  {searchQuery && (
                    <button 
                      className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
                      onClick={() => setSearchQuery("")}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Section title moved below tabs */}
              {(!showAllCategories || filterType === 'official' || filterType === 'general') && (
              <h1 className="text-2xl font-bold text-white mb-6">
                {filterType === 'official' ? 'Official Rules' : 
                 filterType === 'general' ? 'General Rules' : capitalizedCategoryName}
                {searchQuery && <span className="text-zinc-400 text-lg ml-3">Search: {searchQuery}</span>}
              </h1>
              )}
              {/* Only show search indicator when in All view */}
              {showAllCategories && searchQuery && (
                <div className="text-zinc-400 text-lg mb-6">
                  Search: {searchQuery}
                </div>
              )}
            </div>

            {/* Rules grid - Updated to match cursor.directory style */}
            <div>
              {searchFilteredRules.length > 0 ? (
                filterType === 'goldenPath' ? renderGoldenPathUI() : renderRules()
              ) : (
                <div className="col-span-full text-center py-12">
                  {searchQuery.trim() ? (
                    <div>
                      <p className="text-zinc-400 mb-4">No rules found matching "{searchQuery}"</p>
                      <Button 
                        variant="outline" 
                        className="border-zinc-700"
                        onClick={() => setSearchQuery('')}
                      >
                        Clear search
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-zinc-400 mb-4">No rules found for this category.</p>
                      <Link href={`/rules/new?returnCategory=${encodeURIComponent(activeCategoryName)}${filterType === 'official' ? '&isOfficial=true' : ''}`}>
                        <Button variant="outline" className="border-zinc-700">
                          Create the first rule
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add TagsTooltip component */}
      <TagsTooltip 
        tags={tagTooltip.tags} 
        isOpen={tagTooltip.isOpen} 
        onClose={closeTooltip} 
        position={tagTooltip.position} 
      />
      
      {/* Add SaveDialog */}
      <SaveDialog 
        fileName={saveDialog.fileName}
        isOpen={saveDialog.isOpen}
        onClose={() => setSaveDialog(prev => ({ ...prev, isOpen: false }))}
        onSave={handleSaveConfirm}
      />
    </div>
  )
} 