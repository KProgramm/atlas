// A small curated set of well-known problems for the Add Problem
// typeahead (app/problems/AddProblemForm.tsx). Picking an entry here
// auto-fills difficulty/pattern/URL/description so titles stay correct
// instead of relying on the user typing "Remove Duplicates" when the
// real title is "Remove Duplicates from Sorted Array".
//
// This is a hand-picked list, not a live LeetCode integration -- that's
// the V1.5 POST /api/sync/leetcode endpoint from the planning doc.
// Descriptions here are short original paraphrases of what each problem
// asks, not copied from LeetCode's own problem text.
//
// Not exhaustive on purpose: picking any title not in this list is still
// allowed (the form falls back to a free-text custom entry), this just
// makes the common case easy and correct by default.

export type CatalogEntry = {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  pattern: string;
  slug: string;
  description: string;
  url: string;
};

type RawEntry = Omit<CatalogEntry, "url">;

function withUrl(entry: RawEntry): CatalogEntry {
  return { ...entry, url: `https://leetcode.com/problems/${entry.slug}/` };
}

const RAW_CATALOG: RawEntry[] = [
  // Arrays & Hashing
  { title: "Two Sum", difficulty: "Easy", pattern: "Arrays & Hashing", slug: "two-sum", description: "Given an array of integers, find the two numbers that add up to a target value and return their indices." },
  { title: "Contains Duplicate", difficulty: "Easy", pattern: "Arrays & Hashing", slug: "contains-duplicate", description: "Determine whether any value appears more than once in an array." },
  { title: "Valid Anagram", difficulty: "Easy", pattern: "Arrays & Hashing", slug: "valid-anagram", description: "Check whether one string is a rearrangement of the letters of another." },
  { title: "Group Anagrams", difficulty: "Medium", pattern: "Arrays & Hashing", slug: "group-anagrams", description: "Given a list of strings, group the ones that are anagrams of each other." },
  { title: "Top K Frequent Elements", difficulty: "Medium", pattern: "Arrays & Hashing", slug: "top-k-frequent-elements", description: "Return the k most frequently occurring elements in an array." },
  { title: "Product of Array Except Self", difficulty: "Medium", pattern: "Arrays & Hashing", slug: "product-of-array-except-self", description: "Build an array where each element is the product of every other element, without using division." },
  { title: "Longest Consecutive Sequence", difficulty: "Medium", pattern: "Arrays & Hashing", slug: "longest-consecutive-sequence", description: "Find the length of the longest run of consecutive integers in an unsorted array." },
  { title: "Remove Duplicates from Sorted Array", difficulty: "Easy", pattern: "Arrays & Hashing", slug: "remove-duplicates-from-sorted-array", description: "Given a sorted array, remove duplicate values in place and return the new length." },

  // Two Pointers
  { title: "Valid Palindrome", difficulty: "Easy", pattern: "Two Pointers", slug: "valid-palindrome", description: "Check whether a string reads the same forward and backward, ignoring non-alphanumeric characters and case." },
  { title: "Two Sum II - Input Array Is Sorted", difficulty: "Medium", pattern: "Two Pointers", slug: "two-sum-ii-input-array-is-sorted", description: "Like Two Sum, but the array is already sorted, so you can solve it without extra space." },
  { title: "3Sum", difficulty: "Medium", pattern: "Two Pointers", slug: "3sum", description: "Find all unique triplets in an array that sum to zero." },
  { title: "Container With Most Water", difficulty: "Medium", pattern: "Two Pointers", slug: "container-with-most-water", description: "Given heights of vertical lines, find the pair that traps the most water between them." },
  { title: "Trapping Rain Water", difficulty: "Hard", pattern: "Two Pointers", slug: "trapping-rain-water", description: "Given an elevation map, compute how much rainwater it can trap after it rains." },

  // Sliding Window
  { title: "Best Time to Buy and Sell Stock", difficulty: "Easy", pattern: "Sliding Window", slug: "best-time-to-buy-and-sell-stock", description: "Given daily prices, find the maximum profit from buying once and selling once later." },
  { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", pattern: "Sliding Window", slug: "longest-substring-without-repeating-characters", description: "Find the length of the longest substring that has no repeated characters." },
  { title: "Longest Repeating Character Replacement", difficulty: "Medium", pattern: "Sliding Window", slug: "longest-repeating-character-replacement", description: "Find the longest substring you can make all one character by replacing at most k characters." },
  { title: "Minimum Window Substring", difficulty: "Hard", pattern: "Sliding Window", slug: "minimum-window-substring", description: "Find the smallest substring of one string that contains every character of another string." },

  // Stack
  { title: "Valid Parentheses", difficulty: "Easy", pattern: "Stack", slug: "valid-parentheses", description: "Check whether a string of brackets is properly opened and closed in the right order." },
  { title: "Min Stack", difficulty: "Medium", pattern: "Stack", slug: "min-stack", description: "Design a stack that can return its minimum element in constant time." },
  { title: "Evaluate Reverse Polish Notation", difficulty: "Medium", pattern: "Stack", slug: "evaluate-reverse-polish-notation", description: "Evaluate an arithmetic expression written in postfix (Reverse Polish) notation." },
  { title: "Generate Parentheses", difficulty: "Medium", pattern: "Backtracking", slug: "generate-parentheses", description: "Generate every valid combination of n pairs of parentheses." },
  { title: "Daily Temperatures", difficulty: "Medium", pattern: "Stack", slug: "daily-temperatures", description: "For each day, find how many days you'd have to wait for a warmer temperature." },

  // Binary Search
  { title: "Binary Search", difficulty: "Easy", pattern: "Binary Search", slug: "binary-search", description: "Find the index of a target value in a sorted array." },
  { title: "Search in Rotated Sorted Array", difficulty: "Medium", pattern: "Binary Search", slug: "search-in-rotated-sorted-array", description: "Find a target value in a sorted array that's been rotated at an unknown pivot." },
  { title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", pattern: "Binary Search", slug: "find-minimum-in-rotated-sorted-array", description: "Find the smallest element in a sorted array that's been rotated." },

  // Linked List
  { title: "Reverse Linked List", difficulty: "Easy", pattern: "Linked List", slug: "reverse-linked-list", description: "Reverse a singly linked list in place." },
  { title: "Merge Two Sorted Lists", difficulty: "Easy", pattern: "Linked List", slug: "merge-two-sorted-lists", description: "Merge two sorted linked lists into one sorted list." },
  { title: "Linked List Cycle", difficulty: "Easy", pattern: "Linked List", slug: "linked-list-cycle", description: "Determine whether a linked list has a cycle in it." },
  { title: "Reorder List", difficulty: "Medium", pattern: "Linked List", slug: "reorder-list", description: "Reorder a linked list by interleaving nodes from the front and back." },
  { title: "Remove Nth Node From End of List", difficulty: "Medium", pattern: "Linked List", slug: "remove-nth-node-from-end-of-list", description: "Remove the nth node from the end of a linked list in one pass." },
  { title: "Merge k Sorted Lists", difficulty: "Hard", pattern: "Linked List", slug: "merge-k-sorted-lists", description: "Merge k sorted linked lists into a single sorted list." },

  // Trees
  { title: "Invert Binary Tree", difficulty: "Easy", pattern: "Trees", slug: "invert-binary-tree", description: "Flip a binary tree into its mirror image." },
  { title: "Maximum Depth of Binary Tree", difficulty: "Easy", pattern: "Trees", slug: "maximum-depth-of-binary-tree", description: "Find the length of the longest path from the root to a leaf." },
  { title: "Same Tree", difficulty: "Easy", pattern: "Trees", slug: "same-tree", description: "Check whether two binary trees are structurally identical with the same values." },
  { title: "Binary Tree Level Order Traversal", difficulty: "Medium", pattern: "Trees", slug: "binary-tree-level-order-traversal", description: "Return the values of a binary tree grouped level by level." },
  { title: "Validate Binary Search Tree", difficulty: "Medium", pattern: "Trees", slug: "validate-binary-search-tree", description: "Check whether a binary tree satisfies the binary search tree property." },
  { title: "Lowest Common Ancestor of a Binary Search Tree", difficulty: "Medium", pattern: "Trees", slug: "lowest-common-ancestor-of-a-binary-search-tree", description: "Find the lowest node that has two given nodes as descendants in a BST." },
  { title: "Kth Smallest Element in a BST", difficulty: "Medium", pattern: "Trees", slug: "kth-smallest-element-in-a-bst", description: "Find the kth smallest value in a binary search tree." },
  { title: "Binary Tree Maximum Path Sum", difficulty: "Hard", pattern: "Trees", slug: "binary-tree-maximum-path-sum", description: "Find the maximum sum of any path between two nodes in a binary tree." },

  // Tries
  { title: "Implement Trie (Prefix Tree)", difficulty: "Medium", pattern: "Tries", slug: "implement-trie-prefix-tree", description: "Build a data structure that supports inserting and searching strings by prefix." },

  // Heap
  { title: "Kth Largest Element in an Array", difficulty: "Medium", pattern: "Heap", slug: "kth-largest-element-in-an-array", description: "Find the kth largest element in an unsorted array." },
  { title: "Find Median from Data Stream", difficulty: "Hard", pattern: "Heap", slug: "find-median-from-data-stream", description: "Support adding numbers one at a time while being able to return the running median." },

  // Backtracking
  { title: "Subsets", difficulty: "Medium", pattern: "Backtracking", slug: "subsets", description: "Generate every possible subset of a set of distinct numbers." },
  { title: "Combination Sum", difficulty: "Medium", pattern: "Backtracking", slug: "combination-sum", description: "Find all combinations of numbers from a list that sum to a target, reusing numbers freely." },
  { title: "Permutations", difficulty: "Medium", pattern: "Backtracking", slug: "permutations", description: "Generate every possible ordering of a list of distinct numbers." },
  { title: "Word Search", difficulty: "Medium", pattern: "Backtracking", slug: "word-search", description: "Determine whether a word can be traced through adjacent letters in a grid." },

  // Graphs
  { title: "Number of Islands", difficulty: "Medium", pattern: "Graphs", slug: "number-of-islands", description: "Count the number of connected groups of land in a 2D grid." },
  { title: "Clone Graph", difficulty: "Medium", pattern: "Graphs", slug: "clone-graph", description: "Create a deep copy of a connected undirected graph." },
  { title: "Course Schedule", difficulty: "Medium", pattern: "Graphs", slug: "course-schedule", description: "Determine whether it's possible to finish all courses given their prerequisites (cycle detection)." },
  { title: "Pacific Atlantic Water Flow", difficulty: "Medium", pattern: "Graphs", slug: "pacific-atlantic-water-flow", description: "Find cells in a grid from which water can flow to both the Pacific and Atlantic edges." },

  // 1D DP
  { title: "Climbing Stairs", difficulty: "Easy", pattern: "1D DP", slug: "climbing-stairs", description: "Count how many distinct ways you can climb n stairs taking 1 or 2 steps at a time." },
  { title: "House Robber", difficulty: "Medium", pattern: "1D DP", slug: "house-robber", description: "Find the maximum amount you can rob from houses in a row without robbing two adjacent ones." },
  { title: "House Robber II", difficulty: "Medium", pattern: "1D DP", slug: "house-robber-ii", description: "Like House Robber, but the houses are arranged in a circle." },
  { title: "Coin Change", difficulty: "Medium", pattern: "1D DP", slug: "coin-change", description: "Find the fewest coins needed to make a target amount from a set of denominations." },
  { title: "Longest Increasing Subsequence", difficulty: "Medium", pattern: "1D DP", slug: "longest-increasing-subsequence", description: "Find the length of the longest strictly increasing subsequence in an array." },
  { title: "Word Break", difficulty: "Medium", pattern: "1D DP", slug: "word-break", description: "Determine whether a string can be split into words from a given dictionary." },
  { title: "Decode Ways", difficulty: "Medium", pattern: "1D DP", slug: "decode-ways", description: "Count how many ways a string of digits can be decoded into letters." },

  // 2D DP
  { title: "Unique Paths", difficulty: "Medium", pattern: "2D DP", slug: "unique-paths", description: "Count the number of paths from one corner of a grid to the other, moving only right or down." },
  { title: "Longest Common Subsequence", difficulty: "Medium", pattern: "2D DP", slug: "longest-common-subsequence", description: "Find the length of the longest subsequence shared by two strings." },

  // Greedy
  { title: "Maximum Subarray", difficulty: "Medium", pattern: "Greedy", slug: "maximum-subarray", description: "Find the contiguous subarray with the largest sum." },
  { title: "Jump Game", difficulty: "Medium", pattern: "Greedy", slug: "jump-game", description: "Determine whether you can reach the last index of an array given max-jump values at each position." },

  // Intervals
  { title: "Insert Interval", difficulty: "Medium", pattern: "Intervals", slug: "insert-interval", description: "Insert a new interval into a sorted list of non-overlapping intervals, merging as needed." },
  { title: "Merge Intervals", difficulty: "Medium", pattern: "Intervals", slug: "merge-intervals", description: "Merge all overlapping intervals in a list." },
  { title: "Non-overlapping Intervals", difficulty: "Medium", pattern: "Intervals", slug: "non-overlapping-intervals", description: "Find the minimum number of intervals to remove so the rest don't overlap." },

  // Matrix
  { title: "Rotate Image", difficulty: "Medium", pattern: "Matrix", slug: "rotate-image", description: "Rotate an n x n matrix 90 degrees in place." },
  { title: "Spiral Matrix", difficulty: "Medium", pattern: "Matrix", slug: "spiral-matrix", description: "Return all elements of a matrix in spiral order." },
  { title: "Set Matrix Zeroes", difficulty: "Medium", pattern: "Matrix", slug: "set-matrix-zeroes", description: "If an element in a matrix is zero, set its entire row and column to zero, in place." },

  // Bit Manipulation
  { title: "Number of 1 Bits", difficulty: "Easy", pattern: "Bit Manipulation", slug: "number-of-1-bits", description: "Count the number of set bits (1s) in the binary representation of an integer." },
  { title: "Counting Bits", difficulty: "Easy", pattern: "Bit Manipulation", slug: "counting-bits", description: "For every number from 0 to n, count how many 1 bits it has in binary." },
  { title: "Missing Number", difficulty: "Easy", pattern: "Bit Manipulation", slug: "missing-number", description: "Find the one number missing from an array containing n distinct numbers from 0 to n." },
];

export const PROBLEM_CATALOG: CatalogEntry[] = RAW_CATALOG.map(withUrl);
