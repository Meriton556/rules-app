import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Rule } from '@/app/api/rulesApi';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle, Wrench, Shield } from 'lucide-react';
import { RULE_CATEGORIES, MAX_TAGS, DEFAULT_AUTHOR } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface RuleFormProps {
  onSubmit: (rule: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Partial<Rule>;
  buttonText?: string;
  isSubmitting?: boolean;
}

export default function RuleForm({ 
  onSubmit, 
  initialData = {}, 
  buttonText = 'Create Rule',
  isSubmitting = false 
}: RuleFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState(initialData.content || '');
  const [title, setTitle] = useState(initialData.title || '');
  const [category, setCategory] = useState(initialData.category || '');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>(initialData.tags || []);
  const [isOfficial, setIsOfficial] = useState(initialData.isOfficial || false);
  const [isGeneral, setIsGeneral] = useState(initialData.isGeneral || false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const [tagError, setTagError] = useState<string | null>(null);
  
  // Use authenticated user's info or fallback to DEFAULT_AUTHOR
  const [authorId, setAuthorId] = useState(initialData.author || (user ? user.id : DEFAULT_AUTHOR.id));
  const [authorName, setAuthorName] = useState(
    initialData.authorName || 
    (user ? (user.user_metadata?.display_name || user.email?.split('@')[0]) : DEFAULT_AUTHOR.name)
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update author fields when user authentication changes
  useEffect(() => {
    if (user) {
      setAuthorId(user.id);
      setAuthorName(user.user_metadata?.display_name || user.email?.split('@')[0] || authorName);
    }
  }, [user]);

  // Effect to clear tags and authorName when isOfficial is set to true
  useEffect(() => {
    if (isOfficial) {
      // Remove this effect that clears tags and author name
      // We now want to keep these fields even for official rules
    } else if (user) {
      // Restore author name when switching back to non-official
      setAuthorName(user.user_metadata?.display_name || user.email?.split('@')[0] || DEFAULT_AUTHOR.name);
    }
  }, [isOfficial, user]);

  // Effect to handle category clearing when isGeneral is toggled
  useEffect(() => {
    if (isGeneral) {
      setCategory(''); // Clear category when General Tool is selected
    }
  }, [isGeneral]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!category && !isGeneral) {
      newErrors.category = 'Category is required';
    }

    if (tags.length > MAX_TAGS) {
      newErrors.tags = `Maximum ${MAX_TAGS} tags allowed`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!validate()) return;

    // Log for debugging
    console.log("Submitting rule with isOfficial:", isOfficial);
    
    // Create rule data object
    const ruleData = {
      title,
      description: `Rules for ${category}`, // Generate description from category
      content,
      category,
      tags: tags, // Always include tags, even for official rules
      author: authorId,
      authorName: authorName, // Always include author name, even for official rules
      isOfficial,
      isGeneral,
    };
    
    console.log("Rule data to submit:", ruleData);
    
    // Submit the data
    onSubmit(ruleData);
  };

  // Handle tag input change
  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTag(value);
    
    if (value.trim()) {
      // Filter categories that include the typed text (case insensitive)
      const filtered = RULE_CATEGORIES.filter(
        cat => cat.toLowerCase().includes(value.toLowerCase())
      );
      
      // Auto-capitalize if there's an exact match 
      if (filtered.length === 1 && filtered[0].toLowerCase() === value.toLowerCase()) {
        setTag(filtered[0]); // Set to properly capitalized version
      }
      
      setFilteredCategories(filtered);
      setShowTagSuggestions(filtered.length > 0);
    } else {
      setShowTagSuggestions(false);
    }
  };
  
  // Check if a tag already exists (case insensitive)
  const tagExists = (tagToCheck: string): boolean => {
    return tags.some(tag => tag.toLowerCase() === tagToCheck.toLowerCase());
  };

  // Add tag that properly handles capitalization
  const addTag = () => {
    if (tag.trim() && tags.length < MAX_TAGS) {
      // First check for exact match (case insensitive)
      const exactMatch = RULE_CATEGORIES.find(
        cat => cat.toLowerCase() === tag.toLowerCase()
      );
      
      // Find closest match if no exact match (first category that includes the typed text)
      const closestMatch = exactMatch || RULE_CATEGORIES.find(
        cat => cat.toLowerCase().includes(tag.toLowerCase())
      );
      
      const tagToAdd = exactMatch || closestMatch;
      
      if (tagToAdd) {
        // Check for duplicates (case insensitive)
        if (tagExists(tagToAdd)) {
          setTagError(`"${tagToAdd}" is already added to this rule`);
          setTimeout(() => setTagError(null), 3000); // Clear error after 3 seconds
          return;
        }
        
        // Use the properly capitalized version
        setTags([...tags, tagToAdd]);
        setTag('');
        setShowTagSuggestions(false);
        setFilteredCategories([]);
        setTagError(null);
      } else {
        // No match found - show error
        setTagError(`"${tag}" is not a valid category tag`);
        setTimeout(() => setTagError(null), 3000); // Clear error after 3 seconds
      }
    }
  };

  // Handle selecting a tag from suggestions
  const selectTagSuggestion = (category: string) => {
    if (tags.length < MAX_TAGS) {
      // Check for duplicates
      if (tagExists(category)) {
        setTagError(`"${category}" is already added to this rule`);
        setTimeout(() => setTagError(null), 3000); // Clear error after 3 seconds
        return;
      }
      
      // Update the input field first
      setTag(category);
      
      // Then add the tag after a visible delay (300ms)
      setTimeout(() => {
        setTags([...tags, category]);
        setTag('');
        setShowTagSuggestions(false);
        setFilteredCategories([]);
        setTagError(null);
      }, 300);
    }
  };
  
  // Direct addition of a tag from dropdown
  const directAddTag = (category: string) => {
    if (tags.length < MAX_TAGS) {
      // Check for duplicates
      if (tagExists(category)) {
        setTagError(`"${category}" is already added to this rule`);
        setTimeout(() => setTagError(null), 3000); // Clear error after 3 seconds
        return;
      }
      
      // Add the tag immediately
      setTags([...tags, category]);
      setTag('');
      setShowTagSuggestions(false);
      tagInputRef.current?.focus();
      setTagError(null);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagInputRef.current && !tagInputRef.current.contains(event.target as Node)) {
        setShowTagSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
      {/* Title field with checkboxes beside it */}
      <div className="space-y-1">
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="title" className="text-sm font-medium text-zinc-400">
            Title
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-1">
              <Checkbox 
                id="general-rule" 
                checked={isGeneral}
                onCheckedChange={(checked) => setIsGeneral(checked === true)}
                className="border-zinc-400 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-500 data-[state=checked]:border-transparent h-4 w-4 transition-all duration-200 rounded-sm"
              />
              <Label 
                htmlFor="general-rule" 
                className="text-sm font-medium flex items-center gap-1 cursor-pointer group"
              >
                <span className="flex items-center gap-1 p-1 px-2 rounded-full bg-gradient-to-r from-blue-500/10 to-blue-500/10 group-hover:from-blue-500/20 group-hover:to-blue-500/20 transition-all duration-200">
                  <Wrench className="h-4 w-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  <span className="text-white group-hover:text-blue-300 transition-colors font-semibold">General Tool</span>
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-1">
              <Checkbox 
                id="official-rule" 
                checked={isOfficial}
                onCheckedChange={(checked) => setIsOfficial(checked === true)}
                className="border-zinc-400 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500 data-[state=checked]:border-transparent h-4 w-4 transition-all duration-200 rounded-sm"
              />
              <Label 
                htmlFor="official-rule" 
                className="text-sm font-medium flex items-center gap-1 cursor-pointer group"
              >
                <span className="flex items-center gap-1 p-1 px-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all duration-200">
                  <Shield className="h-4 w-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  <span className="text-white group-hover:text-purple-300 transition-colors font-semibold">Official Rule</span>
                </span>
              </Label>
            </div>
          </div>
        </div>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter rule title..."
          required
          disabled={isSubmitting}
          className="flex h-8 w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-sm ring-offset-background text-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:font-['Poppins'] placeholder:text-zinc-400 placeholder:italic placeholder:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        />
        {errors.title && (
          <p className="text-sm text-red-400">{errors.title}</p>
        )}
      </div>

      {/* Category field shown for all rules now */}
      <div className="space-y-1">
        <label htmlFor="category" className="text-sm font-medium text-zinc-400">
          Category
        </label>
        <Select
          value={category}
          onValueChange={setCategory}
          disabled={isSubmitting || isGeneral}
        >
          <SelectTrigger className={`bg-zinc-800/50 border-zinc-700 focus:ring-emerald-500 focus-visible:ring-emerald-500 h-8 py-1 font-['Poppins'] text-base placeholder:font-['Poppins'] placeholder:text-zinc-400 placeholder:italic placeholder:text-base ${isGeneral ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <SelectValue placeholder={isGeneral ? "No category needed for general tools" : "Select a category"} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto">
            {RULE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && !isGeneral && (
          <p className="text-sm text-red-400">{errors.category}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="content" className="text-sm font-medium text-zinc-400">
          Content
        </label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter rule content..."
          required
          disabled={isSubmitting}
          className="bg-zinc-800/50 border-zinc-700 min-h-[120px] font-mono placeholder:font-sans placeholder:font-['Poppins'] placeholder:text-zinc-400 placeholder:italic placeholder:text-base focus-visible:ring-emerald-500 focus-visible:ring-offset-emerald-500 py-1 px-3"
        />
        {errors.content && (
          <p className="text-sm text-red-400">{errors.content}</p>
        )}
      </div>

      {/* Show tags for all rules now */}
      <div className="space-y-1">
        <label htmlFor="tags" className="text-sm font-medium text-zinc-400">
          Tags ({tags.length}/{MAX_TAGS})
        </label>
        <div className="flex gap-2 relative">
          <input
            id="tags"
            ref={tagInputRef}
            value={tag}
            onChange={handleTagChange}
            placeholder="Add a tag"
            disabled={isSubmitting || tags.length >= MAX_TAGS}
            className="flex h-8 w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-sm ring-offset-background text-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:font-['Poppins'] placeholder:text-zinc-400 placeholder:italic placeholder:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              } else if (e.key === 'Escape') {
                setShowTagSuggestions(false);
              } else if (e.key === 'ArrowDown' && showTagSuggestions) {
                e.preventDefault();
                // Focus the first item in the dropdown
                const dropdown = document.querySelector('[data-tag-suggestion]') as HTMLElement;
                if (dropdown) dropdown.focus();
              }
            }}
            onFocus={() => {
              if (tag.trim()) {
                setShowTagSuggestions(filteredCategories.length > 0);
              }
            }}
          />
          
          <Button 
            type="button" 
            onClick={() => {
              setShowTagSuggestions(!showTagSuggestions);
              setFilteredCategories(RULE_CATEGORIES.filter(cat => !tags.some(t => t.toLowerCase() === cat.toLowerCase())));
            }}
            variant="outline" 
            disabled={isSubmitting || tags.length >= MAX_TAGS}
            className="border-zinc-700 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 h-8 py-0"
          >
            Add Tag
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-4 w-4">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </Button>

          {showTagSuggestions && tag.trim() && (
            <div className="absolute top-12 left-0 z-10 w-full max-h-60 overflow-auto rounded-md border border-zinc-700 bg-zinc-800 shadow-lg">
              <div className="py-1">
                <div className="px-3 py-1 text-xs text-zinc-400">Matching tags:</div>
                {filteredCategories.map((category) => (
                  <div
                    key={category}
                    data-tag-suggestion
                    tabIndex={0}
                    className="px-3 py-2 text-sm text-white hover:bg-zinc-700 cursor-pointer focus:bg-zinc-700 focus:outline-none flex items-center justify-between"
                    onClick={() => selectTagSuggestion(category)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectTagSuggestion(category);
                      }
                    }}
                  >
                    <span>{category}</span>
                    <span className="text-xs text-zinc-500">Click to add</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {tagError && (
          <p className="text-sm text-amber-400 mt-1">{tagError}</p>
        )}
        {errors.tags && (
          <p className="text-sm text-red-400">{errors.tags}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((t) => (
            <Badge
              key={t}
              variant="outline"
              className="bg-zinc-800/50 text-zinc-300 border-zinc-700 flex items-center gap-1"
            >
              {t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                disabled={isSubmitting}
                className="hover:text-red-400 transition disabled:opacity-50"
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Show author name for all rules now */}
      <div className="space-y-1">
        <label htmlFor="authorName" className="text-sm font-medium text-zinc-400">
          Author Name
        </label>
        <input
          id="authorName"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Enter your name"
          disabled={true}
          className="flex h-8 w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-sm ring-offset-background text-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:font-['Poppins'] placeholder:text-zinc-400 placeholder:italic placeholder:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        />
        <p className="text-xs text-zinc-500">Author name is automatically set based on your account.</p>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting || Object.keys(errors).length > 0}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors duration-200"
      >
        {buttonText}
      </Button>
    </form>
  );
} 