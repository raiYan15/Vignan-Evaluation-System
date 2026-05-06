import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, GitCompareArrows, Loader2, ChevronDown } from "lucide-react";
import { searchAnswers, compareAnswer, type SearchResult, type CompareResult, ApiError } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export default function WebSearch() {
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const [studentAnswer, setStudentAnswer] = useState("");
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearchLoading(true);
    try {
      const res = await searchAnswers(query);
      setSearchResults(res);
    } catch (err: unknown) {
      toast({
        title: "Search failed",
        description: err instanceof ApiError ? err.detail : "Backend unavailable.",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!studentAnswer.trim()) return;
    setCompareLoading(true);
    try {
      const res = await compareAnswer(studentAnswer);
      setCompareResult(res);
    } catch (err: unknown) {
      toast({
        title: "Compare failed",
        description: err instanceof ApiError ? err.detail : "Backend unavailable.",
        variant: "destructive",
      });
    } finally {
      setCompareLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Web Search Assistant</h1>
        <p className="page-subtitle">Search reference answers or compare student responses</p>
      </div>

      <Tabs defaultValue="search" className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="search" className="gap-2">
            <SearchIcon className="w-3.5 h-3.5" /> Search
          </TabsTrigger>
          <TabsTrigger value="compare" className="gap-2">
            <GitCompareArrows className="w-3.5 h-3.5" /> Compare
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for reference answers…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-secondary/50 border-border/50"
            />
            <Button onClick={handleSearch} disabled={searchLoading || !query.trim()}>
              {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
            </Button>
          </div>

          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div {...fadeUp} className="space-y-2">
                {searchResults.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card overflow-hidden"
                  >
                    <div className="w-full p-4 flex items-start justify-between text-left">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading font-semibold text-sm truncate mb-1">{r.title}</h4>
                        <span className="text-xs text-muted-foreground">{Math.round(r.relevance * 100)}% relevant</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                        aria-label={expandedIdx === i ? "Collapse result" : "Expand result"}
                        className="ml-3"
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-muted-foreground transition-transform ${expandedIdx === i ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>
                    {expandedIdx === i && (
                      <div className="px-4 pb-4 text-sm text-secondary-foreground leading-relaxed border-t border-border/20 pt-3">
                        {r.snippet}
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="compare" className="space-y-4">
          <div className="glass-card p-5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Student Answer</label>
            <Textarea
              placeholder="Paste the student's answer here for comparison…"
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              rows={5}
              className="bg-secondary/50 border-border/50 text-sm mb-3"
            />
            <Button onClick={handleCompare} disabled={compareLoading || !studentAnswer.trim()}>
              {compareLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GitCompareArrows className="w-4 h-4 mr-2" />}
              Compare
            </Button>
          </div>

          <AnimatePresence>
            {compareResult && (
              <motion.div {...fadeUp} className="space-y-4">
                <div className="glass-card p-5 gradient-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Average Similarity</p>
                  <p className="text-4xl font-heading font-bold gradient-text">
                    {Math.round(compareResult.average_similarity * 100)}%
                  </p>
                </div>

                {compareResult.matching_concepts.length > 0 && (
                  <div className="glass-card p-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Matching Concepts</p>
                    <div className="flex flex-wrap gap-2">
                      {compareResult.matching_concepts.map((c, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {compareResult.similarities.length > 0 && (
                  <div className="glass-card p-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Source Similarities</p>
                    <div className="space-y-2">
                      {compareResult.similarities.map((s, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="truncate max-w-[70%]">{s.source}</span>
                          <span className="font-semibold">{Math.round(s.score * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
