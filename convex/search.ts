import { query } from "./_generated/server";
import { v } from "convex/values";



function highlightMatches(text: string, searchTerm: string): string {
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function countMatches(text: string, searchTerm: string): number {
  const regex = new RegExp(searchTerm, 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

export const searchArticles = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const { searchTerm } = args;

    let articles = await ctx.db.query("newsArticles")
    .withSearchIndex("search_title", (q) => q.search("title", searchTerm))
    .collect()

    return articles
  },
});

export const getTags = query({
  handler: async (ctx) => {
    const articles = await ctx.db.query("newsArticles").collect();
    const tags = new Set(articles.flatMap(a => a.tags));
    return Array.from(tags);
  },
});

export const exploreArticles = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const { searchTerm } = args;

    const articles = await ctx.db
      .query("newsArticles")
      .withSearchIndex("search_title", (q) => q.search("title", searchTerm))
      .collect();

    const processedArticles = articles.map(article => {
      const titleMatches = countMatches(article.title, searchTerm);
      const contentMatches = countMatches(article.content, searchTerm);
      const tagMatches = article.tags.reduce((sum, tag) => sum + countMatches(tag, searchTerm), 0);
      const totalMatches = titleMatches + contentMatches + tagMatches;

      return {
        ...article,
        highlights: {
          title: highlightMatches(article.title, searchTerm),
          content: highlightMatches(article.content.substring(0, 200) + "...", searchTerm),
          tags: article.tags.map(tag => highlightMatches(tag, searchTerm))
        },
        matchCount: totalMatches,
        relevanceScore: titleMatches * 3 + contentMatches + tagMatches * 2 // Weighting relevance
      };
    });

    // Sort by relevance score (descending)
    processedArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return processedArticles;
  },
});
