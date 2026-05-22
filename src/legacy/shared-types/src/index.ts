export type Locale = 'zh' | 'en';

export interface StaticContentFrontmatter {
  slug: string;
  locale: Locale;
  title: string;
  summary: string;
  heroImage: string;
  updatedAt: string;
  tags: string[];
  published: boolean;
}

export interface HeroMetric {
  label: string;
  value: string;
}

export interface ResumeExperience {
  company: string;
  role: string;
  period: string;
  summary: string;
  highlights: string[];
}

export interface ResumeSkillGroup {
  title: string;
  items: string[];
}

export interface ResumeProject {
  title: string;
  role: string;
  period: string;
  summary: string;
  stack: string[];
  highlights: string[];
  showcase?: ResumeProjectShowcase;
}

export type ResumeProjectShowcaseBlockType = 'image' | 'text' | 'placeholder';
export type ResumeProjectShowcaseSectionStatus = 'ready' | 'placeholder';

export interface ResumeProjectShowcaseBlock {
  type: ResumeProjectShowcaseBlockType;
  title: string;
  body?: string;
  imageSrc?: string;
  imageAlt?: string;
  caption?: string;
  groupKey?: string;
}

export interface ResumeProjectShowcaseSection {
  key: string;
  title: string;
  status: ResumeProjectShowcaseSectionStatus;
  summary: string;
  blocks: ResumeProjectShowcaseBlock[];
}

export interface ResumeProjectShowcase {
  id: string;
  slug: string;
  entryLabel: string;
  collapseLabel: string;
  defaultSectionKey: string;
  sections: ResumeProjectShowcaseSection[];
}

export interface ResumeEducation {
  school: string;
  degree: string;
  period: string;
}

export interface ResumeLanguage {
  name: string;
  proficiency: string;
}

export interface ResumeLabels {
  profile: string;
  location: string;
  gender: string;
  age: string;
  drivingLicense: string;
  professionalSummary: string;
  projectExperience: string;
  employmentHistory: string;
  competences: string;
  education: string;
  languages: string;
  focus: string;
  showcaseReady: string;
  showcaseComingSoon: string;
  openImage: string;
}

export interface ResumeProfile {
  locale: Locale;
  name: string;
  title: string;
  headline: string;
  location: string;
  gender: string;
  age: string;
  contactEmail: string;
  intro: string;
  heroMetrics: HeroMetric[];
  summaryPoints: string[];
  projects: ResumeProject[];
  experiences: ResumeExperience[];
  skillGroups: ResumeSkillGroup[];
  education: ResumeEducation[];
  languages: ResumeLanguage[];
  labels: ResumeLabels;
  focus: string;
  drivingLicense?: string;
}

export interface ArchitectureCase extends StaticContentFrontmatter {
  challenge: string;
  stack: string[];
  outcomes: string[];
  body: string;
}

export interface TopicShowcase extends StaticContentFrontmatter {
  eyebrow: string;
  cta: string;
  sections: {
    title: string;
    description: string;
  }[];
  body: string;
}

export interface BookRecommendation {
  slug: string;
  locale: Locale;
  title: string;
  originalTitle?: string;
  author?: string;
  category: string;
  summary: string;
  takeaway: string;
  recommendation: string;
  quote?: string;
  coverImage?: string;
  featured: boolean;
}

export type PostStatus = 'draft' | 'published';

export interface PublicPost extends StaticContentFrontmatter {
  id: string;
  body: string;
  series?: string;
  status: PostStatus;
}

export interface PublicPostSummary extends Omit<PublicPost, 'body'> {}

export interface FeaturedPayload {
  metrics: HeroMetric[];
  featuredCases: ArchitectureCase[];
  recentPosts: PublicPostSummary[];
  topicCards: TopicShowcase[];
}

export interface CreatePostDto {
  slug: string;
  locale: Locale;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  heroImage: string;
  published?: boolean;
  series?: string;
}

export interface UpdatePostDto extends Partial<CreatePostDto> {}

export interface TagSummary {
  name: string;
  count: number;
}

export interface SeriesSummary {
  name: string;
  description: string;
  count: number;
}

export interface MediaAssetDto {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  createdAt: string;
}

export type RecipeCategory = 'muscle' | 'fat-loss' | 'balanced';
export type RecipeTag = 'high-protein' | 'low-fat' | 'quick';
export type RecipeDifficulty = 'easy' | 'medium' | 'hard';
export type RecipeSource = 'md' | 'api';

export interface RecipeIngredient {
  name: string;
  amount: string;
  note?: string;
}

export interface RecipeStep {
  title: string;
  bullets: string[];
}

export interface RecipeSummary {
  slug: string;
  locale: Locale;
  title: string;
  summary: string;
  category: RecipeCategory;
  tags: RecipeTag[];
  durationMinutes: number;
  difficulty: RecipeDifficulty;
  calories?: number;
  coverImage?: string;
  updatedAt: string;
  source: RecipeSource;
}

export interface RecipeDetail extends RecipeSummary {
  servings: string;
  ingredients: RecipeIngredient[];
  seasonings: RecipeIngredient[];
  sauce: RecipeIngredient[];
  steps: RecipeStep[];
  tips: string[];
  nutritionNotes: string[];
  methodImage?: string;
  downloadFileName?: string;
  html: string;
}

export interface RecipeQuery {
  locale?: Locale;
  category?: RecipeCategory;
  tag?: RecipeTag;
  search?: string;
  page?: number;
  pageSize?: number;
}
